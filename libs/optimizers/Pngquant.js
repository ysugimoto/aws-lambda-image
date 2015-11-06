var Optimizer = require("./Optimizer");

/**
 * pngquant optimizer
 *
 * @constructor
 * @extends Optimizer
 */
function Pngquant() {
    Optimizer.call(this);

    this.command = this.findBin("pngquant");
    this.args    = ["--speed=1", "256", "-"];
}

module.exports = Optimizer.extend(Pngquant);


