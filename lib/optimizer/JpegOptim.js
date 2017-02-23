"use strict";

const Optimizer = require("./Optimizer");

class Jpegoptim extends Optimizer {
    /**
     * JpegOption optimizer
     *
     * @constructor
     * @extends Optimizer
     * @param Number|undefined quality
     */
    constructor(quality) {
        super();

        this.command = this.findBin("jpegoptim");
        this.args    = ["--stdin", "-s", "--all-progressive", "--stdout"];

        // determine quality if supplied
        if ( quality ) {
            this.args.unshift(quality);
            this.args.unshift("-m");
        }
    }
}

module.exports = Jpegoptim;
