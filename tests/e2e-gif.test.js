"use strict";

const ImageReducer = require("../libs/ImageReducer");
const ImageData    = require("../libs/ImageData");

const expect  = require("chai").expect;
const fs      = require("fs");
const path    = require("path");
const fixture = fs.readFileSync(path.join(__dirname, "/fixture/fixture.gif"), {encoding: "binary"});

describe("Optimize GIF Test", () => {
    let reducer;

    beforeEach(() => {
        reducer = new ImageReducer();
    });

    it("Optimize GIF", (done) => {
        const image = new ImageData("fixture/fixture.gif", "fixture", fixture);

        reducer.exec(image)
        .then((reduced) => {
            expect(reduced.data.length).to.be.below(fixture.length);
            done();
        })
        .catch((err) => {
            console.log(err);
            done();
        });
    });
});
