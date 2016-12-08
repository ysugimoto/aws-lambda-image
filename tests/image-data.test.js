"use strict";

const ImageData  = require("../libs/ImageData");

const expect     = require("chai").expect;

describe("ImageData combineWithDirectory Test", () => {
    let image = new ImageData("a/b/c/key.png", "bucket", "data", {});

    it("No directory", () => {
        expect(image.combineWithDirectory(undefined)).to.equal("a/b/c/key.png");
    });

    it("Empty directory", () => {
        expect(image.combineWithDirectory("")).to.equal("key.png");
    });

    it("Relative directory", () => {
        expect(image.combineWithDirectory("./d")).to.equal("a/b/c/d/key.png");
    });

    it("Internal directory", () => {
        expect(image.combineWithDirectory("./d/e")).to.equal("a/b/c/d/e/key.png");
    });

    it("External directory", () => {
        expect(image.combineWithDirectory("..")).to.equal("a/b/key.png");
    });

    it("External internal directory", () => {
        expect(image.combineWithDirectory("../d")).to.equal("a/b/d/key.png");
    });

    it("Root directory", () => {
        expect(image.combineWithDirectory("d")).to.equal("d/key.png");
    });

    it("Root internal directory", () => {
        expect(image.combineWithDirectory("d/e")).to.equal("d/e/key.png");
    });
});
