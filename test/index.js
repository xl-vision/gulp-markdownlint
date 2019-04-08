const gulp = require('gulp')
const path = require('path')
const gulpMarkdownlint = require('../src')

const resolve = glob => path.join(__dirname, 'files', glob)

describe('test index', () => {
  it('check error message', () => {
    expect.assertions(1)
    // eslint-disable-next-line promise/param-names
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

  // it('check console message with reporters', () => {
  //   expect.assertions(1)
  //   jest.spyOn(console, 'info')
  //     .mockImplementation(message => {
  //       expect(message.replace(/^.*\n/, '')).toMatchSnapshot()
  //     })

  //   // eslint-disable-next-line promise/param-names
  //   return new Promise((resolved) => {
  //     gulp.src(resolve('base.md'))
  //       .pipe(gulpMarkdownlint({
  //         configFile: resolve('markdownlint.json'),
  //         reporters: [{
  //           formatter: 'verbose',
  //           console: true,
  //           save: 'test/files/log.txt'
  //         }]
  //       }))
  //       .on('error', () => resolved())
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
          console.log(err)
          expect(err.message.replace(/.*base.md/g, '')).toMatchSnapshot()
        })
        .on('finish', resolved)
    })
  })

  it('provide config object instead of config file', () => {
    expect.assertions(1)
    // eslint-disable-next-line promise/param-names
    return new Promise((resolved) => {
      gulp.src(resolve('base.md'))
        .pipe(gulpMarkdownlint({
          configFile: false,
          config: {
            MD022: { lines_above: 0, lines_below: 0 }
          }
        }))
        .on('error', err => {
          console.log(err)
          expect(err.message.replace(/.*base.md/g, '')).toMatchSnapshot()
          resolved()
        })
    })
  })
})
