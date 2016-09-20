"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const gm = require("gm").subClass({ imageMagick: true });

const expect     = require("chai").expect;
const fs         = require("fs");
const path       = require("path");
const destPath   = path.join(__dirname, "/fixture/fixture_resized.png");

describe("Resize PNG Test", () => {

    it("Resize PNG", (done) => {
        const resizer = new ImageResizer({size: 200});
        const image = new ImageData(
            "fixture/fixture.png",
            "fixture",
            fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"})
        );

        resizer.exec(image)
        .then((resized) => {
            fs.writeFileSync(destPath, resized.data, {encoding: "binary"});
            gm(destPath).size((err, out) => {
                if ( err ) {
                    expect.fail();
                } else {
                    expect(out.width).to.equal(200);
                }
                fs.unlinkSync(destPath);
                done();
            });
        })
        .catch((err) => {
            done(err);
        });
    });

    it("Convert PNG to JPEG", (done) => {
        const resizer = new ImageResizer({size: 200, format: "jpg"});
        const image = new ImageData(
            "fixture/fixture.png",
            "fixture",
            fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"})
        );

        resizer.exec(image)
        .then((resized) => {
            fs.writeFileSync(destPath, resized.data, {encoding: "binary"});
            gm(destPath).format((err, out) => {
                if ( err ) {
                    expect.fail();
                } else {
                    expect(out).to.equal("JPEG");
                }
                fs.unlinkSync(destPath);
                done();
            });
        })
        .catch((err) => {
            done(err);
        });
    });
});
