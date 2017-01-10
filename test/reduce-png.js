"use strict";

const ImageReducer = require("../libs/ImageReducer");
const ImageData    = require("../libs/ImageData");
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");
const fsP          = pify(fs);

test("Reduce PNG", async t => {
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.png`);
    const reducer = new ImageReducer();
    const image = new ImageData("fixture/fixture.png", "fixture", fixture);

    const reduced = await reducer.exec(image);
    t.true(reduced.data.length < fixture.length);
});
