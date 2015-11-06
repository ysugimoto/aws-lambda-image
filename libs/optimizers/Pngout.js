var Optimizer = require("./Optimizer");

/**
 * pngout optimizer
 *
 * @constructor
 * @extends Optimizer
 */
function Pngout() {
    Optimizer.call(this);

    this.command = this.findBin("pngout");
    this.args    = ["-", "-", "-s0", "-k0", "-f0"];
}

module.exports = Optimizer.extend(Pngout);
