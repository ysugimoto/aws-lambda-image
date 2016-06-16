"use strict";

const Optimizer = require("./Optimizer");

class Jpegoptim extends Optimizer {
    /**
     * JpegOption optimizer
     *
     * @constructor
     * @extends Optimizer
     */
    constructor() {
        super();

        this.command = this.findBin("jpegoptim");
        this.args    = ["--stdin", "-s", "--all-progressive", "--stdout"];
    }
}

module.exports = Jpegoptim;
