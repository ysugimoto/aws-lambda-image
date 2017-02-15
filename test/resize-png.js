"use strict";

const ImageResizer = require("../lib/ImageResizer");
const ImageData    = require("../lib/ImageData");
const bindAll      = require('bind-all');
const gm           = require("gm").subClass({ imageMagick: true });
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");

const gmP = (...args) => pify(bindAll(gm(...args)));

let image;

test.before(async t => {
    const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.png`);
    image = new ImageData("fixture/fixture.png", "fixture", fixture);
});

test("Resize PNG", async t => {
    const resizer = new ImageResizer({size: 200});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.width, 200);
});

test("Convert PNG to JPEG", async t => {
    const resizer = new ImageResizer({size: 200, format: "jpg"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.format();

    t.is(out, "JPEG");
});
