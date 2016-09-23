"use strict";

const ImageResizer = require("../libs/ImageResizer");
const ImageData    = require("../libs/ImageData");
const gm = require("gm").subClass({ imageMagick: true });

const expect     = require("chai").expect;
const fs         = require("fs");
const path       = require("path");
const destPath   = path.join(__dirname, "/fixture/fixture_resized.jpg");

describe("Resize JPEG Test", () => {

    it("Resize JPEG with cjpeg", (done) => {
        const resizer = new ImageResizer({size: 200});
        const buffer  = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});
        const image   = new ImageData("fixture/fixture.jpg", "fixture", buffer);

        resizer.exec(image)
        .then((resized) => {
            fs.writeFileSync(destPath, resized.data, {encoding: "binary"});
            gm(destPath).size((err, out) => {
                if ( err ) {
                    expect.fail(err);
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

    it("Resize JPEG with jpegoptim", (done) => {
        const resizer = new ImageResizer({size: 200, jpegOptimizer: "jpegoptim"});
        const buffer  = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});
        const image   = new ImageData("fixture/fixture.jpg", "fixture", buffer);

        resizer.exec(image)
        .then((resized) => {
            fs.writeFileSync(destPath, resized.data, {encoding: "binary"});
            gm(destPath).size((err, out) => {
                if ( err ) {
                    expect.fail(err);
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
});
