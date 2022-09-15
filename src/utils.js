import _ from "lodash";

export function equal(x, y) {
    return _.isEqual(x, y);
}

export function immArraySet(arr, i, x) {
    const newArr = [...arr];
    newArr[i] = x;
    return newArr;
}

export function immArrayAdd(arr, x) {
    const newArr = [...arr];
    newArr.push(x);
    return newArr;
}

export function immArrayRemove(arr, i) {
    const newArr = [...arr];
    newArr.splice(i, 1);
    return newArr;
}

export function hash(x) {
    if (Number.isSafeInteger(x)) {
        return x & 0xFFFFFFFF;
    } else if (typeof x === "string") {
        return hashString(0, x);
    } else if (x === null || x === undefined) {
        return 0;
    } else {
        return hashString(0, JSON.stringify(x));
    }
}

function hashString(h, s) {
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        h = (h << 5) - h + c;
        h &= h; // Convert to 32bit integer
    }
    return h;
}
