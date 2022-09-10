import {ArrayNode, Entry, CollisionNode, makeArrayNode} from "trie.js"
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
// 
// @Test
// fun dissocCollisionNode_WrongHash() {
//     val c = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertTrue(dissoc(c, 0, 2, 1) === c)
// }
// 
// @Test
// fun dissocCollisionNode_WrongKey() {
//     val c = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertTrue(dissoc(c, 0, 1, 3) === c)
// }
// 
// @Test
// fun dissocCollisionNode_ReturnEntry() {
//     val c = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertEquals(Entry(1, 1, 1), dissoc(c, 0, 1, 2))
// }
// 
// @Test
// fun dissocCollisionNode_NewCollisionNode() {
//     val c = makeCollisionNode(
//         Entry(1, 1, 1),
//         Entry(1, 2, 2),
//         Entry(1, 3, 3))
//     assertEquals(
//         makeCollisionNode(Entry(1, 2, 2), Entry(1, 3, 3)),
//         dissoc(c, 0, 1, 1))
// }
// 
// @Test
// fun dissocArrayNode_Unchanged() {
//     val a = makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2))
//     assertTrue(dissoc(a, 0, 3, 3) === a)
// }
// 
// @Test
// fun dissocArrayNode_UnchangedChild() {
//     val a = makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2))
//     assertTrue(dissoc(a, 0, 33, 3) === a)
// }
// 
// @Test
// fun dissocArrayNode_NewArrayNode() {
//     val a = dissoc(
//         makeArrayNodeOf(
//             Entry(1, 1, 1),
//             Entry(2, 2, 2),
//             Entry(3, 3, 3)),
//         0, 2, 2) as ArrayNode
//     assertEquals(2, a.childrenCount)
//     assertEquals(2, a.entryCount)
//     assertEquals(Entry(1, 1, 1), getEntry(a, 0, 1, 1))
//     assertNull(getEntry(a, 0, 2, 2))
//     assertEquals(Entry(3, 3, 3), getEntry(a, 0, 3, 3))
// }
// 
// @Test
// fun dissocArrayNode_ReturnLastChild() {
//     val e = Entry(1, 1, 1)
//     val a = makeArrayNodeOf(e, Entry(2, 2, 2))
//     assertTrue(dissoc(a, 0, 2, 2) === e)
// }
// 
// @Test
// fun dissocArrayNode_LastChildHasHigherIndex() {
//     val e = Entry(1, 1, 1)
//     val a = makeArrayNodeOf(e, Entry(0, 0, 0))
//     assertTrue(dissoc(a, 0, 0, 0) === e)
// }
// 
// @Test
// fun dissocArrayNode_LastChildIsArrayNode() {
//     val a = dissoc(
//         makeArrayNodeOf(
//             Entry(1, 1, 1),
//             Entry(2, 2, 2),
//             Entry(33, 3, 3)),
//         0, 2, 2) as ArrayNode
//     assertEquals(1, a.childrenCount)
//     assertEquals(2, a.entryCount)
//     assertEquals(Entry(1, 1, 1), getEntry(a, 0, 1, 1))
//     assertNull(getEntry(a, 0, 2, 2))
//     assertEquals(Entry(33, 3, 3), getEntry(a, 0, 33, 3))
// }
// 
// @Test
// fun dissocArrayNode_NewChildIsArrayNode() {
//     val a = dissoc(
//         makeArrayNodeOf(
//             Entry(1, 1, 1),
//             Entry(33, 2, 2),
//             Entry(65, 3, 3)),
//         0, 33, 2) as ArrayNode
//     assertEquals(1, a.childrenCount)
//     assertEquals(2, a.entryCount)
//     assertEquals(Entry(1, 1, 1), getEntry(a, 0, 1, 1))
//     assertNull(getEntry(a, 0, 33, 2))
//     assertEquals(Entry(65, 3, 3), getEntry(a, 0, 65, 3))
// }
// 
// @Test
// fun dissocArrayNode_ReturnNewChild() {
//     val e = Entry(1, 1, 1)
//     val a = makeArrayNodeOf(e, Entry(33, 3, 3))
//     assertTrue(dissoc(a, 0, 33, 3) === e)
// }
})

