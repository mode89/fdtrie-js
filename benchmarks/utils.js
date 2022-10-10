import bm from "benchmark";

export function suite(name, units = "ms") {
    return new bm.Suite(name)
        .on("start", (s) => {
            console.log(s.currentTarget.name);
        })
        .on("cycle", (event) => {
            const b = event.target;
            const mult = unitsMultiplier(units);
            console.log(
                "  " + b.name +
            ": " + Math.floor(b.stats.mean * mult) + " " + units);
        });
}

export function* range(a, b) {
    const from = b === undefined ? 0 : a;
    const to = b === undefined ? a : b;
    for (let i = from; i < to; i ++) {
        yield i;
    }
}

export function reduce(f, init, col) {
    var result = init;
    for (const it of col) {
        result = f(result, it);
    }
    return result;
}

function unitsMultiplier(units) {
    switch (units) {
    case "ms": return 1000;
    case "us": return 1000000;
    case "ns": return 1000000000;
    default: throw "Unknown type of units: " + units;
    }
}
