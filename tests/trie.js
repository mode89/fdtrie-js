import {ArrayNode,
        Entry,
        CollisionNode,
        difference,
        makeArrayNode} from "trie.js"
import {is} from "utils.js"

describe("assoc", () => {
    describe("Entry", () => {
        test("same key and value", () => {
            const e = new Entry(1, 1, 1);
            expect(e.assoc(0, new Entry(1, 1, 1))).toBe(e);
        })
        test("same key", () => {
            const e = new Entry(1, 1, 1);
            expect(new Entry(1, 1, 2).assoc(0, e)).toBe(e);
        })
        test("return collision node", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2)
            const c = e1.assoc(0, e2);
            expect(c.keyHash).toBe(1);
            expect(c.children[0]).toBe(e1);
            expect(c.children[1]).toBe(e2);
        })
        test("return array node", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(2, 2, 2);
            const a = e1.assoc(0, e2);
            expect(a.childrenCount).toBe(2);
            expect(a.entryCount).toBe(2);
            expect(a.children[1]).toBe(e1);
            expect(a.children[2]).toBe(e2);
        })
    })
    describe("CollisionNode", () => {
        test("add child", () => {
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
        test("same entry", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const c = makeCollisionNode(e1, e2);
            expect(c.assoc(0, new Entry(1, 1, 1))).toBe(c);
        })
        test("replace entry", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const e3 = new Entry(1, 2, 3);
            const c = makeCollisionNode(e1, e2).assoc(0, e3);
            expect(c.keyHash).toBe(1);
            expect(c.children.length).toBe(2);
            expect(c.children[0]).toBe(e1);
            expect(c.children[1]).toBe(e3);
        })
        test("return array node", () => {
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
    })
    describe("ArrayNode", () => {
        test("same child", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(2, 2, 2);
            const a = makeArrayNodeOf(e1, e2);
            expect(a.assoc(0, e1)).toBe(a);
        })
        test("replace child", () => {
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
    })
})

describe("getEntry", () => {
    describe("Entry", () => {
        test("hit", () => {
            const e = new Entry(1, 1, 1)
            expect(e.getEntry(0, 1, 1)).toBe(e);
        })
        test("wrong key", () => {
            expect(new Entry(1, 1, 1).getEntry(0, 1, 2)).toBeUndefined();
        })
        test("wrong key and hash", () => {
            const e = new Entry(1, 1, 1);
            expect(e.getEntry(0, 2, 2)).toBeUndefined();
            expect(e.getEntry(0, 2, 1)).toBeUndefined();
        })
    })
    describe("CollisionNode", () => {
        test("hit", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const c = makeCollisionNode(e1, e2);
            expect(c.getEntry(0, 1, 2)).toBe(e2);
        })
        test("wrong hash", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const c = makeCollisionNode(e1, e2);
            expect(c.getEntry(0, 2, 3)).toBeUndefined();
        })
        test("wrong key", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const c = makeCollisionNode(e1, e2);
            expect(c.getEntry(0, 1, 3)).toBeUndefined();
        })
    })
    describe("ArrayNode", () => {
        test("hit", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(2, 2, 2);
            const a = makeArrayNodeOf(e1, e2);
            expect(a.getEntry(0, 2, 2)).toBe(e2);
        })
        test("not found", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(2, 2, 2);
            const a = makeArrayNodeOf(e1, e2);
            expect(a.getEntry(0, 3, 3)).toBeUndefined();
        })
    })
})

