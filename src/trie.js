import * as utils from "utils.js"

class Node {

    difference(other, shift) {
        if (this === other) {
            return null;
        } else {
            if (other !== null) {
                return this.differenceImpl(other, shift);
            } else {
                return this;
            }
        }
    }

    differenceToEntry(other, shift) {
        const thisEntry = this.getEntry(shift, other.keyHash, other.key);
        if (thisEntry === undefined) {
            return this;
        } else if (thisEntry === other ||
                   utils.is(thisEntry.value, other.value)) {
            return this.dissoc(shift, other.keyHash, other.key);
        } else {
            return this;
        }
    }
}

export class Entry extends Node {

    constructor(keyHash, key, value) {
        super();
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
                return null;
            } else {
                return this;
            }
        } else {
            const otherE = other.getEntry(shift, this.keyHash, this.key);
            if (otherE === undefined) {
                return this;
            } else if (utils.is(this, otherE) ||
                       utils.is(this.value, otherE.value)) {
                return null;
            } else {
                return this;
            }
        }
    }
}

export class ArrayNode extends Node {

    constructor(children, childrenCount, entryCount) {
        super();
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

                    if (returnChild == undefined) {
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
}

export class CollisionNode extends Node {

    constructor(children, keyHash) {
        super();
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
            return this.differenceToEntry(other);
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
                return null;
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

// 
// private fun differenceA(lNode: ArrayNode, rNode: Any, shift: Int): Any? {
//     return when (rNode) {
//         is ArrayNode -> {
//             val children = arrayOfNulls<Any>(32)
//             var childrenCount = 0
//             var entryCount = 0
//             var returnLeftNode = true
//             for (i in 0..31) {
//                 val lChild = lNode.children[i]
//                 val rChild = rNode.children[i]
//                 val child = difference(lChild, rChild, shift + 5)
//                 children[i] = child
//                 if (child != null) {
//                     childrenCount ++
//                     entryCount += countEntries(child)
//                 }
//                 if (child != lChild) {
//                     returnLeftNode = false
//                 }
//             }
// 
//             if (childrenCount == 0) {
//                 null
//             } else if (returnLeftNode) {
//                 lNode
//             } else {
//                 // If only one child left and it is not an ArrayNode,
//                 // we should return this child, instead
//                 val lastChild = if (childrenCount == 1) {
//                     children.firstOrNull { it != null && it !is ArrayNode }
//                 } else {
//                     null
//                 }
// 
//                 if (lastChild == null) {
//                     ArrayNode(children, childrenCount, entryCount)
//                 } else {
//                     lastChild
//                 }
//             }
//         }
//         is Entry -> differenceXE(lNode, rNode, shift)
//         is CollisionNode -> {
//             rNode.children.fold(lNode,
//                 fun(result: Any, rEntry: Entry): Any {
//                     val lEntry = getEntry(
//                         result, shift, rEntry.keyHash, rEntry.key)
//                     return if (lEntry != null
//                                && (lEntry === rEntry
//                                    || lEntry.value == rEntry.value)) {
//                         dissoc(result, shift, rEntry.keyHash, rEntry.key)!!
//                     } else {
//                         result
//                     }
//                 })
//         }
//         else -> throw UnsupportedOperationException()
//     }
// }
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
