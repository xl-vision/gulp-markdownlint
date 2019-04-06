const PluginError = require('plugin-error')
const through2 = require('through2')
const MarkdownLint = require('markdownlint')
const path = require('path')
const pluginName = 'gulp-markdownlint'

module.exports = function gulpMarkdownlint(options) {

    let configFile = options.configFile || 'markdownlint.json'

    if (!path.isAbsolute(configFile)) {
        configFile = path.join(process.cwd(), configFile)
    }

    delete options.configFile

    let config = MarkdownLint.readConfigSync(configFile)

    const files = []

    function onFile(file, encoding, done) {
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

    function onStreamEnd(done) {
        MarkdownLint({
            ...options,
            files: files,
            config: config
        }, (err, ret) => {
            if (err) {
                this.emit('error', new PluginError(pluginName, err))
            } else {
                const message = ret.toString(true)

                if (message) {
                    this.emit('error', new PluginError(pluginName, message))
                }
            }
            done()
        })
    }

    return through2.obj(onFile, onStreamEnd).resume()
}