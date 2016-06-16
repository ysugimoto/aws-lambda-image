"use strict";

const Optimizer = require("./Optimizer");

class Mozjpeg extends Optimizer {
    /**
     * MozJpeg(cjpeg) optimizer
     *
     * @constructor
     * @extends Optimizer
     */
    constructor() {
        super();

        this.command = this.findBin("cjpeg");
        this.args    = ["-optimize", "-progressive"];
    }
}

module.exports = Mozjpeg;
