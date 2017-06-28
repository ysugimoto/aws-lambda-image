"use strict";

const Optimizer = require("./Optimizer");

class Mozjpeg extends Optimizer {
    /**
     * MozJpeg(cjpeg) optimizer
     *
     * @constructor
     * @extends Optimizer
     * @param Number|undefined quality
     * @param Array|undefined args
     */
    constructor(quality, args) {
        super();

        this.command = this.findBin("cjpeg");
        this.args    = args || ["-optimize", "-progressive"];

        // determine quality if supplied
        if ( quality ) {
            this.args.unshift(quality);
            this.args.unshift("-quality");
        }
    }
}

module.exports = Mozjpeg;
