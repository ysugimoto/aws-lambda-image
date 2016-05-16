var ImageReducer = require("../libs/ImageReducer");
var ImageData    = require("../libs/ImageData");

var expect  = require("chai").expect;
var fs      = require("fs");
var path    = require("path");
var fixture = fs.readFileSync(path.join(__dirname, "/fixture/fixture.png"), {encoding: "binary"});

describe("Reduce PNG Test", function() {
    var reducer;

    beforeEach(function() {
        reducer = new ImageReducer();
    });

    it("Reduce PNG", function(done) {
        var image = new ImageData("fixture/fixture.png", "fixture", fixture);

        reducer.exec(image)
        .then(function(reduced) {
            expect(reduced.getData().length).to.be.below(fixture.length);
            done();
        })
        .catch(function(err) {
            console.log(err);
            done();
        });
    });
});
