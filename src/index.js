const PluginError = require('plugin-error')
const through2 = require('through2')
const MarkdownLint = require('markdownlint')
const path = require('path')
const pluginName = 'gulp-markdownlint'

module.exports = function gulpMarkdownlint(options = {}) {

    let configFile = options.configFile || 'markdownlint.json'

    const formatter = options.formatter || 'verbose'

    const allowWarnings = options.allowWarnings || false

    delete options.configFile
    delete options.formatter
    delete options.allowWarnings


    if (!path.isAbsolute(configFile)) {
        configFile = path.join(process.cwd(), configFile)
    }


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
                const errorMessage = ret.toString(true)
                if (errorMessage) {
                    const message = formatResult(ret, formatter)

                    if (allowWarnings) {
                        console.warn(message)
                    } else {
                        console.error(message)
                    }
                    this.emit('error', new PluginError(pluginName, errorMessage))
                }

            }
            done()
        })
    }

    return through2.obj(onFile, onStreamEnd).resume()
}


function formatResult(result, formatter) {

    if (formatter === 'json') {
        return JSON.stringify(result)
    }
    if (formatter === 'verbose') {
        const files = Object.keys(result)
        const messageArr = []
        for (const file of files) {
            const arr = result[file]
            if (!arr && arr.length === 0) {
                continue
            }
            const tempArr = []
            for (const item of arr) {
                const lineNumber = item['lineNumber']
                const ruleNames = item['ruleNames']
                const ruleDescription = item['ruleDescription']
                const ruleInformation = item['ruleInformation']
                const errorContext = item['errorContext']
                const errorDetail = item['errorDetail']
                const errorRange = item['errorRange']

                let message = `\n\tline ${lineNumber}`
                if (errorRange) {
                    message += `,start ${errorRange[0]},end ${errorRange[1]})`
                }
                message += `: ${errorContext}`
                message += `\n\t${ruleNames[0]}: ${ruleDescription} (${ruleInformation})`
                if (errorDetail) {
                    message += `\n\tmessage: ${errorDetail}`
                }

                tempArr.push(message)
            }
            messageArr.push(`${file}:${tempArr.join('\n')}`)
        }

        return messageArr.join('\n\n')
    }
    return ''
}