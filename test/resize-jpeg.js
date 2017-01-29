"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const gm           = require("gm").subClass({ imageMagick: true });
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");

let image;

test.before(async t => {
    const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.jpg`);
    image   = new ImageData("fixture/fixture.jpg", "fixture", fixture);
});

test.cb("Resize JPEG with cjpeg", t => {
    const resizer = new ImageResizer({size: 200});
    resizer.exec(image).then(result => {
        gm(result.data).size((err, out) => {
            if ( err ) {
                t.fail(err);
            } else {
                t.is(out.width, 200);
            }
            t.end();
        });
    });
});

test.cb("Resize JPEG with jpegoptim", t => {
    const resizer = new ImageResizer({size: 200, jpegOptimizer: "jpegoptim"});
    resizer.exec(image).then(result => {
        gm(result.data).size((err, out) => {
            if ( err ) {
                t.fail(err);
            } else {
                t.is(out.width, 200);
            }
            t.end();
        });
    });
});

test.cb("Resize JPEG by default keep aspect ratio", t => {
    const resizer = new ImageResizer({size: "200x200", jpegOptimizer: "jpegoptim"});
    resizer.exec(image).then(result => {
        gm(result.data).size((err, out) => {
            if ( err ) {
                t.fail(err);
            } else {
                t.is(out.height, 200);
                t.false(out.width === 200);
            }
            t.end();
        });
    });
});

test.cb("Resize JPEG can be forced to change aspect ratio", t => {
    const resizer = new ImageResizer({size: "200x200!", jpegOptimizer: "jpegoptim"});
    resizer.exec(image).then(result => {
        gm(result.data).size((err, out) => {
            if ( err ) {
                t.fail(err);
            } else {
                t.is(out.height, 200);
                t.is(out.width, 200);
            }
            t.end();
        });
    });
});
