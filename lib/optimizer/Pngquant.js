"use strict";

const Optimizer = require("./Optimizer");

class Pngquant extends Optimizer {

    /**
     * pngquant optimizer
     *
     * @constructor
     * @extends Optimizer
     * @param Array|undefined args
     */
    constructor(args = ["--speed=1", "256"]) {
        super();

        this.command = this.findBin("pngquant");
        this.args    = args;

        if ( this.args.indexOf("-") === -1 ) {
            this.args.push("-");
        } 
    }
}

module.exports = Pngquant;
