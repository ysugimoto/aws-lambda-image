"use strict";

const Optimizer = require("./Optimizer");

class Gifsicle extends Optimizer {
    /**
     * Gifsicle optimizer
     *
     * @constructor
     * @extends Optimizer
     * @param Array|undefined args
     */
    constructor(args = ["--optimize"]) {
        super();

        this.command = this.findBin("gifsicle");
        this.args    = args;
    }
}

module.exports = Gifsicle;
