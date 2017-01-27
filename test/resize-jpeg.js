"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const gm = require("gm").subClass({ imageMagick: true });
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");
const fsP          = pify(fs);

test("Resize JPEG with cjpeg", async t => {
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.jpg`);
    const destPath = `${__dirname}/fixture/fixture_resized_1.jpg`;
    const resizer = new ImageResizer({size: 200});
    const image   = new ImageData("fixture/fixture.jpg", "fixture", fixture);

    const resized = await resizer.exec(image);
    await fsP.writeFile(destPath, resized.data);
    gm(destPath).size((err, out) => {
        if ( err ) {
            t.fail(err);
        } else {
            t.is(out.width, 200);
        }
        fs.unlinkSync(destPath);
    });
});

test("Resize JPEG with jpegoptim", async t => {
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.jpg`);
    const destPath = `${__dirname}/fixture/fixture_resized_2.jpg`;
    const resizer = new ImageResizer({size: 200, jpegOptimizer: "jpegoptim"});
    const image   = new ImageData("fixture/fixture.jpg", "fixture", fixture);

    const resized = await resizer.exec(image);
    await fsP.writeFile(destPath, resized.data);
    gm(destPath).size((err, out) => {
        if ( err ) {
            t.fail(err);
        } else {
            t.is(out.width, 200);
        }
        fs.unlinkSync(destPath);
    });
});
