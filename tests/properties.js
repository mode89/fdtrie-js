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

    test("difference", () => fc.assert(
        fc.property(
            genMapAndOps(),
            sample => {
                const keys = sample.keys;
                const ops = sample.ops;
                const m1 = sample.m;
                const m2 = applyOpsToMap(ops, m1);
                const pm1 = makePHashMapFromMap(m1, testKeyHasher);
                const pm2 = applyOpsToPHashMap(ops, pm1);
                expectSimilar(
                    mapDifference(m1, m2),
                    pm1.difference(pm2),
                    keys);
                expectSimilar(
                    mapDifference(m2, m1),
                    pm2.difference(pm1),
                    keys);
            }),
        { numRuns: 1000 }
    ))
})

function makePHashMapFromMap(m, keyHasher) {
    var pm = PHashMap.blank(keyHasher);
    for (const [key, value] of m.entries()) {
        pm = pm.assoc(key, value);
    }
    return pm;
}

function applyOpsToMap(ops, m0) {
    const m = new Map();
    for (const [key, value] of m0.entries()) {
        m.set(key, value);
    }
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

function mapDifference(lMap, rMap) {
    const m = new Map();
    for (const [key, lValue] of lMap.entries()) {
        if (!rMap.has(key) || !Object.is(lValue, rMap.get(key))) {
            m.set(key, lValue);
        }
    }
    return m;
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

function genMapAndOps() {
    return genKeys().chain(
        keys => genValues().chain(
            values => fc.record({
                keys: fc.constant(keys),
                m: genMap(keys, values),
                ops: genOps(keys, values),
            })));
}

function genMap(knownKeys, knownValues) {
    return fc.uniqueArray(fc.constantFrom(...knownKeys)).chain(
        keys => {
            const m = new Map();
            const values = fc.constantFrom(...knownValues);
            for (const k of keys) {
                m.set(k, fc.sample(values, 1)[0])
            }
            return fc.constant(m);
        })
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
