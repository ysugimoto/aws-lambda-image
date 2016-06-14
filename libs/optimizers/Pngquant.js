"use strict";

import Optimizer from "./Optimizer";

export default class Pngquant extends Optimizer {

    /**
     * pngquant optimizer
     *
     * @constructor
     * @extends Optimizer
     */
    constructor() {
        super();

        this.command = this.findBin("pngquant");
        this.args    = ["--speed=1", "256", "-"];
    }
}
