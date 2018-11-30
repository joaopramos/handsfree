const {forEach} = require('lodash')

module.exports = Handsfree => {
  /**
   * Adds a plugin
   * @param {Object} config The config object, in the form:
   * {
   *   // [required] The plugin name, which is how you access it: handsfree.plugin[pluginName]
   *   name: {String},
   *
   *   // Called once when the .use method is called and after the plugin is added to the instance
   *   onUse: {Function (face)},
   *
   *   // Called once per frame, after calculations
   *   onFrame: {Function}
   * }
   */
  Handsfree.prototype.use = function (config) {
    this.plugin[config.name] = config
    
    // Add disable(), enable(), and _isDisabled
    config._isDisabled = config._isDisabled || false
    config.disable = function () {
      this._isDisabled = true
      this.onDisable && this.onDisable(this)
    }
    config.enable = function () {
      this._isDisabled = false
      this.onEnable && this.onEnable(this)
    }
    
    // Call onUse hook
    !config._isDisabled && config.onUse && config.onUse()

    // Sort alphabetically
    let newPlugins = {}
    Object.keys(this.plugin).sort().forEach(key => newPlugins[key] = this.plugin[key])
    this.plugin = newPlugins

    return this.plugin[config.name]
  }

  /**
   * Called when .stop() is called
   */
  Handsfree.prototype.onStopHooks = function () {
    forEach(this.plugin, (config) => {
      !config._isDisabled && config.onStop && config.onStop.call(config, this)
    })
  }

  /**
   * Called once per frame, after calculations
   */
  Handsfree.prototype.onStartHooks = function () {
    forEach(this.plugin, (config) => {
      !config._isDisabled && config.onStart && config.onStart.call(config, this)
    })
  }

  /**
   * Called once per frame, after calculations
   */
  Handsfree.prototype.onFrameHooks = function (faces) {
    forEach(this.plugin, (config) => {
      if (!config._isDisabled && config.onFrame) {
        const newFaces = config.onFrame.call(config, faces, this)
        if (newFaces) this.faces = newFaces
      }
    })
  }

  /**
   * Loads all the core plugins
   */
  Handsfree.prototype.loadPlugins = function () {
    this.use(require('./plugins/Scrolling'))
    this.use(require('./plugins/SmileClick'))
    this.use(require('./plugins/SimpleKeyboard'))
  }
}