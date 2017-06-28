"use strict";

const Optimizer = require("./Optimizer");

class Jpegoptim extends Optimizer {
    /**
     * JpegOption optimizer
     *
     * @constructor
     * @extends Optimizer
     * @param Number|undefined quality
     * @param Array|undefined args
     */
    constructor(quality, args) {
        super();

        this.command = this.findBin("jpegoptim");
        this.args    = args || ["-s", "--all-progressive"];

        // determine quality if supplied
        if ( quality ) {
            this.args.unshift(quality);
            this.args.unshift("-m");
        }

        if ( this.args.indexOf("--stdin") === -1 ) {
            this.args.unshift("--stdin");
        }
        if ( this.args.indexOf("--stdout") === -1 ) {
            this.args.push("--stdout");
        }
    }
}

module.exports = Jpegoptim;
