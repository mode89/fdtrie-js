import {PHashMap} from "../src/map.js";
import imm from "immutable";
import mori from "mori";
import * as utils from "./utils.js";

const pm0 = utils.reduce(
    (m, it) => m.assoc(it, it),
    PHashMap.blank(),
    utils.range(100000));

const im0 = utils.reduce(
    (m, it) => m.set(it, it),
    new imm.Map(),
    utils.range(100000));

const mm0 = utils.reduce(
    (m, it) => mori.assoc(m, it, it),
    mori.hashMap(),
    utils.range(100000));

const nm0 = utils.reduce(
    (m, it) => m.set(it, it),
    new Map(),
    utils.range(100000));

export const getSuite = utils.suite("Get a value by a key")
.add("PHashMap", () => {
    for (let i = 0; i < 100000; ++ i) {
        pm0.get(i);
    }
})
.add("ImmutableJS", () => {
    for (let i = 0; i < 100000; ++ i) {
        im0.get(i);
    }
})
.add("Mori", () => {
    for (let i = 0; i < 100000; ++ i) {
        mori.get(mm0, i);
    }
})
.add("Native", () => {
    for (let i = 0; i < 100000; ++ i) {
        nm0.get(i);
    }
})
