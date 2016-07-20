"use strict";

const ImageReducer = require("../libs/ImageReducer");
const ImageData    = require("../libs/ImageData");

const expect  = require("chai").expect;
const fs      = require("fs");
const path    = require("path");
const fixture = fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"});

describe("Reduce PNG Test", () => {
    let reducer;

    beforeEach(() => {
        reducer = new ImageReducer();
    });

    it("Reduce PNG", (done) => {
        const image = new ImageData("fixture/fixture.png", "fixture", fixture);

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
