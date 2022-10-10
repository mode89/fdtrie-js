import {PHashMap} from "../src/map.js";
import imm from "immutable";
import mori from "mori";
import * as utils from "./utils.js";

const pm1 = utils.reduce(
    (m, it) => m.assoc(it, it),
    PHashMap.blank(),
    utils.range(100000));
const pm2 = pm1.assoc(42, 43);
const pm3 = utils.reduce(
    (m, it) => m.assoc(it, it + 1),
    pm1,
    utils.range(100000));

const im1 = utils.reduce(
    (m, it) => m.set(it, it),
    new imm.Map(),
    utils.range(100000));
const im2 = im1.set(42, 43);
const im3 = utils.reduce(
    (m, it) => m.set(it, it + 1),
    im1,
    utils.range(100000));

const mm1 = utils.reduce(
    (m, it) => mori.assoc(m, it, it),
    mori.hashMap(),
    utils.range(100000));
const mm2 = mori.assoc(mm1, 42, 43);
const mm3 = utils.reduce(
    (m, it) => mori.assoc(m, it, it + 1),
    mm1,
    utils.range(100000));

export const singleKeyDifference = utils.suite("Single key difference", "ns")
    .add("PHashMap", () => {
        pm1.difference(pm2);
    })
    .add("ImmutableJS", () => {
        immDiff(im1, im2);
    })
    .add("Mori", () => {
        moriDiff(mm1, mm2);
    });

export const allKeysDifference = utils.suite("All keys difference", "ms")
    .add("PHashMap", () => {
        pm1.difference(pm3);
    })
    .add("ImmutableJS", () => {
        immDiff(im1, im3);
    })
    .add("Mori", () => {
        moriDiff(mm1, mm3);
    });

export const reduceDiffSingleKey = utils.suite(
    "Reduce difference (single key)", "ns")
    .add("PHashMap", () => {
        pm1.reduceDifference(pm2, 42, {});
    })
    .add("ImmutableJS", () => {
        immReduceDiff(im1, im2, 42, {});
    })
    .add("Mori", () => {
        moriReduceDiff(mm1, mm2, 42, {});
    });

export const reduceDiffAllKeys = utils.suite(
    "Reduce difference (all keys)", "ms")
    .add("PHashMap", () => {
        pm1.reduceDifference(pm3, 42, {});
    })
    .add("ImmutableJS", () => {
        immReduceDiff(im1, im3, 42, {});
    })
    .add("Mori", () => {
        moriReduceDiff(mm1, mm3, 42, {});
    });

function immDiff(m1, m2) {
    return m1.filter((v1, k) => {
        const v2 = m2.get(k);
        return v1 !== v2;
    });
}

function immReduceDiff(m1, m2, acc, {
    remove = (k, v, acc) => acc,
    change = (k, oldV, newV, acc) => acc,
    add = (k, v, acc) => acc, }) {

    acc = m1.reduce(
        (acc, v1, k) => {
            return m1.has(k) ? acc : remove(k, v1, acc);
        }, acc);

    acc = m2.reduce(
        (acc, v2, k) => {
            const v1 = m1.get(k);
            if (v1 === undefined) {
                return add(k, v2, acc);
            } else if (v1 !== v2) {
                return change(k, v1, v2, acc);
            } else {
                return acc;
            }
        }, acc);

    return acc;
}

function moriDiff(m1, m2) {
    const m = mori.reduceKV((tm, k, v1) => {
        const v2 = mori.get(m2, k);
        return v1 === v2
            ? tm
            : mori.mutable.assoc(tm, k, v1);
    }, mori.mutable.thaw(mori.hashMap()), m1);
    return mori.mutable.freeze(m);
}

function moriReduceDiff(m1, m2, acc, {
    remove = (k, v, acc) => acc,
    change = (k, oldV, newV, acc) => acc,
    add = (k, v, acc) => acc, }) {

    acc = mori.reduceKV(
        (acc, k, v1) => {
            const v2 = mori.get(m2, k);
            return v2 === undefined ? remove(k, v1, acc) : acc;
        }, acc, m1);

    acc = mori.reduceKV(
        (acc, k, v2) => {
            const v1 = mori.get(m1, k);
            if (v1 === undefined) {
                return add(k, v2, acc);
            } else if (v1 !== v2) {
                return change(k, v1, v2, acc);
            } else {
                return acc;
            }
        }, acc, m2);

    return acc;
}
