"use strict";

const ImageReducer = require("../lib/ImageReducer");
const ImageData    = require("../lib/ImageData");
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");

let image;

test.before(async t => {
    const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.jpeg`);
    image = new ImageData("fixture/fixture.jpeg", "fixture", fixture, {}, "private");
});

test("If ACL parameter is passed while reducing use original one", async t => {
    const reducer = new ImageReducer({quality: 90});
    const reduced = await reducer.exec(image);

    t.is(reduced.acl, 'private');
});

test("Ensuring that ACL parameter is passed while reducing", async t => {
    const reducer = new ImageReducer({quality: 90, acl: 'public-read'});
    const reduced = await reducer.exec(image);

    t.is(reduced.acl, 'public-read');
});

test("Reduce adds prefix and suffix to filename", async t => {
    const reducer = new ImageReducer({prefix: "a_", suffix: "_b"});
    const reduced = await reducer.exec(image);

    t.is(reduced.fileName, "fixture/a_fixture_b.jpg");
});

test("Reduce keeps original extension", async t => {
    const reducer = new ImageReducer({keepOriginalExtension: true});
    const reduced = await reducer.exec(image);

    t.is(reduced.fileName, "fixture/fixture.jpeg");
});
