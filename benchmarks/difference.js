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

export const singleKeyDifference = utils.suite("Single key difference", "us")
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

function immDiff(m1, m2) {
    return m1.filter((v1, k) => {
        const v2 = m2.get(k);
        return v1 !== v2;
    });
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
