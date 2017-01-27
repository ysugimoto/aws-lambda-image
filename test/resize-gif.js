"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const gm = require("gm").subClass({ imageMagick: true });
const test         = require("ava");
const pify         = require("pify");
const fs           = require("fs");
const fsP          = pify(fs);

test("Resize GIF with gifsicle", async t => {
    const fixture  = fs.readFileSync(`${__dirname}/fixture/fixture.gif`);
    const destPath = `${__dirname}/fixture/fixture_resized.gif`;
    const resizer = new ImageResizer({size: 200});
    const image   = new ImageData("fixture/fixture.gif", "fixture", fixture);

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
