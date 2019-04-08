const gulp = require('gulp')
const path = require('path')
const gulpMarkdownlint = require('../src')

const resolve = glob => path.join(__dirname, 'files', glob)

describe('test index', () => {
  it('check error message', () => {
    expect.assertions(1)
    return new Promise((resolve) => {
      gulp.src(resolve('base.md'))
        .pipe(gulpMarkdownlint({
          configFile: resolve('markdownlint.json')
        }))
        .on('error', err => {
          expect(err.message.replace(/.*base.md/g, '')).toMatchSnapshot()
          resolve()
        })
    })
  })

  it('check console message with formater: verbose', () => {
    expect.assertions(1)
    jest.spyOn(console, 'info')
      .mockImplementation(message => {
        expect(message.replace(/^.*\n/, '')).toMatchSnapshot()
      })

    // eslint-disable-next-line promise/param-names
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
    jest.spyOn(console, 'info')
      .mockImplementation(message => {
        expect(message.replace(/".*base.md/g, '')).toMatchSnapshot()
      })

    // eslint-disable-next-line promise/param-names
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
    jest.spyOn(console, 'info')
      .mockImplementation(message => {
        expect(message).toBe('')
      })

    // eslint-disable-next-line promise/param-names
    return new Promise((resolved) => {
      gulp.src(resolve('base.md'))
        .pipe(gulpMarkdownlint({
          configFile: resolve('markdownlint.json'),
          formatter: 'none'
        }))
        .on('error', () => {
          resolved()
        })
    })
  })

  // it('check error with failAfterError: true', () => {
  //   expect.assertions(1)
  //   return new Promise((resolved) => {
  //     gulp.src(resolve('base.md'))
  //       .pipe(gulpMarkdownlint({
  //         configFile: resolve('markdownlint.json'),
  //         failAfterError: true
  //       }))
  //       .on('error', err => {
  //         console.log(err)
  //         expect(err.message.replace(/.*base.md/g, '')).toMatchSnapshot()
  //         resolved()
  //       })

  //   })

  // })

  it('check error with failAfterError: false', () => {
    expect.assertions(0)
    // eslint-disable-next-line promise/param-names
    return new Promise((resolved) => {
      gulp.src(resolve('base.md'))
        .pipe(gulpMarkdownlint({
          configFile: resolve('markdownlint.json'),
          failAfterError: false
        }))
        .on('error', err => {
          expect(err.message.replace(/.*base.md/g, '')).toMatchSnapshot()
          resolved()
        })
        .on('end', resolved)
    })
  })

  it('provide config object instead of config file', () => {
    expect.assertions(1)
    jest.spyOn(console, 'info')
      .mockImplementation(message => {
        expect(message.replace(/^.*\n/, '')).toMatchSnapshot()
      })

    // eslint-disable-next-line promise/param-names
    return new Promise((resolved) => {
      gulp.src(resolve('base.md'))
        .pipe(gulpMarkdownlint({
          configFile: false,
          config: {
            MD022: { lines_above: 0, lines_below: 0 }
          },
          allowWarnings: true
        }))
        .on('error', () => resolved())
    })
  })
})