describe("dissoc", () => {
    describe("Entry", () => {
        test("same key and hash", () => {
            const e = new Entry(1, 1, 1);
            expect(e.dissoc(0, 1, 1)).toBeUndefined();
        })
        test("wrong key", () => {
            const e = new Entry(1, 1, 1);
            expect(e.dissoc(0, 1, 2)).toBe(e);
        })
        test("wrong hash", () => {
            const e = new Entry(1, 1, 1);
            expect(e.dissoc(0, 2, 1)).toBe(e);
        })
    })
    describe("CollisionNode", () => {
        test("wrong hash", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const c = makeCollisionNode(e1, e2);
            expect(c.dissoc(0, 2, 1)).toBe(c);
        })
        test("wrong key", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const c = makeCollisionNode(e1, e2);
            expect(c.dissoc(0, 1, 3)).toBe(c);
        })
        test("return entry", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const c = makeCollisionNode(e1, e2);
            expect(c.dissoc(0, 1, 2)).toBe(e1);
        })
        test("new collision node", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(1, 2, 2);
            const e3 = new Entry(1, 3, 3);
            const c1 = makeCollisionNode(e1, e2, e3);
            const c2 = c1.dissoc(0, 1, 1);
            expect(c2).toBeInstanceOf(CollisionNode);
            expect(c2.keyHash).toBe(1);
            expect(c2.children.length).toBe(2);
            expect(c2.getEntry(0, 1, 2)).toBe(e2);
            expect(c2.getEntry(0, 1, 3)).toBe(e3);
        })
    })
    describe("ArrayNode", () => {
        test("unchanged", () => {
            const a = makeArrayNodeOf(
                new Entry(1, 1, 1), new Entry(2, 2, 2));
            expect(a.dissoc(0, 3, 3)).toBe(a);
        })
        test("unchagned child", () => {
            const a = makeArrayNodeOf(
                new Entry(1, 1, 1), new Entry(2, 2, 2));
            expect(a.dissoc(0, 33, 3)).toBe(a);
        })
        test("new array node", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(2, 2, 2);
            const e3 = new Entry(3, 3, 3);
            const a = makeArrayNodeOf(e1, e2, e3).dissoc(0, 2, 2);
            expect(a).toBeInstanceOf(ArrayNode);
            expect(a.childrenCount).toBe(2);
            expect(a.entryCount).toBe(2);
            expect(a.getEntry(0, 1, 1)).toBe(e1);
            expect(a.getEntry(0, 2, 2)).toBeUndefined();
            expect(a.getEntry(0, 3, 3)).toBe(e3);
        })
        test("return last child", () => {
            const e = new Entry(1, 1, 1);
            const a = makeArrayNodeOf(e, new Entry(2, 2, 2));
            expect(a.dissoc(0, 2, 2)).toBe(e);
        })
        test("last child has higher index", () => {
            const e = new Entry(1, 1, 1);
            const a = makeArrayNodeOf(e, new Entry(0, 0, 0));
            expect(a.dissoc(0, 0, 0)).toBe(e);
        })
        test("last child is array node", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(2, 2, 2);
            const e3 = new Entry(33, 3, 3);
            const a = makeArrayNodeOf(e1, e2, e3).dissoc(0, 2, 2);
            expect(a).toBeInstanceOf(ArrayNode);
            expect(a.childrenCount).toBe(1);
            expect(a.entryCount).toBe(2);
            expect(a.getEntry(0, 1, 1)).toBe(e1);
            expect(a.getEntry(0, 2, 2)).toBeUndefined();
            expect(a.getEntry(0, 33, 3)).toBe(e3);
        })
        test("new child is array node", () => {
            const e1 = new Entry(1, 1, 1);
            const e2 = new Entry(33, 2, 2);
            const e3 = new Entry(65, 3, 3);
            const a = makeArrayNodeOf(e1, e2, e3).dissoc(0, 33, 2);
            expect(a).toBeInstanceOf(ArrayNode);
            expect(a.childrenCount).toBe(1);
            expect(a.entryCount).toBe(2);
            expect(a.getEntry(0, 1, 1)).toBe(e1);
            expect(a.getEntry(0, 33, 2)).toBeUndefined();
            expect(a.getEntry(0, 65, 3)).toBe(e3);
        })
        test("return new child", () => {
            const e = new Entry(1, 1, 1);
            const a = makeArrayNodeOf(e, new Entry(33, 3, 3));
            expect(a.dissoc(0, 33, 3)).toBe(e);
        })
    })
})

