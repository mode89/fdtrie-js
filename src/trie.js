import * as utils from "utils.js"

export class Entry {

    constructor(keyHash, key, value) {
        this.keyHash = keyHash;
        this.key = key;
        this.value = value;
    }

    countEntries() {
        return 1;
    }

    assoc(shift, entry) {
        if (utils.is(this.key, entry.key)) {
            if (utils.is(this.value, entry.value))
                return this;
            else
                return entry;
        } else {
            if (this.keyHash == entry.keyHash) {
                return new CollisionNode([this, entry], this.keyHash);
            } else {
                return makeArrayNode(this, shift).assoc(shift, entry);
            }
        }
    }

    getEntry(shift, keyHash, key) {
        if (this.keyHash == keyHash && utils.is(this.key, key)) {
            return this;
        } else {
            return undefined;
        }
    }

    dissoc(shift, keyHash, key) {
        if (this.keyHash == keyHash && utils.is(this.key, key)) {
            return undefined;
        } else {
            return this;
        }
    }

    differenceImpl(other, shift) {
        if (other instanceof Entry) {
            if (utils.is(this.key, other.key) &&
                utils.is(this.value, other.value)) {
                return undefined;
            } else {
                return this;
            }
        } else {
            const otherE = other.getEntry(shift, this.keyHash, this.key);
            if (otherE === undefined) {
                return this;
            } else if (utils.is(this, otherE) ||
                       utils.is(this.value, otherE.value)) {
                return undefined;
            } else {
                return this;
            }
        }
    }
}

export class ArrayNode {

    constructor(children, childrenCount, entryCount) {
        this.children = children;
        this.childrenCount = childrenCount;
        this.entryCount = entryCount;
    }

    countEntries() {
        return this.entryCount;
    }

    assoc(shift, entry) {
        const childIndex = arrayIndex(shift, entry.keyHash);
        const child = this.children[childIndex];
        if (child === undefined) {
            return new ArrayNode(
                utils.immArraySet(this.children, childIndex, entry),
                this.childrenCount + 1,
                this.entryCount + 1);
        } else {
            const newChild = child.assoc(shift + 5, entry);
            if (child === newChild) {
                return this;
            } else {
                return new ArrayNode(
                    utils.immArraySet(this.children, childIndex, newChild),
                    this.childrenCount,
                    this.entryCount
                        + newChild.countEntries()
                        - child.countEntries());
            }
        }
    }

    getEntry(shift, keyHash, key) {
        const childIndex = arrayIndex(shift, keyHash);
        const child = this.children[childIndex];
        if (child !== undefined) {
            return child.getEntry(shift + 5, keyHash, key);
        } else {
            return undefined;
        }
    }

    dissoc(shift, keyHash, key) {
        const childIndex = arrayIndex(shift, keyHash);
        const child = this.children[childIndex];
        if (child !== undefined) {
            const newChild = child.dissoc(shift + 5, keyHash, key);
            if (child === newChild) {
                return this;
            } else {
                const newChildrenCount = (newChild !== undefined)
                    ? this.childrenCount
                    : (this.childrenCount - 1);

                if (newChildrenCount == 0) {
                    throw "If no children left, that means the ArrayNode "
                        + "had only one entry undef it, which isn't allowed";
                } else {
                    // If only one child left and it isn't an ArrayNode,
                    // we should return this child, instead
                    if (newChildrenCount == 1) {
                        if (newChild !== undefined) {
                            var returnChild = newChild instanceof ArrayNode
                                ? undefined
                                : newChild;
                        } else {
                            // Should always succeed, because ArrayNode must
                            // have at least two entries under it
                            const lastChild = this.children
                                .find(it => it !== undefined && it !== child);
                            var returnChild = lastChild instanceof ArrayNode
                                ? undefined
                                : lastChild;
                        }
                    } else {
                        var returnChild = undefined;
                    }

                    if (returnChild === undefined) {
                        return new ArrayNode(
                            utils.immArraySet(
                                this.children, childIndex, newChild),
                            newChildrenCount,
                            this.entryCount - 1);
                    } else {
                        return returnChild;
                    }
                }
            }
        } else {
            return this;
        }
    }

