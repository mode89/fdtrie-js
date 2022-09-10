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
        if (child == null) {
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
