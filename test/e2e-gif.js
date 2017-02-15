"use strict";

const ImageReducer = require("../lib/ImageReducer");
const ImageData    = require("../lib/ImageData");
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");
const fsP          = pify(fs);

test("Optimize GIF Test", async t => {
    const reducer = new ImageReducer();
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.gif`);
    const image = new ImageData("fixture/fixture.gif", "fixture", fixture);

    const reduced = await reducer.exec(image);
    t.true(reduced.data.length < fixture.length);
});
