"use strict";

const ImageReducer = require("../libs/ImageReducer");
const ImageData    = require("../libs/ImageData");
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");
const fsP          = pify(fs);

test("Reduce JPEG with JpegOptim", async t => {
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.jpg`);
    const reducer = new ImageReducer({jpegOptimizer: "jpegoptim"});
    const image = new ImageData("fixture/fixture.jpg", "fixture", fixture);

    const reduced = await reducer.exec(image);
    t.true(reduced.data.length > 0);
    t.true(reduced.data.length < fixture.length);
});