// 
// @Test
// fun differenceNull() {
//     val e = Entry(1, 1, 1)
//     assertNull(difference(e, e, 0))
//     assertNull(difference(null, null, 0))
//     assertNull(difference(null, e, 0))
//     assertTrue(difference(e, null, 0) === e)
// }
// 
// @Test
// fun difference_Entry_Entry_Equal() {
//     val e = Entry(1, 1, 1)
//     assertNull(difference(e, Entry(1, 1, 1), 0))
// }
// 
// @Test
// fun difference_Entry_Entry_DiffValues() {
//     val e = Entry(1, 1, 1)
//     assertTrue(difference(e, Entry(1, 1, 2), 0) === e)
// }
// 
// @Test
// fun difference_Entry_Entry_DifferentKey() {
//     val e = Entry(1, 1, 1)
//     assertTrue(difference(e, Entry(2, 2, 1), 0) === e)
// }
// 
// @Test
// fun difference_Entry_CollisionNode_NotFound() {
//     val e = Entry(1, 1, 1)
//     assertTrue(difference(
//         e,
//         makeCollisionNode(Entry(1, 2, 2), Entry(1, 3, 3)),
//         0) === e)
// }
// 
// @Test
// fun difference_Entry_CollisionNode_SameEntry() {
//     val e = Entry(1, 1, 1)
//     assertNull(difference(e, makeCollisionNode(e, Entry(1, 2, 2)), 0))
// }
// 
// @Test
// fun difference_Entry_CollisionNode_SameValue() {
//     val e = Entry(1, 1, 1)
//     assertNull(difference(
//         e,
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         0))
// }
// 
// @Test
// fun difference_Entry_CollisionNode_DiffValue() {
//     val e = Entry(1, 1, 1)
//     assertTrue(difference(
//         e,
//         makeCollisionNode(Entry(1, 1, 2), Entry(1, 2, 2)),
//         0) === e)
// }
// 
// @Test
// fun difference_Entry_ArrayNode() {
//     assertNull(difference(
//         Entry(1, 1, 1),
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         0))
// }
// 
// @Test
// fun difference_CollisionNode_Entry_Miss() {
//     val c = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertTrue(difference(c, Entry(1, 3, 3), 0) === c)
// }
// 
// @Test
// fun difference_CollisionNode_Entry_SameEntry() {
//     val e1 = Entry(1, 1, 1)
//     val e2 = Entry(1, 2, 2)
//     val c = makeCollisionNode(e1, e2)
//     assertTrue(difference(c, e1, 0) === e2)
// }
// 
// @Test
// fun difference_CollisionNode_Entry_SameValue() {
//     val e = Entry(1, 1, 1)
//     val c = makeCollisionNode(e, Entry(1, 2, 2))
//     assertTrue(difference(c, Entry(1, 2, 2), 0) === e)
// }
// 
// @Test
// fun difference_CollisionNode_Entry_DiffValue() {
//     val c = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertTrue(difference(c, Entry(1, 1, 2), 0) === c)
// }
// 
// @Test
// fun difference_CollisionNode_CollisionNode_Equal() {
//     assertNull(
//         difference(
//             makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//             makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//             0))
// }
// 
// @Test
// fun difference_CollisionNode_CollisionNode_ReturnEntry() {
//     val e = Entry(1, 1, 1)
//     assertTrue(
//         difference(
//             makeCollisionNode(e, Entry(1, 2, 2)),
//             makeCollisionNode(Entry(1, 2, 2), Entry(1, 3, 3)),
//             0) === e)
// }
// 
// @Test
// fun difference_CollisionNode_CollisionNode_ReturnLeftNode() {
//     val c = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertTrue(
//         difference(
//             c,
//             makeCollisionNode(Entry(1, 3, 3), Entry(1, 4, 4)),
//             0) === c)
// }
// 
// @Test
// fun difference_CollisionNode_CollisionNode_ReturnCollisionNode() {
//     val c = difference(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2), Entry(1, 3, 3)),
//         makeCollisionNode(Entry(1, 3, 3), Entry(1, 4, 4)),
//         0) as CollisionNode
//     assertEquals(2, countEntries(c))
//     assertEquals(Entry(1, 1, 1), getEntry(c, 0, 1, 1))
//     assertEquals(Entry(1, 2, 2), getEntry(c, 0, 1, 2))
//     assertNull(getEntry(c, 0, 1, 3))
//     assertNull(getEntry(c, 0, 1, 4))
// }
// 
// @Test
// fun difference_CollisionNode_CollisionNode_DiffValue() {
//     assertEquals(
//         Entry(1, 1, 1),
//         difference(
//             makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//             makeCollisionNode(Entry(1, 1, 2), Entry(1, 2, 2)),
//             0))
// }
// 
// @Test
// fun difference_ArrayNode_Entry() {
//     assertEquals(
//         Entry(1, 1, 1),
//         difference(
//             makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//             Entry(2, 2, 2),
//             0))
// }
// 
// @Test
// fun difference_ArrayNode_CollisionNode() {
//     val e = Entry(1, 1, 1)
//     assertTrue(
//         difference(
//             makeArrayNodeOf(e, Entry(2, 2, 2)),
//             makeCollisionNode(Entry(2, 2, 2), Entry(2, 3, 3)),
//             0) === e)
// }
// 
// @Test
// fun difference_ArrayNode_CollisionNode_SameEntry() {
//     val e1 = Entry(1, 1, 1)
//     val e2 = Entry(2, 2, 2)
//     assertTrue(
//         difference(
//             makeArrayNodeOf(e1, e2),
//             makeCollisionNode(e2, Entry(2, 3, 3)),
//             0) === e1)
// }
// 
// @Test
// fun difference_ArrayNode_CollisionNode_DiffValue() {
//     val a = makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2))
//     assertTrue(
//         difference(
//             a,
//             makeCollisionNode(Entry(1, 1, 2), Entry(1, 2, 2)),
//             0) === a)
// }
// 
// @Test
// fun difference_ArrayNode_ArrayNode_Equal() {
//     assertNull(
//         difference(
//             makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//             makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//             0))
// }
// 
// @Test
// fun difference_ArrayNode_ArrayNode_ReturnLeft() {
//     val a = makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2))
//     assertTrue(
//         difference(
//             a,
//             makeArrayNodeOf(Entry(3, 3, 3), Entry(4, 4, 4)),
//             0) === a)
// }
// 
// @Test
// fun difference_ArrayNode_ArrayNode_ReturnEntry() {
//     val e = Entry(1, 1, 1)
//     assertTrue(
//         difference(
//             makeArrayNodeOf(e, Entry(2, 2, 2)),
//             makeArrayNodeOf(Entry(2, 2, 2), Entry(3, 3, 3)),
//             0) === e)
// }
// 
// @Test
// fun difference_ArrayNode_ArrayNode_ReturnNestedArray() {
//     val d = difference(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2), Entry(33, 3, 3)),
//         makeArrayNodeOf(Entry(2, 2, 2), Entry(4, 4, 4)),
//         0) as ArrayNode
//     assertEquals(2, countEntries(d))
//     assertEquals(Entry(1, 1, 1), getEntry(d, 0, 1, 1))
//     assertNull(getEntry(d, 0, 2, 2))
//     assertEquals(Entry(33, 3, 3), getEntry(d, 0, 33, 3))
//     assertNull(getEntry(d, 0, 4, 4))
// }
// 
// @Test
// fun difference_ArrayNode_ArrayNode_ReturnNewArrayNode() {
//     val d = difference(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2), Entry(3, 3, 3)),
//         makeArrayNodeOf(Entry(3, 3, 3), Entry(4, 4, 4)),
//         0) as ArrayNode
//     assertEquals(2, countEntries(d))
//     assertEquals(Entry(1, 1, 1), getEntry(d, 0, 1, 1))
//     assertEquals(Entry(2, 2, 2), getEntry(d, 0, 2, 2))
//     assertNull(getEntry(d, 0, 3, 3))
//     assertNull(getEntry(d, 0, 4, 4))
// }
// 
// @Test
// fun getNodeByKeyHash_Entry() {
//     val e = Entry(1, 1, 1)
//     assertNull(getNodeByKeyHash(e, 0, 2))
//     assertTrue(getNodeByKeyHash(e, 0, 1) === e)
// }
// 
// @Test
// fun getNodeByKeyHash_CollisionNode() {
//     val c = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertNull(getNodeByKeyHash(c, 0, 2))
//     assertTrue(getNodeByKeyHash(c, 0, 1) === c)
// }
// 
// @Test
// fun getNodeByKeyHash_ArrayNode() {
//     val e1 = Entry(1, 1, 1)
//     val e2 = Entry(2, 2, 2)
//     val a = makeArrayNodeOf(e1, e2)
//     assertTrue(getNodeByKeyHash(a, 0, 1) === e1)
//     assertTrue(getNodeByKeyHash(a, 0, 2) === e2)
//     assertNull(getNodeByKeyHash(a, 0, 3))
// }
// 
// @Test
// fun intersect_Identical() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(e, e, 0) === e)
// }
// 
// @Test
// fun intersect_Null() {
//     val e = Entry(1, 1, 1)
//     assertNull(intersect(null, null, 0))
//     assertNull(intersect(e, null, 0))
//     assertNull(intersect(null, e, 0))
// }
// 
// @Test
// fun intersect_Entry_Entry_Equal() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(e, Entry(1, 1, 1), 0) === e)
// }
// 
// @Test
// fun intersect_Entry_Entry_SameKey() {
//     assertNull(intersect(Entry(1, 1, 1), Entry(1, 1, 2), 0))
// }
// 
// @Test
// fun intersect_Entry_Entry_Different() {
//     assertNull(intersect(Entry(1, 1, 1), Entry(2, 2, 2), 0))
// }
// 
// @Test
// fun intersect_Entry_ArrayNode_NotPresent() {
//     assertNull(intersect(
//         Entry(1, 1, 1),
//         makeArrayNodeOf(Entry(2, 2, 2), Entry(3, 3, 3)),
//         0))
// }
// 
// @Test
// fun intersect_Entry_ArrayNode_Identical() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         e,
//         makeArrayNodeOf(e, Entry(2, 2, 2)),
//         0) === e)
// }
// 
// @Test
// fun intersect_Entry_ArrayNode_Equal() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         e,
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         0) === e)
// }
// 
// @Test
// fun intersect_Entry_ArrayNode_NotEqual() {
//     assertNull(intersect(
//         Entry(1, 1, 1),
//         makeArrayNodeOf(Entry(1, 1, 2), Entry(2, 2, 2)),
//         0))
// }
// 
// @Test
// fun intersect_Entry_CollisionNode() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         e,
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         0) === e)
// }
// 
// @Test
// fun intersect_CollisionNode_Entry() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         e,
//         0) === e)
// }
// 
// @Test
// fun intersect_CollisionNode_CollisionNode_DifferentHash() {
//     assertNull(intersect(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         makeCollisionNode(Entry(2, 3, 3), Entry(2, 4, 4)),
//         0))
// }
// 
// @Test
// fun intersect_CollisionNode_CollisionNode_NotIntersect() {
//     assertNull(intersect(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         makeCollisionNode(Entry(1, 3, 3), Entry(1, 4, 4)),
//         0))
// }
// 
// @Test
// fun intersect_CollisionNode_CollisionNode_OneEntry() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         makeCollisionNode(e, Entry(1, 2, 2)),
//         makeCollisionNode(e, Entry(1, 3, 3)),
//         0) === e)
// }
// 
// @Test
// fun intersect_CollisionNode_CollisionNode_Equal() {
//     val c = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertTrue(intersect(
//         c,
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         0) === c)
// }
// 
// @Test
// fun intersect_CollisionNode_CollisionNode_NewCollisionNode() {
//     val c0 = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     val ci = intersect(
//         assoc(c0, 0, Entry(1, 3, 3)),
//         assoc(c0, 0, Entry(1, 4, 4)),
//         0) as CollisionNode
//     assertEquals(Entry(1, 1, 1), getEntry(ci, 0, 1, 1))
//     assertEquals(Entry(1, 2, 2), getEntry(ci, 0, 1, 2))
//     assertNull(getEntry(ci, 0, 1, 3))
//     assertNull(getEntry(ci, 0, 1, 4))
// }
// 
// @Test
// fun intersect_CollisionNode_CollisionNode_EntryWithDifferentValue() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         makeCollisionNode(e, Entry(1, 2, 2)),
//         makeCollisionNode(e, Entry(1, 2, 3)),
//         0) === e)
// }
// 
// @Test
// fun intersect_CollisionNode_CollisionNode_LeftIsBigger() {
//     val r = makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2))
//     assertTrue(intersect(assoc(r, 0, Entry(1, 3, 3)), r, 0) === r)
// }
// 
// @Test
// fun intersect_CollisionNode_CollisionNode_SameValues() {
//     assertNull(intersect(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 1)),
//         makeCollisionNode(Entry(1, 3, 1), Entry(1, 4, 1)),
//         0))
// }
// 
// @Test
// fun intersect_CollisionNode_ArrayNode() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         makeCollisionNode(e, Entry(1, 2, 2)),
//         makeArrayNodeOf(e, Entry(2, 2, 2)),
//         0) === e)
// }
// 
// @Test
// fun intersect_ArrayNode_Entry() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         e,
//         0) === e)
// }
// 
// @Test
// fun intersect_ArrayNode_CollisionNode() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         makeArrayNodeOf(e, Entry(2, 2, 2)),
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         0) === e)
// }
// 
// @Test
// fun intersect_ArrayNode_ArrayNode_NoIntersection() {
//     assertNull(intersect(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         makeArrayNodeOf(Entry(3, 3, 3), Entry(4, 4, 4)),
//         0))
// }
// 
// @Test
// fun intersect_ArrayNode_ArrayNode_ReturnLeftNode() {
//     val a = makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2))
//     assertTrue(intersect(
//         a,
//         assoc(a, 0, Entry(3, 3, 3)),
//         0) === a)
// }
// 
// @Test
// fun intersect_ArrayNode_ArrayNode_ReturnEntry() {
//     val e = Entry(1, 1, 1)
//     assertTrue(intersect(
//         makeArrayNodeOf(e, Entry(2, 2, 2)),
//         makeArrayNodeOf(e, Entry(3, 3, 3)),
//         0) === e)
// }
// 
// @Test
// fun intersect_ArrayNode_ArrayNode_NewArrayNode() {
//     val a = makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2))
//     val ai = intersect(
//         assoc(a, 0, Entry(3, 3, 3)),
//         assoc(a, 0, Entry(4, 4, 4)),
//         0) as ArrayNode
//     assertEquals(Entry(1, 1, 1), getEntry(ai, 0, 1, 1))
//     assertEquals(Entry(2, 2, 2), getEntry(ai, 0, 2, 2))
//     assertNull(getEntry(ai, 0, 3, 3))
//     assertNull(getEntry(ai, 0, 4, 4))
// }
// 
// @Test
// fun intersect_ArrayNode_ArrayNode_NewArrayNodeWithSingleChild() {
//     val a = makeArrayNodeOf(Entry(1, 1, 1), Entry(33, 3, 3))
//     val ai = intersect(
//         assoc(a, 0, Entry(4, 4, 4)),
//         assoc(a, 0, Entry(5, 5, 5)),
//         0) as ArrayNode
//     assertEquals(Entry(1, 1, 1), getEntry(ai, 0, 1, 1))
//     assertEquals(Entry(33, 3, 3), getEntry(ai, 0, 33, 3))
//     assertNull(getEntry(ai, 0, 4, 4))
//     assertNull(getEntry(ai, 0, 5, 5))
// }
// 
// @Test
// fun intersect_ArrayNode_ArrayNode_LeftIsBigger() {
//     val a = makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2))
//     assertTrue(intersect(
//         assoc(a, 0, Entry(3, 3, 3)),
//         a,
//         0) === a)
// }
// 
// @Test
// fun equiv_Identical() {
//     val e = Entry(1, 1, 1)
//     assertTrue(equiv(e, e, 0))
// }
// 
// @Test
// fun equiv_Null() {
//     val e = Entry(1, 1, 1)
//     assertTrue(equiv(null, null, 0))
//     assertFalse(equiv(e, null, 0))
//     assertFalse(equiv(null, e, 0))
// }
// 
// @Test
// fun equiv_Entry_Entry_Equal() {
//     assertTrue(equiv(Entry(1, 1, 1), Entry(1, 1, 1), 0))
// }
// 
// @Test
// fun equiv_Entry_Entry_DiffKey() {
//     assertFalse(equiv(Entry(1, 2, 2), Entry(1, 3, 3), 0))
// }
// 
// @Test
// fun equiv_Entry_Entry_DiffValue() {
//     assertFalse(equiv(Entry(1, 1, 2), Entry(1, 1, 3), 0))
// }
// 
// @Test
// fun equiv_Entry_CollisionNode() {
//     assertFalse(equiv(
//         Entry(1, 1, 1),
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         0))
// }
// 
// @Test
// fun equiv_Entry_ArrayNode() {
//     assertFalse(equiv(
//         Entry(1, 1, 1),
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         0))
// }
// 
// @Test
// fun equiv_CollisionNode_Entry() {
//     assertFalse(equiv(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         Entry(1, 1, 1),
//         0))
// }
// 
// @Test
// fun equiv_CollisionNode_ArrayNode() {
//     assertFalse(equiv(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         0))
// }
// 
// @Test
// fun equiv_CollisionNode_CollisionNode_Equal() {
//     assertTrue(equiv(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         0))
// }
// 
// @Test
// fun equiv_CollisionNode_CollisionNode_DiffHash() {
//     assertFalse(equiv(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         makeCollisionNode(Entry(2, 3, 3), Entry(2, 4, 4)),
//         0))
// }
// 
// @Test
// fun equiv_CollisionNode_CollisionNode_DiffSize() {
//     assertFalse(equiv(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2), Entry(1, 3, 3)),
//         0))
// }
// 
// @Test
// fun equiv_CollisionNode_CollisionNode_DiffContent() {
//     assertFalse(equiv(
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 3)),
//         0))
// }
// 
// @Test
// fun equiv_ArrayNode_Entry() {
//     assertFalse(equiv(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         Entry(1, 1, 1),
//         0))
// }
// 
// @Test
// fun equiv_ArrayNode_CollisionNode() {
//     assertFalse(equiv(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         makeCollisionNode(Entry(1, 1, 1), Entry(1, 2, 2)),
//         0))
// }
// 
// @Test
// fun equiv_ArrayNode_ArrayNode_Equal() {
//     assertTrue(equiv(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         0))
// }
// 
// @Test
// fun equiv_ArrayNode_ArrayNode_DiffSize() {
//     assertFalse(equiv(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2), Entry(3, 3, 3)),
//         0))
// }
// 
// @Test
// fun equiv_ArrayNode_ArrayNode_DiffEntry() {
//     assertFalse(equiv(
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 2)),
//         makeArrayNodeOf(Entry(1, 1, 1), Entry(2, 2, 3)),
//         0))
// }
// }
// 

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