    differenceImpl(other, shift) {
        switch (other.constructor) {
            case ArrayNode: {
                const children = new Array(32);
                var childrenCount = 0;
                var entryCount = 0;
                var returnThis = true;
                for (let i = 0; i < 32; i ++) {
                    const thisChild = this.children[i];
                    const otherChild = other.children[i];
                    const newChild = difference(
                        thisChild, otherChild, shift + 5);
                    children[i] = newChild;
                    if (newChild !== undefined) {
                        childrenCount ++;
                        entryCount += newChild.countEntries();
                    }
                    if (newChild !== thisChild) {
                        returnThis = false;
                    }
                }

                if (childrenCount == 0) {
                    return undefined;
                } else if (returnThis) {
                    return this;
                } else {
                    // If only one child left and it is not an ArrayNode,
                    // we should return this child, instead
                    const lastChild = childrenCount == 1
                        ? children.find(
                            it => (it !== undefined) &&
                                  !(it instanceof ArrayNode))
                        : undefined;

                    return lastChild === undefined
                        ? new ArrayNode(children, childrenCount, entryCount)
                        : lastChild;
                }
            }
            case Entry:
                return differenceToEntry(this, other, shift);
            case CollisionNode:
                return other.children.reduce(
                    (result, otherEntry) => {
                        const thisEntry = result.getEntry(
                            shift, otherEntry.keyHash, otherEntry.key);
                        if (thisEntry !== undefined
                            && (thisEntry === otherEntry
                                || utils.is(
                                    thisEntry.value,
                                    otherEntry.value))) {
                            return result.dissoc(
                                shift, otherEntry.keyHash, otherEntry.key);
                        } else {
                            return result;
                        }
                    }, this);
            default: throw "Unexpected type of node";
        }
    }
}

export class CollisionNode {

    constructor(children, keyHash) {
        this.children = children;
        this.keyHash = keyHash;
    }

    countEntries() {
        return this.children.length;
    }

    assoc(shift, entry) {
        if (this.keyHash == entry.keyHash) {
            const childIndex = this.children
                .findIndex(ch => utils.is(ch.key, entry.key));
            if (childIndex == -1) {
                return new CollisionNode(
                    utils.immArrayAdd(this.children, entry),
                    this.keyHash);
            } else {
                const child = this.children[childIndex];
                if (utils.is(child.value, entry.value)) {
                    return this;
                } else {
                    return new CollisionNode(
                        utils.immArraySet(this.children, childIndex, entry),
                        this.keyHash);
                }
            }
        } else {
            return makeArrayNode(this, shift).assoc(shift, entry);
        }
    }

    getEntry(shift, keyHash, key) {
        if (this.keyHash === keyHash) {
            return this.children.find(it => utils.is(it.key, key));
        } else {
            return undefined;
        }
    }

    dissoc(shift, keyHash, key) {
        if (this.keyHash != keyHash) {
            return this;
        } else {
            const childIndex = this.children
                .findIndex(ch => utils.is(ch.key, key));
            if (childIndex == -1) {
                return this;
            } else {
                if (this.children.length > 2) {
                    return new CollisionNode(
                        utils.immArrayRemove(this.children, childIndex),
                        keyHash);
                } else {
                    // Should always succeed, because CollisionNode must
                    // have at least two children
                    return this.children.find(ch => !utils.is(ch.key, key))
                }
            }
        }
    }

    differenceImpl(other, shift) {
        if (other instanceof Entry) {
            return differenceToEntry(this, other, shift);
        } else {
            const children = this.children.filter(
                thisEntry => {
                    const otherEntry = other.getEntry(
                        shift, thisEntry.keyHash, thisEntry.key);
                    return otherEntry === undefined
                        ? true
                        : !utils.is(thisEntry.value, otherEntry.value);
                })
            if (children.length == 0) {
                return undefined;
            } else if (children.length == 1) {
                return children[0];
            } else if (children.length == this.children.length) {
                return this;
            } else {
                return new CollisionNode(children, this.keyHash);
            }
        }
    }
}

export function difference(lNode, rNode, shift) {
    if (lNode === rNode) {
        return undefined;
    } else if (lNode !== undefined && rNode !== undefined) {
        return lNode.differenceImpl(rNode, shift);
    } else {
        return lNode;
    }
}

function differenceToEntry(rNode, lEntry, shift) {
    const rEntry = rNode.getEntry(shift, lEntry.keyHash, lEntry.key);
    if (rEntry === undefined) {
        return rNode;
    } else if (rEntry === lEntry ||
               utils.is(rEntry.value, lEntry.value)) {
        return rNode.dissoc(shift, lEntry.keyHash, lEntry.key);
    } else {
        return rNode;
    }
}

