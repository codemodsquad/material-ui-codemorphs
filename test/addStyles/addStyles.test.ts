import { describe, it } from 'mocha'
import { expect } from 'chai'
import requireGlob from 'require-glob'
import jscodeshift from 'jscodeshift'
import addStyles from '../../src/addStyles'
import * as path from 'path'

const noop = (): void => {
  // noop
}

describe(`addStyles`, function() {
  const fixtures = requireGlob.sync('./fixtures/*.js')
  for (const key in fixtures) {
    const { input, output, parser, file } = fixtures[key]
    const position = input.indexOf('// position')
    it(key.replace(/\.js$/, ''), function() {
      const source = input.replace(/^\s*\/\/\s*position.*(\r\n?|\n)/gm, '')
      const result = addStyles(
        { path: file || path.join(__dirname, 'test.js'), source },
        {
          jscodeshift: jscodeshift.withParser(parser || 'babylon'),
          stats: noop,
          report: noop,
        },
        {
          selectionStart: position,
          selectionEnd: position,
          themeImport:
            parser === 'tsx'
              ? undefined
              : `import {type Theme} from './src/universal/theme'`,
        }
      )
      expect(result.trim()).to.equal(output.trim())
    })
  }
})
