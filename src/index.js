const PluginError = require('plugin-error')
const through2 = require('through2')
const MarkdownLint = require('markdownlint')
const path = require('path')
const pluginName = 'gulp-markdownlint'
const fs = require('fs')

module.exports = function gulpMarkdownlint(options = {}) {

    let configFile = options.configFile || 'markdownlint.json'

    let config = options.config || {}

    if(configFile && fs.existsSync(configFile)){
        if (!path.isAbsolute(configFile)) {
            configFile = path.join(process.cwd(), configFile)
        }
        const tempConfig = MarkdownLint.readConfigSync(configFile)
        config = {...tempConfig, ...config}
    }

    const formatter = options.formatter || 'verbose'

    const failAfterError = options.failAfterError === undefined ? true : options.failAfterError

    delete options.configFile
    delete options.formatter
    delete options.failAfterError
    delete options.config

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
                const allMessage = ret.toString(true)

                const message = formatResult(ret, formatter)
                console.info(message)

                if(failAfterError && allMessage) {
                    this.emit('error', new PluginError(pluginName, allMessage))
                }

            }
            done()
        })
    }

    return through2.obj(onFile, onStreamEnd).resume()
}


// 过滤掉没有错误的结果
function filterResult(result){
    const obj = {}
    const files = Object.keys(result)
    for (const file of files) {
        const arr = result[file]
        if(!arr || arr.length === 0){
            continue
        }
        obj[file] = arr
    }
    return obj
}

function formatResult(result, formatter) {

    result = filterResult(result)

    if (formatter === 'json') {
        return JSON.stringify(result)
    }
    if (formatter === 'verbose') {
        const files = Object.keys(result)
        const messageArr = []
        for (const file of files) {
            const arr = result[file]
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