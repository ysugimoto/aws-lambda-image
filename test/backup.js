"use strict";

const ImageArchiver = require("../libs/ImageArchiver");
const ImageData    = require("../libs/ImageData");
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");

let image;

test.before(async t => {
    const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.jpg`);
    image = new ImageData("fixture/fixture.jpg", "fixture", fixture, {}, "private");
});

test("If ACL parameter is passed while reducing use original pme", async t => {
    const reducer = new ImageArchiver({});
    const reduced = await reducer.exec(image);

    t.is(reduced.acl, 'private');
});

test("Ensuring that ACL parameter is passed while reducing", async t => {
    const reducer = new ImageArchiver({acl: 'public-read'});
    const reduced = await reducer.exec(image);

    t.is(reduced.acl, 'public-read');
});
