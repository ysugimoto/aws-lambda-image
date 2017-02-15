"use strict";

const ImageReducer = require("../lib/ImageReducer");
const ImageData    = require("../lib/ImageData");
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");
const fsP          = pify(fs);

test("Reduce GIF Test", async t => {
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.gif`);
    const reducer = new ImageReducer({quality: 90});
    const image = new ImageData("fixture/fixture.gif", "fixture", fixture);

    const reduced = await reducer.exec(image);
    t.true(reduced.data.length > 0);
    t.true(reduced.data.length < fixture.length);
});
