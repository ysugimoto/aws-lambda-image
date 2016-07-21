"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const ImageMagick  = require("imagemagick");

const expect     = require("chai").expect;
const fs         = require("fs");
const path       = require("path");
const destPath   = path.join(__dirname, "/fixture/fixture_resized.gif");

describe("Resize GIF Test", () => {

    it("Resize GIF with gifsicle", (done) => {
        const resizer = new ImageResizer({size: 200});
        const buffer  = fs.readFileSync(path.join(__dirname, "/fixture/fixture.gif"), {encoding: "binary"});
        const image   = new ImageData("fixture/fixture.gif", "fixture", buffer);

        resizer.exec(image)
        .then((resized) => {
            fs.writeFileSync(destPath, resized.data, {encoding: "binary"});
            ImageMagick.identify(["-format", "%w", destPath], (err, out) => {
                if ( err ) {
                    expect.fail(err);
                } else {
                    expect(parseInt(out, 10)).to.equal(200);
                }
                fs.unlinkSync(destPath);
                done();
            });
        })
        .catch((err) => {
            throw new Error(err);
            done();
        });

    });

});
