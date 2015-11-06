var Optimizer = require("./Optimizer");

/**
 * MozJpeg(cjpeg) optimizer
 *
 * @constructor
 * @extends Optimizer
 */
function Mozjpeg() {
    Optimizer.call(this);

    this.command = this.findBin("cjpeg");
    this.args    = ["-optimize", "-progressive"];
}

module.exports = Optimizer.extend(Mozjpeg);


