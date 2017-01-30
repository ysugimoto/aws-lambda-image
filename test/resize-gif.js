"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const gm           = require("gm").subClass({ imageMagick: true });
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");

let image;

test.before(async t => {
    const fixture = await pify(fs.readFile)(`${__dirname}/fixture/fixture.gif`);
    image = new ImageData("fixture/fixture.gif", "fixture", fixture);
});

test.cb("Resize GIF with gifsicle", t => {
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

test.cb("Convert GIF to JPEG", t => {
    const resizer = new ImageResizer({size: 200, format: "jpg"});
    resizer.exec(image).then(result => {
        gm(result.data).format((err, out) => {
            if ( err ) {
                t.fail(err);
            } else {
                t.is(out, "JPEG");
            }
            t.end();
        });
    });
});
