const PluginError = require('plugin-error')
const through2 = require('through2')
const MarkdownLint = require('markdownlint')
const path = require('path')
const pluginName = 'gulp-markdownlint'
const fs = require('fs')
const reporterFactory = require('./reporter-factory')

module.exports = function gulpMarkdownlint (options = {}) {
  let configFile = options.configFile || 'markdownlint.json'

  let config = options.config || {}

  if (configFile && fs.existsSync(configFile)) {
    if (!path.isAbsolute(configFile)) {
      configFile = path.join(process.cwd(), configFile)
    }
    const tempConfig = MarkdownLint.readConfigSync(configFile)
    config = { ...tempConfig, ...config }
  }

  const reporters = options.reporters || [ { formatter: 'verbose', console: true } ]

  if (!Array.isArray(reporters)) {
    throw new PluginError(pluginName, 'The reporters only supports array')
  }

  const reportersFunction = reporterFactory(reporters)

  const failAfterError = options.failAfterError === undefined ? true : options.failAfterError

  delete options.configFile
  delete options.formatter
  delete options.failAfterError
  delete options.config

  const files = []

  function onFile (file, encoding, done) {
    if (file.isNull()) {
      done(null, file)
      return
    }
    if (file.isStream()) {
      this.emit('error', new PluginError(pluginName, 'Streaming is not supported'))
      done()
      return
    }
    const filePath = file.path

    files.push(filePath)
    done(null, file)
  }

  function onStreamEnd (done) {
    MarkdownLint({
      ...options,
      files: files,
      config: config
    }, (err, ret) => {
      if (err) {
        this.emit('error', new PluginError(pluginName, err))
      } else {
        reportersFunction(ret)

        const allMessage = ret.toString(true)
        if (failAfterError && allMessage) {
          this.emit('error', new PluginError(pluginName, allMessage))
        }
      }
      done()
    })
  }

  return through2.obj(onFile, onStreamEnd).resume()
}
