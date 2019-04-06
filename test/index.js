const gulp = require('gulp')
const path = require('path')
const gulpMarkdownlint = require('../src')

const resolve = glob => path.join(__dirname, 'files', glob)


describe('test index', () => {
    it('check error message', () => {
        expect.assertions(1)
        return new Promise((resolved) => {
            gulp.src(resolve('base.md'))
                .pipe(gulpMarkdownlint({
                    configFile: resolve('markdownlint.json')
                }))
                .on('error', err => {
                    expect(err.message.replace(/.*base.md/g, '')).toMatchSnapshot()
                    resolved()
                })

        })

    })

    it('check console message with formater: verbose', () => {
        expect.assertions(1)
        jest.spyOn(console, 'error')
            .mockImplementation(message => {
                expect(message.replace(/^.*\n/, '')).toMatchSnapshot()
            })


        return new Promise((resolved) => {
            gulp.src(resolve('base.md'))
                .pipe(gulpMarkdownlint({
                    configFile: resolve('markdownlint.json'),
                    formatter: 'verbose'
                }))
                .on('error', () => resolved())
        })

    })

    it('check console message with formater: json', () => {
        expect.assertions(1)
        jest.spyOn(console, 'error')
            .mockImplementation(message => {
                expect(message.replace(/".*base.md/g, '')).toMatchSnapshot()
            })


        return new Promise((resolved) => {
            gulp.src(resolve('base.md'))
                .pipe(gulpMarkdownlint({
                    configFile: resolve('markdownlint.json'),
                    formatter: 'json'
                }))
                .on('error', () => resolved())
        })

    })

    it('check console message with formater: none', () => {
        expect.assertions(1)
        jest.spyOn(console, 'error')
            .mockImplementation(message => {
                expect(message).toBe('')
            })


        return new Promise((resolved) => {
            gulp.src(resolve('base.md'))
                .pipe(gulpMarkdownlint({
                    configFile: resolve('markdownlint.json'),
                    formatter: 'none'
                }))
                .on('error', () => resolved())
        })

    })

    it('check console type with allowWarnings: true', () => {
        expect.assertions(1)
        jest.spyOn(console, 'warn')
            .mockImplementation(message => {
                expect(message.replace(/^.*\n/, '')).toMatchSnapshot()
            })


        return new Promise((resolved) => {
            gulp.src(resolve('base.md'))
                .pipe(gulpMarkdownlint({
                    configFile: resolve('markdownlint.json'),
                    allowWarnings: true
                }))
                .on('error', () => resolved())
        })

    })
})