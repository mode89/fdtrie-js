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

// 
// fun getEntry(node: Any, shift: Int, keyHash: Int, key: Any?): Entry? {
//     return when (node) {
//         is ArrayNode -> {
//             val childIndex = arrayIndex(shift, keyHash)
//             val child = node.children[childIndex]
//             if (child != null)
//                 getEntry(child, shift + 5, keyHash, key)
//             else null
//         }
//         is Entry ->
//             if (node.keyHash == keyHash && node.key == key)
//                 node
//             else null
//         is CollisionNode ->
//             if (node.keyHash == keyHash)
//                 node.children.firstOrNull { it.key == key }
//             else null
//         else -> throw UnsupportedOperationException()
//     }
// }
// 
// fun dissoc(node: Any, shift: Int, keyHash: Int, key: Any?): Any? {
//     return when (node) {
//         is ArrayNode -> dissocArrayNode(node, shift, keyHash, key)
//         is Entry -> dissocEntry(node, keyHash, key)
//         is CollisionNode -> dissocCollisionNode(node, keyHash, key)
//         else -> throw UnsupportedOperationException()
//     }
// }
// 
// private fun dissocArrayNode(
//         node: ArrayNode,
//         shift: Int,
//         keyHash: Int,
//         key: Any?): Any {
//     val childIndex = arrayIndex(shift, keyHash)
//     val child = node.children[childIndex]
//     return if (child != null) {
//         val newChild = dissoc(child, shift + 5, keyHash, key)
//         if (child == newChild) {
//             node
//         } else {
//             val newChildrenCount = if (newChild != null) {
//                 node.childrenCount
//             } else {
//                 node.childrenCount - 1
//             }
// 
//             if (newChildrenCount == 0) {
//                 throw UnsupportedOperationException(
//                     "If no children left, that means the ArrayNode had "
//                     + "only one entry under it, which isn't allowed")
//             } else {
//                 // If only one child left and it isn't an ArrayNode,
//                 // we should return this child, instead
//                 val returnChild = if (newChildrenCount == 1) {
//                     if (newChild != null) {
//                         if (newChild is ArrayNode) null else newChild
//                     } else {
//                         // Should always succeed, because ArrayNode must
//                         // have at least two entries under it
//                         val lastChild = node.children.first(
//                             { it != null && it != child })
//                         if (lastChild is ArrayNode) null else lastChild
//                     }
//                 } else {
//                     null
//                 }
// 
//                 if (returnChild == null) {
//                     ArrayNode(
//                         node.children.immSet(childIndex, newChild),
//                         newChildrenCount,
//                         node.entryCount - 1)
//                 } else {
//                     returnChild
//                 }
//             }
//         }
//     } else {
//         node
//     }
// }
// 
// private fun dissocEntry(
//         node: Entry,
//         keyHash: Int,
//         key: Any?): Any? {
//     return if (node.keyHash == keyHash && node.key == key) {
//         null
//     } else {
//         node
//     }
// }
// 
// private fun dissocCollisionNode(
//         node: CollisionNode,
//         keyHash: Int,
//         key: Any?): Any {
//     return if (node.keyHash != keyHash) {
//         node
//     } else {
//         val childIndex = node.children.indexOfFirst { it.key == key }
//         if (childIndex == -1) {
//             node
//         } else {
//             if (node.children.size > 2) {
//                 CollisionNode(
//                     node.children.immRemoveAt(childIndex),
//                     keyHash)
//             } else {
//                 // Should always succeed, because CollisionNode must have
//                 // at least two children
//                 node.children.first { it.key != key }
//             }
//         }
//     }
// }
// 
// fun difference(lNode: Any?, rNode: Any?, shift: Int): Any? {
//     return if (lNode === rNode) {
//         null
//     } else if (lNode != null && rNode != null) {
//         when (lNode) {
//             is ArrayNode -> differenceA(lNode, rNode, shift)
//             is Entry -> differenceE(lNode, rNode, shift)
//             is CollisionNode -> differenceC(lNode, rNode, shift)
//             else -> throw UnsupportedOperationException()
//         }
//     } else {
//         lNode
//     }
// }
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
// private fun differenceE(lEntry: Entry, rNode: Any, shift: Int): Any? {
//     return when (rNode) {
//         is Entry -> {
//             if (lEntry.key == rNode.key && lEntry.value == rNode.value) {
//                 null
//             } else {
//                 lEntry
//             }
//         }
//         else -> {
//             val rEntry = getEntry(rNode, shift, lEntry.keyHash, lEntry.key)
//             if (rEntry == null) {
//                 lEntry
//             } else if (lEntry === rEntry || lEntry.value == rEntry.value) {
//                 null
//             } else {
//                 lEntry
//             }
//         }
//     }
// }
// 
// private fun differenceC(lNode: CollisionNode, rNode: Any, shift: Int): Any? {
//     return when (rNode) {
//         is Entry -> differenceXE(lNode, rNode, shift)
//         else -> {
//             val children = lNode.children.filter(
//                 fun(lEntry): Boolean {
//                     val rEntry = getEntry(
//                         rNode, shift, lEntry.keyHash, lEntry.key)
//                     return if (rEntry == null) {
//                         true
//                     } else {
//                         lEntry.value != rEntry.value
//                     }
//                 })
//             if (children.size == 0) {
//                 null
//             } else if (children.size == 1) {
//                 children.get(0)
//             } else if (children.size == lNode.children.size) {
//                 lNode
//             } else {
//                 CollisionNode(children, lNode.keyHash)
//             }
//         }
//     }
// }
// 
// private fun differenceXE(lNode: Any, rEntry: Entry, shift: Int): Any? {
//     val lEntry = getEntry(lNode, shift, rEntry.keyHash, rEntry.key)
//     return if (lEntry == null) {
//         lNode
//     } else if (lEntry === rEntry || lEntry.value == rEntry.value) {
//         dissoc(lNode, shift, rEntry.keyHash, rEntry.key)
//     } else {
//         lNode
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

// 
// private fun <T> List<T>.immRemoveAt(i: Int): List<T> {
//     val arr = ArrayList(this)
//     arr.removeAt(i)
//     return arr
// }
