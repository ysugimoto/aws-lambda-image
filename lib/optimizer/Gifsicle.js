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
    constructor(args) {
        super();

        this.command = this.findBin("gifsicle");
        this.args    = args || ["--optimize"];
    }
}

module.exports = Gifsicle;
