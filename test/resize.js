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
    image = new ImageData("fixture/fixture.jpg", "fixture", fixture, {}, "private");
});

test("If ACL parameter is passed while resizing use original one", async t => {
    const resizer = new ImageResizer({size: 200});
    const resized = await resizer.exec(image);

    t.is(resized.acl, 'private');
});

test("Ensuring that ACL parameter is passed while resizing", async t => {
    const resizer = new ImageResizer({size: 200, acl: 'public-read'});
    const resized = await resizer.exec(image);

    t.is(resized.acl, 'public-read');
});

test("Resize doesn't add prefix and suffix to filename, it's covered by reducer", async t => {
    const resizer = new ImageResizer({size: 200, prefix: "a_", suffix: "_b"});
    const resized = await resizer.exec(image);

    t.is(resized.fileName, "fixture/fixture.jpg");
});

test("Resize by default keep aspect ratio", async t => {
    const resizer = new ImageResizer({size: "200x200"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.height, 200);
    t.false(out.width === 200);
});

test("Resize can be forced to change aspect ratio", async t => {
    const resizer = new ImageResizer({size: "200x200!"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.height, 200);
    t.is(out.width, 200);
});

test("Crop allows to trim image to given size", async t => {
    const resizer = new ImageResizer({size: "667x1000", crop: "200x200+0+0"});
    const resized = await resizer.exec(image);
    const gmImage = gmP(resized.data);
    const out = await gmImage.size();

    t.is(out.height, 200);
    t.is(out.width, 200);
});
