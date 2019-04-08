const path = require('path')
const fs = require('fs')

// 过滤掉没有错误的结果
function filterResult (result) {
  const obj = {}
  const files = Object.keys(result)
  for (const file of files) {
    const arr = result[file]
    if (!arr || arr.length === 0) {
      continue
    }
    obj[file] = arr
  }
  return obj
}

function verboseFormatter (ret) {
  const files = Object.keys(ret)
  const messageArr = []
  for (const file of files) {
    const arr = ret[file]
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

function reporterFactory (reporters) {
  return function (ret) {
    if (!reporters || !Array.isArray(reporters)) {
      return
    }
    const filterRet = filterResult(ret)

    reporters.forEach(reporter => {
      const formatter = reporter.formatter
      let msg = ''
      if (typeof formatter === 'function') {
        msg = formatter(filterRet)
      } else if (formatter === 'verbose') {
        msg = verboseFormatter(filterRet)
      }
      if (!msg) {
        return
      }
      if (reporter.console) {
        console.info(msg)
      }
      if (reporter.save) {
        let filePath = reporter.save
        if (!path.isAbsolute(filePath)) {
          filePath = path.join(process.cwd(), filePath)
        }
        fs.writeFileSync(filePath, msg)
      }
    })
  }
}

module.exports = reporterFactory