// 
// fun intersect(lNode: Any?, rNode: Any?, shift: Int): Any? {
//     return if (lNode === rNode) {
//         lNode
//     } else if (lNode != null && rNode != null) {
//         when (lNode) {
//             is ArrayNode -> intersectA(lNode, rNode, shift)
//             is Entry -> intersectE(lNode, rNode, shift)
//             is CollisionNode -> intersectC(lNode, rNode, shift)
//             else -> throw UnsupportedOperationException()
//         }
//     } else {
//         null
//     }
// }
// 
// private fun intersectA(lNode: ArrayNode, rNode: Any, shift: Int): Any? {
//     return when (rNode) {
//         is ArrayNode -> {
//             if (lNode.entryCount > rNode.entryCount) {
//                 intersect(rNode, lNode, shift)
//             } else {
//                 val lChildren = lNode.children
//                 val rChildren = rNode.children
//                 val children = arrayOfNulls<Any>(32)
//                 var childrenCount = 0
//                 var entryCount = 0
//                 var returnLeftNode = true
//                 for (i in 0..31) {
//                     val lChild = lChildren[i]
//                     val rChild = rChildren[i]
//                     val child = intersect(lChild, rChild, shift + 5)
//                     children[i] = child
//                     if (child != null) {
//                         childrenCount += 1
//                         entryCount += countEntries(child)
//                     }
//                     if (child != lChild) {
//                         returnLeftNode = false
//                     }
//                 }
//                 if (childrenCount == 0) {
//                     null
//                 } else if (returnLeftNode) {
//                     lNode
//                 } else {
//                     val lastChild = if (childrenCount == 1) {
//                         children.firstOrNull(
//                             { it != null && it !is ArrayNode })
//                     } else {
//                         null
//                     }
// 
//                     if (lastChild == null) {
//                         ArrayNode(children, childrenCount, entryCount)
//                     } else {
//                         lastChild
//                     }
//                 }
//             }
//         }
//         is Entry, is CollisionNode -> intersect(rNode, lNode, shift)
//         else -> throw UnsupportedOperationException()
//     }
// }
// 
// private fun intersectE(lNode: Entry, rNode: Any, shift: Int): Any? {
//     return when (rNode) {
//         is ArrayNode, is CollisionNode -> {
//             val rEntry = getEntry(rNode, shift, lNode.keyHash, lNode.key)
//             if (rEntry == null) {
//                 null
//             } else if (lNode === rEntry || lNode.value == rEntry.value) {
//                 lNode
//             } else {
//                 null
//             }
//         }
//         is Entry -> {
//             if (lNode.key == rNode.key && lNode.value == rNode.value) {
//                 lNode
//             } else {
//                 null
//             }
//         }
//         else -> throw UnsupportedOperationException()
//     }
// }
// 
// private fun intersectC(lNode: CollisionNode, rNode: Any, shift: Int): Any? {
//     return when (rNode) {
//         is ArrayNode -> intersect(
//             lNode, getNodeByKeyHash(rNode, shift, lNode.keyHash), shift)
//         is Entry -> intersectE(rNode, lNode, shift)
//         is CollisionNode -> {
//             if (lNode.keyHash != rNode.keyHash) {
//                 null
//             } else if (lNode.children.size > rNode.children.size) {
//                 intersect(rNode, lNode, shift)
//             } else {
//                 val children = lNode.children.filter(
//                     { rNode.children.contains(it) })
//                 if (children.size == 0) {
//                     null
//                 } else if (children.size == 1) {
//                     children.get(0)
//                 } else if (children.size == lNode.children.size) {
//                     lNode
//                 } else {
//                     CollisionNode(children, lNode.keyHash)
//                 }
//             }
//         }
//         else -> throw UnsupportedOperationException()
//     }
// }
// 
// fun equiv(lNode: Any?, rNode: Any?, shift: Int): Boolean {
//     return if (lNode === rNode) {
//         true
//     } else if (lNode == null || rNode == null) {
//         false
//     } else {
//         when (lNode) {
//             is ArrayNode ->
//                 if (rNode is ArrayNode
//                     && lNode.entryCount == rNode.entryCount) {
//                     val lChildren = lNode.children
//                     val rChildren = rNode.children
//                     var result = true
//                     for (i in 0..31) {
//                         val lChild = lChildren[i]
//                         val rChild = rChildren[i]
//                         if (!equiv(lChild, rChild, shift + 5)) {
//                             result = false
//                             break
//                         }
//                     }
//                     result
//                 } else {
//                     false
//                 }
//             is Entry ->
//                 rNode is Entry
//                 && lNode.key == rNode.key
//                 && lNode.value == rNode.value
//             is CollisionNode ->
//                 if (rNode is CollisionNode
//                     && lNode.keyHash == rNode.keyHash
//                     && lNode.children.size == rNode.children.size) {
//                     lNode.children.containsAll(rNode.children)
//                 } else {
//                     false
//                 }
//             else -> throw UnsupportedOperationException()
//         }
//     }
// }
// 
// internal fun getNodeByKeyHash(node: Any, shift: Int, keyHash: Int): Any? {
//     return when (node) {
//         is ArrayNode -> {
//             val childIndex = arrayIndex(shift, keyHash)
//             val child = node.children[childIndex]
//             if (child == null) {
//                 null
//             } else {
//                 getNodeByKeyHash(child, shift + 5, keyHash)
//             }
//         }
//         is Entry, is CollisionNode ->
//             if (getKeyHash(node) == keyHash) node else null
//         else -> throw UnsupportedOperationException()
//     }
// }
// 

export function makeArrayNode(node, shift) {
    const children = new Array(32);
    const index = arrayIndex(shift, node.keyHash);
    children[index] = node;
    return new ArrayNode(children, 1, node.countEntries());
}

function arrayIndex(shift, keyHash) {
    return (keyHash >>> shift) & 0x1F;
}
