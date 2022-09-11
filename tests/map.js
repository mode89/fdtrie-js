import {PHashMap} from "map.js"

describe("PHashMap", () => {

    describe("blank", () => {

        test("make", () => {
            const m = PHashMap.blank()
            expect(PHashMap.blank()).toBe(m);
            expect(m.count()).toBe(0);
        })

        test("hasher", () => {
            const hasher = x => x;
            const m = PHashMap.blank(hasher);
            expect(m).toBe(PHashMap.blank(hasher));
            expect(m).not.toBe(PHashMap.blank());
            expect(m.count()).toBe(0);
        })

        test("get", () => {
            const m = PHashMap.blank();
            expect(m.get(1, 42)).toBe(42);
        })
    })

    describe("assoc", () => {

        test("blank", () => {
            const m0 = PHashMap.blank();
            const m1 = m0.assoc(1, 42);
            expect(m0).toBe(PHashMap.blank());
            expect(m0).not.toBe(m1);
            expect(m0.get(1)).toBe(undefined);
            expect(m1.get(1)).toBe(42);
        })

        test("non-empty", () => {
            const m0 = PHashMap.blank();
            const m1 = m0.assoc(1, 2);
            const m2 = m1.assoc(3, 4);

            expect(m0).not.toBe(m1);
            expect(m0).not.toBe(m2);
            expect(m1).not.toBe(m2);

            expect(m0.count()).toBe(0);
            expect(m0.get(1)).toBeUndefined();
            expect(m0.get(2)).toBeUndefined();
            expect(m0.get(3)).toBeUndefined();
            expect(m0.get(4)).toBeUndefined();

            expect(m1.count()).toBe(1);
            expect(m1.get(1)).toBe(2);
            expect(m1.get(2)).toBeUndefined();
            expect(m1.get(3)).toBeUndefined();
            expect(m1.get(4)).toBeUndefined();

            expect(m2.count()).toBe(2);
            expect(m2.get(1)).toBe(2);
            expect(m2.get(2)).toBeUndefined();
            expect(m2.get(3)).toBe(4);
            expect(m2.get(4)).toBeUndefined();
        })

        test("same entry", () => {
            const m0 = PHashMap.blank();
            const m1 = m0.assoc(1, 42);
            const m2 = m1.assoc(1, 42);
            expect(m0).not.toBe(m1);
            expect(m1).toBe(m2);
        })

        test("keep hasher", () => {
            const hasher = x => x;
            const m0 = PHashMap.blank(hasher);
            const m1 = m0.assoc(1, 42);
            expect(m0.keyHasher).toBe(hasher);
            expect(m1.keyHasher).toBe(hasher);
        })
    })

    describe("dissoc", () => {

        test("blank", () => {
            const m = PHashMap.blank().dissoc(1);
            expect(m).toBe(PHashMap.blank());
        })

        test("missing key", () => {
            const m = PHashMap.blank().assoc(1, 42);
            expect(m.dissoc(2)).toBe(m);
        })

        test("return blank", () => {
            const m = PHashMap.blank().assoc(1, 42);
            expect(m.dissoc(1)).toBe(PHashMap.blank());
        })

        test("return new map", () => {
            const m = PHashMap.blank().assoc(1, 2).assoc(3, 4).dissoc(1);
            expect(m.get(1, "nothing")).toBe("nothing");
            expect(m.get(3)).toBe(4);
        })

        test("keep hasher", () => {
            const hasher = x => x;
            const m = PHashMap.blank(hasher).assoc(1, 42);
            expect(m.dissoc(1).keyHasher).toBe(hasher);
        })
    })

    describe("count", () => {

        test("empty", () => {
            expect(PHashMap.blank().count()).toBe(0);
        })

        test("non-empty", () => {
            expect(PHashMap.blank().assoc(1, 42).count()).toBe(1);
        })
    })

    describe("difference", () => {

        test("wrong hasher", () => {
            expect(
                () => PHashMap.blank()
                    .difference(PHashMap.blank(x => x)))
                .toThrow("Can't calculate difference");
        })

        test("same as left", () => {
            const m1 = PHashMap.blank().assoc(1, 1);
            const m2 = m1.assoc(1, 2);
            expect(m1.difference(m2)).toBe(m1);
        })

        test("no difference", () => {
            const hasher = x => x;
            const m1 = PHashMap.blank(hasher).assoc(1, 1);
            const m2 = PHashMap.blank(hasher).assoc(1, 1);
            expect(m1.difference(m2)).toBe(PHashMap.blank(hasher));
        })

        test("new map", () => {
            const hasher = x => x;
            const m1 = PHashMap.blank(hasher).assoc(1, 1);
            const m2 = m1.assoc(2, 2);
            const m3 = m1.assoc(3, 3);
            const md = m2.difference(m3);
            expect(md.count()).toBe(1);
            expect(md.get(1)).toBeUndefined();
            expect(md.get(2)).toBe(2);
            expect(md.get(3)).toBeUndefined();
            expect(md.keyHasher).toBe(hasher);
        })
    })
})
