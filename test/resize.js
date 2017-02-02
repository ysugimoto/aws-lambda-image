"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
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

test("If ACL parameter is passed while resizing use original pme", async t => {
	const resizer = new ImageResizer({size: 200});
	const resized = await resizer.exec(image);

	t.is(resized.acl, 'private');
});

test("Ensuring that ACL parameter is passed while resizing", async t => {
	const resizer = new ImageResizer({size: 200, acl: 'public-read'});
	const resized = await resizer.exec(image);

	t.is(resized.acl, 'public-read');
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