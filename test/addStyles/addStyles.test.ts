import { describe, it } from 'mocha'
import { expect } from 'chai'
import requireGlob from 'require-glob'
import jscodeshift from 'jscodeshift'
import addStyles from '../../src/addStyles'
import * as path from 'path'

describe(`addStyles`, function() {
  const fixtures = requireGlob.sync('./fixtures/*.js')
  for (const key in fixtures) {
    const { input, output, parser, file } = fixtures[key]
    const j = jscodeshift.withParser(parser || 'babylon')
    const position = input.indexOf('// position')
    it(key.replace(/\.js$/, ''), function() {
      const root = j(input.replace(/^\s*\/\/\s*position.*(\r\n?|\n)/gm, ''))
      addStyles(root, {
        file: file || path.join(__dirname, 'test.js'),
        position,
        Theme: /\.tsx?$/.test(file)
          ? null
          : {
              file: path.resolve(__dirname, '../../src/universal/theme'),
              identifier: 'Theme',
            },
      })
      expect(root.toSource().trim()).to.equal(output.trim())
    })
  }
})
