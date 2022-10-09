import {hash} from "./utils.js";
import {Entry, difference} from "./trie.js";

export class PHashMap {

    static _blankMapsCache = new Map([
        [hash, new PHashMap(undefined, hash)],
    ]);

    static blank(hasher = hash) {
        const cachedMap = PHashMap._blankMapsCache.get(hasher);
        if (cachedMap !== undefined) {
            return cachedMap;
        } else {
            const newMap = new PHashMap(undefined, hasher);
            PHashMap._blankMapsCache.set(hasher, newMap);
            return newMap;
        }
    }

    constructor(root, keyHasher) {
        this.root = root;
        this.keyHasher = keyHasher;
    }

    count() {
        return this.root !== undefined
            ? this.root.countEntries()
            : 0;
    }

    get(key, notFound) {
        const entry = this.entryAt(key);
        return entry !== undefined
            ? entry.value
            : notFound;
    }

    entryAt(key) {
        return this.root !== undefined
            ? this.root.getEntry(0, this.keyHasher(key), key)
            : undefined;
    }

    assoc(key, value) {
        const keyHash = this.keyHasher(key);
        const entry = new Entry(keyHash, key, value);
        if (this.root !== undefined) {
            const newRoot = this.root.assoc(0, entry);
            return newRoot === this.root
                ? this
                : new PHashMap(newRoot, this.keyHasher);
        } else {
            return new PHashMap(entry, this.keyHasher);
        }
    }

    dissoc(key) {
        if (this.root !== undefined) {
            const keyHash = this.keyHasher(key);
            const newRoot = this.root.dissoc(0, keyHash, key);
            if (newRoot === this.root) {
                return this;
            } else {
                return newRoot !== undefined
                    ? new PHashMap(newRoot, this.keyHasher)
                    : PHashMap.blank(this.keyHasher);
            }
        } else {
            return this;
        }
    }

    difference(other) {
        if (this.keyHasher !== other.keyHasher) {
            throw "Can't calculate difference of maps that were built " +
                "with different key-hashers";
        }
        const rootDiff = difference(this.root, other.root, 0);
        if (rootDiff === undefined) {
            return PHashMap.blank(this.keyHasher);
        } else if (rootDiff === this.root) {
            return this;
        } else {
            return new PHashMap(rootDiff, this.keyHasher);
        }
    }

    seq() {
        return this.root !== undefined
            ? new PHashMapSeq(
                this.root,
                this.root.countEntries(),
                this.root.next(0, undefined))
            : undefined;
    }

    *entries() {
        if (this.root !== undefined) {
            let e = this.root.next(0, undefined);
            while (e !== undefined) {
                yield e;
                e = this.root.next(0, e);
            }
        }
    }
}

class PHashMapSeq {

    constructor(root, count, first) {
        this._root = root;
        this._count = count;
        this._first = first;
    }

    count() {
        return this._count;
    }

    first() {
        return this._first;
    }

    rest() {
        return this._count > 1
            ? new PHashMapSeq(
                this._root,
                this._count - 1,
                this._root.next(0, this._first))
            : new PHashMapSeq(undefined, 0, undefined);
    }
}
