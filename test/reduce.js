"use strict";

const ImageReducer = require("../libs/ImageReducer");
const ImageData    = require("../libs/ImageData");
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");

let image;

test.before(async t => {
	const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.jpg`);
	image = new ImageData("fixture/fixture.jpg", "fixture", fixture);
});

test("Ensuring that ACL parameter is passed while reducing", async t => {
	const reducer = new ImageReducer({quality: 90, acl: 'public-read'});
	const reduced = await reducer.exec(image);

	t.is(reduced.acl, 'public-read');
});
