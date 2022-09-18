import bm from "benchmark";

export function suite(name) {
    return new bm.Suite(name)
    .on("start", (s) => {
        console.log(s.currentTarget.name);
    })
    .on("cycle", (event) => {
        const b = event.target;
        console.log(
            "  " + b.name +
            ": " + Math.floor(b.stats.mean * 1000) + " ms");
    })
}

export function* range(a, b) {
    const from = b === undefined ? 0 : a;
    const to = b === undefined ? a : b;
    for (let i = from; i < to; i ++) {
        yield i
    }
}

export function reduce(f, init, col) {
    var result = init;
    for (const it of col) {
        result = f(result, it);
    }
    return result;
}
