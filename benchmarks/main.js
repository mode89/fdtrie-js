import bm from "benchmark"
import {PHashMap} from "../src/map.js"

const m0 = reduce(
    (m, it) => m.assoc(it, it),
    PHashMap.blank(),
    range(1000000));

const nm0 = reduce(
    (m, it) => m.set(it, it),
    new Map(),
    range(1000000));

const suite = new bm.Suite;
suite
.add("Map.set", () => {
    for (let i = 0; i < 1000000; ++ i) {
        nm0.set(i, i);
    }
})
.add("Map.get", () => {
    for (let i = 0; i < 1000000; ++ i) {
        const v = nm0.get(i);
    }
})
.add("PHashMap.assoc", () => {
    var m = PHashMap.blank();
    for (let i = 0; i < 1000000; ++ i) {
        m = m.assoc(i, i);
    }
})
.add("PHashMap.get", () => {
    for (let i = 0; i < 1000000; ++ i) {
        const v = m0.get(i);
    }
})
.add("PHashMap.dissoc", () => {
    var m = m0;
    for (let i = 0; i < 1000000; ++ i) {
        m = m.dissoc(i);
    }
})
.on("cycle", (event) => {
    const b = event.target;
    console.log(b.name + ": " + Math.floor(b.stats.mean * 1000) + " ms");
})
.run();

function* range(a, b) {
    const from = b === undefined ? 0 : a;
    const to = b === undefined ? a : b;
    for (let i = from; i < to; i ++) {
        yield i
    }
}

function reduce(f, init, col) {
    var result = init;
    for (const it of col) {
        result = f(result, it);
    }
    return result;
}
