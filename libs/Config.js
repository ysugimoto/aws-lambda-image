/**
 * Task configuration getter interface
 *
 * @constructor
 * @param Object setting
 */
function Config(setting) {
    this.stack = setting || {};
}

/**
 * Get the config value
 *
 * @public
 * @param String key
 * @param Mixed def
 * @return Mixed
 */
Config.prototype.get = function Config_get(key, def) {
    return ( key in this.stack ) ? this.stack[key] : def || null;
};

/**
 * Set the config value
 *
 * @public
 * @param String key
 * @param mixed value
 * @return Mixed
 */
Config.prototype.set = function Config_set(key, value) {
    this.stack[key] = value;
};

/**
 * Check the config exists
 *
 * @public
 * @param String key
 * @return Boolean
 */
Config.prototype.exists = function Config_exists(key) {
    return ( key in this.stack );
};

module.exports = Config;
