"use strict";

const ImageArchiver = require("../lib/ImageArchiver");
const ImageData     = require("../lib/ImageData");
const test          = require("ava");
const pify          = require("pify");
const fs            = require("fs");

let image;

test.before(async t => {
    const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.jpg`);
    image = new ImageData("fixture/fixture.jpg", "fixture", fixture, {}, "private");
});

test("If ACL parameter is passed while reducing use original one", async t => {
    const archiver = new ImageArchiver({});
    const archived = await archiver.exec(image);

    t.is(archived.acl, 'private');
});

test("Ensuring that ACL parameter is passed while reducing", async t => {
    const archiver = new ImageArchiver({acl: 'public-read'});
    const archived = await archiver.exec(image);

    t.is(archived.acl, 'public-read');
});

test("Backup adds prefix and suffix to filename", async t => {
    const archiver = new ImageArchiver({prefix: "a_", suffix: "_b"});
    const archived = await archiver.exec(image);

    t.is(archived.fileName, "fixture/a_fixture_b.jpg");
});
