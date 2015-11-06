var ImageReducer = require("../libs/ImageReducer");
var ImageData    = require("../libs/ImageData");

var expect  = require("chai").expect;
var fs      = require("fs");
var path    = require("path");
var fixture = fs.readFileSync(path.join(__dirname, "/fixture/fixture.jpg"), {encoding: "binary"});

describe("Reduce JPEG Test", function() {
    var reducer;

    beforeEach(function() {
        reducer = new ImageReducer();
    });

    it("Reduce JPEG", function(done) {
        var image = new ImageData("fixture/fixture.jpg", "fixture", fixture);

        reducer.exec(image)
        .then(function(reduced) {
            expect(reduced.getData().length > 0).to.be.true;
            expect(reduced.getData().length).to.be.below(fixture.length);
            done();
        });
    });
});
