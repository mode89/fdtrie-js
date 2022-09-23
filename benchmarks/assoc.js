import {PHashMap} from "../src/map.js";
import imm from "immutable";
import mori from "mori";
import * as utils from "./utils.js";

export const assocSuite = utils.suite("Associate a key with a value")
    .add("PHashMap", () => {
        var m = PHashMap.blank();
        for (let i = 0; i < 100000; ++ i) {
            m = m.assoc(i, i);
        }
    })
    .add("ImmutableJS", () => {
        var m = imm.Map();
        for (let i = 0; i < 100000; ++ i) {
            m = m.set(i, i);
        }
    })
    .add("Mori", () => {
        var m = mori.hashMap();
        for (let i = 0; i < 100000; ++ i) {
            m = mori.assoc(m, i, i);
        }
    })
    .add("Native", () => {
        const m = new Map();
        for (let i = 0; i < 100000; ++ i) {
            m.set(i, i);
        }
    });
