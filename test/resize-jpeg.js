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
    const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.jpg`);
    image = new ImageData("fixture/fixture.jpg", "fixture", fixture);
});

test("Resize JPEG with cjpeg", async t => {
    const resizer = new ImageResizer({size: 200});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.width, 200);
});

test("Resize JPEG with jpegoptim", async t => {
    const resizer = new ImageResizer({size: 200, jpegOptimizer: "jpegoptim"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.width, 200);
});

test("Resize JPEG by default keep aspect ratio", async t => {
    const resizer = new ImageResizer({size: "200x200"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.height, 200);
    t.false(out.width === 200);
});

test("Resize JPEG can be forced to change aspect ratio", async t => {
    const resizer = new ImageResizer({size: "200x200!"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.height, 200);
    t.is(out.width, 200);
});