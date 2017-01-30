/**
 * Introduced because of pify not able to handle properly prototype methods. Hopefully will be fixed in one of the next
 * releases.
 *
 * Details: https://github.com/sindresorhus/pify/issues/36#issuecomment-276013691
 */

"use strict";

module.exports = function (obj) {
    for (const key in obj) {
        const val = obj[key];

        if (typeof val === 'function') {
            obj[key] = val.bind(obj);
        }
    }

    return obj;
};