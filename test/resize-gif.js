"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const bind         = require("./_bind");
const gm           = require("gm").subClass({ imageMagick: true });
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");

const gmP = (...args) => pify(bind(gm(...args)));

let image;

test.before(async t => {
    const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.gif`);
    image = new ImageData("fixture/fixture.gif", "fixture", fixture);
});

test("Resize GIF with gifsicle", async t => {
    const resizer = new ImageResizer({size: 200});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.width, 200);
});

test("Convert GIF to JPEG", async t => {
    const resizer = new ImageResizer({size: 200, format: "jpg"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.format();

    t.is(out, "JPEG");
});
