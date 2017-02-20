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

test("Convert JPEG to PNG", async t => {
    const resizer = new ImageResizer({size: 200, format: "png"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.format();

    t.is(out, "PNG");
});

test("Convert JPEG to GIF", async t => {
    const resizer = new ImageResizer({size: 200, format: "gif"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.format();

    t.is(out, "GIF");
});
