import {ArrayNode, Entry, CollisionNode, makeArrayNode} from "trie.js"
import {is} from "utils.js"

test("assoc - Entry - same key and value", () => {
    const e = new Entry(1, 1, 1);
    expect(e.assoc(0, new Entry(1, 1, 1))).toBe(e);
})

test("assoc - Entry - same key", () => {
    const e = new Entry(1, 1, 1);
    expect(new Entry(1, 1, 2).assoc(0, e)).toBe(e);
})

test("assoc - Entry - return collision node", () => {
    const e1 = new Entry(1, 1, 1);
    const e2 = new Entry(1, 2, 2)
    const c = e1.assoc(0, e2);
    expect(c.keyHash).toBe(1);
    expect(c.children[0]).toBe(e1);
    expect(c.children[1]).toBe(e2);
})

test("assoc - Entry - return array node", () => {
    const e1 = new Entry(1, 1, 1);
    const e2 = new Entry(2, 2, 2);
    const a = e1.assoc(0, e2);
    expect(a.childrenCount).toBe(2);
    expect(a.entryCount).toBe(2);
    expect(a.children[1]).toBe(e1);
    expect(a.children[2]).toBe(e2);
})

test("assoc - CollisionNode - add child", () => {
    const e1 = new Entry(1, 1, 1);
    const e2 = new Entry(1, 2, 2);
    const e3 = new Entry(1, 3, 3);
    const c1 = makeCollisionNode(e1, e2);
    const c2 = c1.assoc(0, e3);
    expect(c2.keyHash).toBe(1);
    expect(c2.children.length).toBe(3);
    expect(c2.children[0]).toBe(e1);
    expect(c2.children[1]).toBe(e2);
    expect(c2.children[2]).toBe(e3);
})

test("assoc - CollisionNode - same entry", () => {
    const e1 = new Entry(1, 1, 1);
    const e2 = new Entry(1, 2, 2);
    const c = makeCollisionNode(e1, e2);
    expect(c.assoc(0, new Entry(1, 1, 1))).toBe(c);
})

test("assoc - CollisionNode - replace entry", () => {
    const e1 = new Entry(1, 1, 1);
    const e2 = new Entry(1, 2, 2);
    const e3 = new Entry(1, 2, 3);
    const c = makeCollisionNode(e1, e2).assoc(0, e3);
    expect(c.keyHash).toBe(1);
    expect(c.children.length).toBe(2);
    expect(c.children[0]).toBe(e1);
    expect(c.children[1]).toBe(e3);
})

test("assoc - CollisionNode - return array node", () => {
    const e1 = new Entry(1, 1, 1);
    const e2 = new Entry(1, 2, 2);
    const e3 = new Entry(2, 2, 2);
    const c = makeCollisionNode(e1, e2);
    const a = c.assoc(0, e3);
    expect(a).toBeInstanceOf(ArrayNode);
    expect(a.entryCount).toBe(3);
    expect(a.childrenCount).toBe(2);
    expect(a.children[1]).toBe(c);
    expect(a.children[2]).toBe(e3);
})

test("assoc - ArrayNode - same child", () => {
    const e1 = new Entry(1, 1, 1);
    const e2 = new Entry(2, 2, 2);
    const a = makeArrayNodeOf(e1, e2);
    expect(a.assoc(0, e1)).toBe(a);
})

test("assoc - ArrayNode - replace child", () => {
    const e1 = new Entry(1, 1, 1);
    const e2 = new Entry(2, 2, 2);
    const e3 = new Entry(1, 1, 2);
    const a = makeArrayNodeOf(e1, e2).assoc(0, e3);
    expect(a).toBeInstanceOf(ArrayNode);
    expect(a.childrenCount).toBe(2);
    expect(a.entryCount).toBe(2);
    expect(a.children[1]).toBe(e3);
    expect(a.children[2]).toBe(e2);
})

function makeCollisionNode() {
    const entries = [...arguments];
    expect(entries.length).toBeGreaterThan(1);
    const keyHash = entries[0].keyHash;
    for (const e of entries) {
        expect(e.keyHash).toBe(keyHash);
        expect(entries.filter(it => is(it.key, e.key)).length).toBe(1);
    }
    return new CollisionNode(entries, keyHash);
}

function makeArrayNodeOf() {
    const entries = [...arguments];
    expect(entries.length).toBeGreaterThan(1);
    for (const e of entries) {
        expect(entries.filter(it => is(it.key, e.key)).length).toBe(1);
    }
    return entries.slice(1).reduce(
        (result, entry) => result.assoc(0, entry),
        makeArrayNode(entries[0], 0));
}
