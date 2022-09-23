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

export const deleteSuite = utils.suite("Delete a key")
    .add("PHashMap", () => {
        var m = pm0;
        for (let i = 0; i < 100000; ++ i) {
            m = m.dissoc(i);
        }
    })
    .add("ImmutableJS", () => {
        var m = im0;
        for (let i = 0; i < 100000; ++ i) {
            m = m.delete(i);
        }
    })
    .add("Mori", () => {
        var m = mm0;
        for (let i = 0; i < 100000; ++ i) {
            m = mori.dissoc(m, i);
        }
    })
    .add("Native", () => {
        for (let i = 0; i < 100000; ++ i) {
            nm0.delete(i);
        }
    });
