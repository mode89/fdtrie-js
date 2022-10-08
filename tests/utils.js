import * as utils from "utils.js";

test("equal", () => {
    expect(utils.equal({a: 1, b: 2})).toBe(utils.equal({b: 2, a: 1}));
})
