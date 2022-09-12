import * as fc from "fast-check";
import {PHashMap} from "map.js"

describe("properties", () => {
    test("build", () => fc.assert(
        fc.property(
            genOpsAndKeys(),
            opsAndKeys => {
                const ops = opsAndKeys.ops;
                const keys = opsAndKeys.keys;
                const m = applyOpsToMap(ops, new Map());
                const pm = applyOpsToPHashMap(
                    ops, PHashMap.blank(testKeyHasher));
                expectSimilar(m, pm, keys)
            }),
        { numRuns: 1000 }
    ))
})

function applyOpsToMap(ops, m0) {
    const m = new Map(m0);
    for (const op of ops) {
        switch (op.type) {
            case "assoc":
                m.set(op.key, op.value);
                break;
            case "dissoc":
                m.delete(op.key);
                break;
            default:
                throw "Unknown op: " + op.type;
        }
    }
    return m;
}

function applyOpsToPHashMap(ops, m0) {
    return ops.reduce(
        (m, op) => {
            switch (op.type) {
                case "assoc":
                    return m.assoc(op.key, op.value);
                case "dissoc":
                    return m.dissoc(op.key);
                default:
                    throw "Unknown op: " + op.type;
            }
        }, m0);
}

function expectSimilar(m, pm, knownKeys) {
    const m2 = new Map();
    const notFound = new Object();
    for (const key of knownKeys) {
        const value = pm.get(key, notFound)
        if (value !== notFound) {
            m2.set(key, value);
        }
    }
    expect(m2).toStrictEqual(m);
}

function genOpsAndKeys() {
    return genKeys().chain(
        keys => genValues().chain(
            values => genOps(keys, values).chain(
                ops => fc.constant({ ops, keys }))))
}

function genOps(keys, values) {
    return fc.array(genOp(keys, values), {size: "medium"});
}

function genOp(keys, values) {
    return fc.oneof(
        genAssocOp(keys, values),
        genDissocOp(keys));
}

function genAssocOp(keys, values) {
    return fc.record({
        type: fc.constant("assoc"),
        key: fc.constantFrom(...keys),
        value: fc.constantFrom(...values),
    })
}

function genDissocOp(keys) {
    return fc.record({
        type: fc.constant("dissoc"),
        key: fc.constantFrom(...keys)
    })
}

function genKeys() {
    const keyValues = fc.uniqueArray(
        genObject(), {minLength: 1, size: "medium"});
    const hashes = fc.uniqueArray(
        fc.integer(), {minLength: 2, size: "medium"});
    return keyValues.chain(
        vs => hashes.chain(
            hs => {
                const arbHs = fc.constantFrom(...hs);
                const keys = vs.map(
                    v => ({ value: v, hash: fc.sample(arbHs, 1)[0] }));
                return fc.constant(keys);
            }));
}

function genValues() {
    return fc.uniqueArray(genObject(), {minLength: 1, size: "medium"});
}

function genObject() {
    return fc.anything();
}

function testKeyHasher(key) {
    return key.hash;
}
