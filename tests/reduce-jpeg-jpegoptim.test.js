"use strict";

const ImageReducer = require("../libs/ImageReducer");
const ImageData    = require("../libs/ImageData");

const expect  = require("chai").expect;
const fs      = require("fs");
const path    = require("path");
const fixture = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});

describe("Reduce JPEG with JpegOptim Test", () => {
    let reducer;

    beforeEach(() => {
        reducer = new ImageReducer({
            jpegOptimizer: "jpegoptim"
        });
    });

    it("Reduce JPEG", (done) => {
        var image = new ImageData("fixture/fixture.jpg", "fixture", fixture);

        reducer.exec(image)
        .then((reduced) => {
            expect(reduced.data.length > 0).to.be.true;
            expect(reduced.data.length).to.be.below(fixture.length);
            done();
        })
        .catch((msg) => {
            throw new Error(msg);
            done();
        });
    });
});
