import * as utils from "./utils.js";

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
        if (utils.equal(this.key, entry.key)) {
            if (this.value === entry.value)
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
        if (this.keyHash == keyHash && utils.equal(this.key, key)) {
            return this;
        } else {
            return undefined;
        }
    }

    dissoc(shift, keyHash, key) {
        if (this.keyHash == keyHash && utils.equal(this.key, key)) {
            return undefined;
        } else {
            return this;
        }
    }

    differenceImpl(other, shift) {
        if (other instanceof Entry) {
            if (utils.equal(this.key, other.key) &&
                this.value === other.value) {
                return undefined;
            } else {
                return this;
            }
        } else {
            const otherE = other.getEntry(shift, this.keyHash, this.key);
            if (otherE === undefined) {
                return this;
            } else if (this === otherE ||
                       this.value === otherE.value) {
                return undefined;
            } else {
                return this;
            }
        }
    }

    reduceDifferenceImpl(other, acc, shift, onRemoved, onChanged, onAdded) {
        if (other instanceof Entry) {
            if (this.keyHash === other.keyHash) {
                if (utils.equal(this.key, other.key)) {
                    if (this.value !== other.value) {
                        return onChanged(this, other, acc);
                    } else {
                        return acc;
                    }
                } else {
                    acc = onRemoved(this, acc);
                    acc = onAdded(other, acc);
                    return acc;
                }
            } else {
                acc = onRemoved(this, acc);
                acc = onAdded(other, acc);
                return acc;
            }
        } else {
            var otherHasThisKey = false;
            other.forEach(otherE => {
                if (this.keyHash === otherE.keyHash) {
                    if (utils.equal(this.key, otherE.key)) {
                        otherHasThisKey = true;
                        if (this.value !== otherE.value) {
                            acc = onChanged(this, otherE, acc);
                        }
                    } else {
                        acc = onAdded(otherE, acc);
                    }
                } else {
                    acc = onAdded(otherE, acc);
                }
            });
            if (!otherHasThisKey) {
                acc = onRemoved(this, acc);
            }
            return acc;
        }
    }

    next(shift, prev) {
        return prev === undefined
            ? this
            : undefined;
    }

    forEach(callback) {
        callback(this);
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
                    var returnChild = undefined;
                    if (newChildrenCount == 1) {
                        if (newChild !== undefined) {
                            returnChild = newChild instanceof ArrayNode
                                ? undefined
                                : newChild;
                        } else {
                            // Should always succeed, because ArrayNode must
                            // have at least two entries under it
                            const lastChild = this.children
                                .find(it => it !== undefined && it !== child);
                            returnChild = lastChild instanceof ArrayNode
                                ? undefined
                                : lastChild;
                        }
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
                                || thisEntry.value === otherEntry.value)) {
                        return result.dissoc(
                            shift, otherEntry.keyHash, otherEntry.key);
                    } else {
                        return result;
                    }
                }, this);
        default: throw "Unexpected type of node";
        }
    }

    reduceDifferenceImpl(other, acc, shift, onRemoved, onChanged, onAdded) {
        if (other instanceof ArrayNode) {
            for (let i = 0; i < 32; i ++) {
                const thisC = this.children[i];
                const otherC = other.children[i];
                acc = reduceDifference(thisC, otherC, acc, shift,
                    onRemoved, onChanged, onAdded);
            }
            return acc;
        } else {
            return other.reduceDifferenceImpl(
                this, acc, shift,
                onAdded,
                (oldE, newE, acc) => onChanged(newE, oldE, acc),
                onRemoved);
        }
    }

    next(shift, prev) {
        const childIndex = prev === undefined
            ? 0
            : arrayIndex(shift, prev.keyHash);
        for (let i = childIndex; i < 32; i ++) {
            const child = this.children[i];
            if (child !== undefined) {
                const nextOfChild = child.next(shift + 5, prev);
                if (nextOfChild !== undefined) {
                    return nextOfChild;
                } else {
                    // When reached end of a child, should start from
                    // the beginning of the next child
                    prev = undefined;
                }
            }
        }
        return undefined;
    }

    forEach(callback) {
        for (const child of this.children) {
            if (child !== undefined) {
                child.forEach(callback);
            }
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
                .findIndex(ch => utils.equal(ch.key, entry.key));
            if (childIndex == -1) {
                return new CollisionNode(
                    utils.immArrayAdd(this.children, entry),
                    this.keyHash);
            } else {
                const child = this.children[childIndex];
                if (child.value === entry.value) {
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
            return this.children.find(it => utils.equal(it.key, key));
        } else {
            return undefined;
        }
    }

    dissoc(shift, keyHash, key) {
        if (this.keyHash != keyHash) {
            return this;
        } else {
            const childIndex = this.children
                .findIndex(ch => utils.equal(ch.key, key));
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
                    return this.children.find(ch => !utils.equal(ch.key, key));
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
                        : thisEntry.value !== otherEntry.value;
                });
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

    reduceDifferenceImpl(other, acc, shift, onRemoved, onChanged, onAdded) {
        if (other instanceof Entry) {
            return other.reduceDifferenceImpl(
                this, acc, shift,
                onAdded,
                (oldE, newE, acc) => onChanged(newE, oldE, acc),
                onRemoved);
        } else if (other instanceof CollisionNode
                   && this.keyHash !== other.keyHash) {
            this.forEach(e => {
                acc = onRemoved(e, acc);
            });
            other.forEach(e => {
                acc = onAdded(e, acc);
            });
            return acc;
        } else {
            this.forEach(thisE => {
                const otherE = other.getEntry(
                    shift, thisE.keyHash, thisE.key);
                if (otherE === undefined) {
                    acc = onRemoved(thisE, acc);
                }
            });
            other.forEach(otherE => {
                const thisE = this.getEntry(
                    shift, otherE.keyHash, otherE.key);
                if (thisE === undefined) {
                    acc = onAdded(otherE, acc);
                } else if (thisE.value !== otherE.value) {
                    acc = onChanged(thisE, otherE, acc);
                }
            });
            return acc;
        }
    }

    next(shift, prev) {
        const nextIndex = (prev === undefined)
            ? 0
            : (this.children.findIndex(e => e === prev) + 1);
        return nextIndex < this.children.length
            ? this.children[nextIndex]
            : undefined;
    }

    forEach(callback) {
        for (const child of this.children) {
            callback(child);
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
               rEntry.value === lEntry.value) {
        return rNode.dissoc(shift, lEntry.keyHash, lEntry.key);
    } else {
        return rNode;
    }
}

export function reduceDifference(
    lNode, rNode, acc, shift, onRemoved, onChanged, onAdded) {
    if (lNode !== rNode) {
        if (rNode === undefined) {
            lNode.forEach(e => {
                acc = onRemoved(e, acc);
            });
        } else if (lNode === undefined) {
            rNode.forEach(e => {
                acc = onAdded(e, acc);
            });
        } else {
            return lNode.reduceDifferenceImpl(
                rNode, acc, shift, onRemoved, onChanged, onAdded);
        }
    }
    return acc;
}

export function makeArrayNode(node, shift) {
    const children = new Array(32);
    const index = arrayIndex(shift, node.keyHash);
    children[index] = node;
    return new ArrayNode(children, 1, node.countEntries());
}

function arrayIndex(shift, keyHash) {
    return (keyHash >>> shift) & 0x1F;
}
