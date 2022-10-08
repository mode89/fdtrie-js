import * as fc from "fast-check";
import _ from "lodash";
import {PHashMap} from "map.js";
import * as utils from "utils.js";

test("build", () => fc.assert(
    fc.property(
        genOpsAndKeys(),
        opsAndKeys => {
            const ops = opsAndKeys.ops;
            const keys = opsAndKeys.keys;
            const m = applyOpsToMap(ops, new Map());
            const pm = applyOpsToPHashMap(
                ops, PHashMap.blank(testKeyHasher));
            expectSimilar(m, pm, keys);
        }),
    { numRuns: 1000 }
));

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
));

test("entries", () => fc.assert(
    fc.property(
        genKeyValuePairs(),
        kvs => {
            const m = kvs.reduce(
                (mi, e) => mi.assoc(e[0], e[1]),
                PHashMap.blank(testKeyHasher));
            const entries = Array.from(m.entries())
                .map(e => [e.key, e.value]);
            const compare =
                (a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1;
            kvs.sort(compare);
            entries.sort(compare);
            expect(entries).toEqual(kvs);
        }),
    { numRuns: 1000 }
));

test("hash", () => fc.assert(
    fc.property(
        fc.anything(),
        x => {
            const h = utils.hash(x);
            expect(h).toBeGreaterThanOrEqual(-0x80000000);
            expect(h).toBeLessThanOrEqual(0x7FFFFFFF);
        }),
    { numRuns: 10000 }
));

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
        if (!rMap.has(key) || lValue !== rMap.get(key)) {
            m.set(key, lValue);
        }
    }
    return m;
}

function expectSimilar(m, pm, knownKeys) {
    const m2 = new Map();
    const notFound = new Object();
    for (const key of knownKeys) {
        const value = pm.get(key, notFound);
        if (value !== notFound) {
            m2.set(key, value);
        }
    }
    expect(m2).toStrictEqual(m);
    expect(m.size).toBe(pm.count());
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
        keys => fc.infiniteStream(fc.constantFrom(...knownValues)).chain(
            valuesStream => {
                const values = Array.from(valuesStream.take(keys.length));
                const m = new Map(_.zip(keys, values));
                return fc.constant(m);
            }));
}

function genKeyValuePairs() {
    return genKeys().chain(
        keys => fc.infiniteStream(genObject()).chain(
            valuesStream => {
                const values = Array.from(valuesStream.take(keys.length));
                const pairs = _.zip(keys, values);
                return fc.constant(pairs);
            }));
}

function genOpsAndKeys() {
    return genKeys().chain(
        keys => genValues().chain(
            values => genOps(keys, values).chain(
                ops => fc.constant({ ops, keys }))));
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
    });
}

function genDissocOp(keys) {
    return fc.record({
        type: fc.constant("dissoc"),
        key: fc.constantFrom(...keys)
    });
}

function genKeys() {
    const keyValues = fc.array(
        genObject(), {minLength: 1, size: "medium"})
        .map(vs => _.uniqBy(vs, JSON.stringify));
    const hashes = fc.uniqueArray(
        fc.integer(), {minLength: 2, size: "medium"});
    return keyValues.chain(
        vs => hashes.chain(
            hs => {
                const length = vs.length;
                const keys = new Array(length);
                for (let i = 0; i < length; ++ i) {
                    const h = hs[i % hs.length];
                    keys[i] = { value: vs[i], hash: h };
                }
                return fc.constant(keys);
            }));
}

function genValues() {
    return fc.uniqueArray(
        fc.anything({
            values: [
                fc.boolean(),
                fc.integer(),
                fc.double({
                    // Because NaN !== NaN messes up map difference
                    noNaN: true,
                }),
                fc.string(),
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                ),
            ]
        }),
        {minLength: 1, size: "medium"});
}

function genObject() {
    return fc.anything();
}

function testKeyHasher(key) {
    return key.hash;
}
