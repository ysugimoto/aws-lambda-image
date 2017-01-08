"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const gm = require("gm").subClass({ imageMagick: true });
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");
const fsP          = pify(fs);
const destPath     = `${__dirname}/fixture/fixture_resized.png`;

test("Resize PNG", async t => {
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.png`);
    const resizer = new ImageResizer({size: 200});
    const image = new ImageData("fixture/fixture.png", "fixture", fixture);

    const resized = await resizer.exec(image);
    await fsP.writeFile(destPath, resized.data);
    gm(destPath).size((err, out) => {
        if ( err ) {
            t.fail();
        } else {
            t.is(out.width, 200);
        }
        fs.unlinkSync(destPath);
    });
});

test("Convert PNG to JPEG", async t => {
    const fixture = await fsP.readFile(`${__dirname}/fixture/fixture.png`);
    const resizer = new ImageResizer({size: 200, format: "jpg"});
    const image = new ImageData("fixture/fixture.png", "fixture", fixture);

    const resized = await resizer.exec(image);
    await fsP.writeFile(destPath, resized.data);
    gm(destPath).format((err, out) => {
        if ( err ) {
            t.fail();
        } else {
            t.is(out, "JPEG");
        }
        fs.unlinkSync(destPath);
    });
});
