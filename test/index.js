const gulp = require('gulp')
const path = require('path')
const gulpMarkdownlint = require('../src')

const resolve = glob => path.join(__dirname, 'files', glob)


describe('test index', () => {
    it('should not emit error when file is right', () => {
        return new Promise((resolved) => {
            gulp.src(resolve('base.md'))
                .pipe(gulpMarkdownlint({
                    configFile: resolve('markdownlint.json')
                }))
                .on('error', err => {
                    expect(err.message).toMatch(/MD041/)
                    resolved()
                })

        })

    })
})