describe("difference", () => {
    test("common", () => {
        const e = new Entry(1, 1, 1);
        expect(difference(e, e, 0)).toBeUndefined();
        expect(difference(undefined, undefined, 0)).toBeUndefined();
        expect(difference(undefined, e, 0)).toBeUndefined();
        expect(difference(e, undefined, 0)).toBe(e);
    })
    describe("Entry", () => {
        describe("to Entry", () => {
            test("equal", () => {
                const e = new Entry(1, 1, 1);
                expect(difference(e, new Entry(1, 1, 1), 0)).toBeUndefined();
            })
            test("different values", () => {
                const e = new Entry(1, 1, 1);
                expect(difference(e, new Entry(1, 1, 2), 0)).toBe(e);
            })
            test("different keys", () => {
                const e = new Entry(1, 1, 1);
                expect(difference(e, new Entry(2, 2, 1), 0)).toBe(e);
            })
        })
        describe("to CollisionNode", () => {
            test("not found", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(1, 2, 2);
                const e3 = new Entry(1, 3, 3);
                const c = makeCollisionNode(e2, e3);
                expect(difference(e1, c, 0)).toBe(e1);
            })
            test("same entry", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(1, 2, 2);
                const c = makeCollisionNode(e1, e2);
                expect(difference(e1, c, 0)).toBeUndefined();
            })
            test("same value", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(1, 2, 2);
                const c = makeCollisionNode(new Entry(1, 1, 1), e2);
                expect(difference(e1, c, 0)).toBeUndefined();
            })
            test("different value", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(1, 2, 2);
                const c = makeCollisionNode(new Entry(1, 1, 2), e2);
                expect(difference(e1, c, 0)).toBe(e1);
            })
        })
        describe("to ArrayNode", () => {
            test("same value", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(1, 2, 2);
                const c = makeArrayNodeOf(new Entry(1, 1, 1), e2);
                expect(difference(e1, c, 0)).toBeUndefined();
            })
        })
    })
    describe("CollisionNode", () => {
        describe("to Entry", () => {
            test("miss", () => {
                const c = makeCollisionNode(
                    new Entry(1, 1, 1), new Entry(1, 2, 2));
                expect(difference(c, new Entry(1, 3, 3), 0)).toBe(c);
            })
            test("same entry", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(1, 2, 2);
                const c = makeCollisionNode(e1, e2);
                expect(difference(c, e1, 0)).toBe(e2);
            })
            test("same value", () => {
                const e = new Entry(1, 1, 1);
                const c = makeCollisionNode(e, new Entry(1, 2, 2));
                expect(difference(c, new Entry(1, 2, 2), 0)).toBe(e);
            })
            test("different value", () => {
                const c = makeCollisionNode(
                    new Entry(1, 1, 1), new Entry(1, 2, 2));
                expect(difference(c, new Entry(1, 1, 2), 0)).toBe(c);
            })
        })
        describe("to CollisionNode", () => {
            test("equal", () => {
                const c1 = makeCollisionNode(
                    new Entry(1, 1, 1), new Entry(1, 2, 2));
                const c2 = makeCollisionNode(
                    new Entry(1, 1, 1), new Entry(1, 2, 2));
                expect(difference(c1, c2, 0)).toBeUndefined();
            })
            test("return entry", () => {
                const e = new Entry(1, 1, 1);
                const c1 = makeCollisionNode(e, new Entry(1, 2, 2));
                const c2 = makeCollisionNode(
                    new Entry(1, 2, 2), new Entry(1, 3, 3));
                expect(difference(c1, c2, 0)).toBe(e);
            })
            test("return left node", () => {
                const c1 = makeCollisionNode(
                    new Entry(1, 1, 1), new Entry(1, 2, 2));
                const c2 = makeCollisionNode(
                    new Entry(1, 3, 3), new Entry(1, 4, 4));
                expect(difference(c1, c2, 0)).toBe(c1);
            })
            test("return collision node", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(1, 2, 2);
                const c1 = makeCollisionNode(e1, e2, new Entry(1, 3, 3));
                const c2 = makeCollisionNode(
                    new Entry(1, 3, 3), new Entry(1, 4, 4));
                const c = difference(c1, c2, 0);
                expect(c).toBeInstanceOf(CollisionNode);
                expect(c.countEntries()).toBe(2);
                expect(c.getEntry(0, 1, 1)).toBe(e1);
                expect(c.getEntry(0, 1, 2)).toBe(e2);
                expect(c.getEntry(0, 1, 3)).toBeUndefined();
                expect(c.getEntry(0, 1, 4)).toBeUndefined();
            })
            test("different value", () => {
                const e = new Entry(1, 1, 1);
                const c1 = makeCollisionNode(e, new Entry(1, 2, 2));
                const c2 = makeCollisionNode(
                    new Entry(1, 1, 2), new Entry(1, 2, 2));
                expect(difference(c1, c2, 0)).toBe(e);
            })
        })
    })
    describe("ArrayNode", () => {
        describe("to Entry", () => {
            test("return entry", () => {
                const e = new Entry(1, 1, 1);
                const a = makeArrayNodeOf(e, new Entry(2, 2, 2));
                expect(difference(a, new Entry(2, 2, 2), 0)).toBe(e);
            })
        })
        describe("to CollisionNode", () => {
            test("simple", () => {
                const e = new Entry(1, 1, 1);
                const a = makeArrayNodeOf(e, new Entry(2, 2, 2));
                const c = makeCollisionNode(
                    new Entry(2, 2, 2), new Entry(2, 3, 3));
                expect(difference(a, c, 0)).toBe(e);
            })
            test("same entry", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(2, 2, 2);
                const a = makeArrayNodeOf(e1, e2);
                const c = makeCollisionNode(e2, new Entry(2, 3, 3));
                expect(difference(a, c, 0)).toBe(e1);
            })
            test("differenct value", () => {
                const a = makeArrayNodeOf(
                    new Entry(1, 1, 1), new Entry(2, 2, 2));
                const c = makeCollisionNode(
                    new Entry(1, 1, 2), new Entry(1, 2, 2));
                expect(difference(a, c, 0)).toBe(a);
            })
        })
        describe("to ArrayNode", () => {
            test("equal", () => {
                const a1 = makeArrayNodeOf(
                    new Entry(1, 1, 1), new Entry(2, 2, 2));
                const a2 = makeArrayNodeOf(
                    new Entry(1, 1, 1), new Entry(2, 2, 2));
                expect(difference(a1, a2, 0)).toBeUndefined();
            })
            test("return left", () => {
                const a1 = makeArrayNodeOf(
                    new Entry(1, 1, 1), new Entry(2, 2, 2));
                const a2 = makeArrayNodeOf(
                    new Entry(3, 3, 3), new Entry(4, 4, 4));
                expect(difference(a1, a2, 0)).toBe(a1);
            })
            test("return last child", () => {
                const e = new Entry(1, 1, 1);
                const a1 = makeArrayNodeOf(e, new Entry(2, 2, 2));
                const a2 = makeArrayNodeOf(
                    new Entry(2, 2, 2), new Entry(3, 3, 3));
                expect(difference(a1, a2, 0)).toBe(e);
            })
            test("return nested array", () => {
                const e1 = new Entry(1, 1, 1);
                const e3 = new Entry(33, 3, 3);
                const a1 = makeArrayNodeOf(e1, new Entry(2, 2, 2), e3);
                const a2 = makeArrayNodeOf(
                    new Entry(2, 2, 2), new Entry(4, 4, 4));
                const d = difference(a1, a2, 0);
                expect(d).toBeInstanceOf(ArrayNode);
                expect(d.countEntries()).toBe(2);
                expect(d.getEntry(0, 1, 1)).toBe(e1);
                expect(d.getEntry(0, 2, 2)).toBeUndefined();
                expect(d.getEntry(0, 33, 3)).toBe(e3);
                expect(d.getEntry(0, 4, 4)).toBeUndefined();
            })
            test("return new array node", () => {
                const e1 = new Entry(1, 1, 1);
                const e2 = new Entry(2, 2, 2);
                const a1 = makeArrayNodeOf(e1, e2, new Entry(3, 3, 3));
                const a2 = makeArrayNodeOf(
                    new Entry(3, 3, 3), new Entry(4, 4, 4));
                const d = difference(a1, a2, 0);
                expect(d).toBeInstanceOf(ArrayNode);
                expect(d.countEntries()).toBe(2);
                expect(d.getEntry(0, 1, 1)).toBe(e1);
                expect(d.getEntry(0, 2, 2)).toBe(e2);
                expect(d.getEntry(0, 3, 3)).toBeUndefined();
                expect(d.getEntry(0, 4, 4)).toBeUndefined();
            })
        })
    })
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
