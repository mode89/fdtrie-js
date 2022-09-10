export function is(x, y) {
    return Object.is(x, y);
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
