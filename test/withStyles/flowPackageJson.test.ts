/* eslint-disable @typescript-eslint/no-var-requires */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import requireGlob from 'require-glob'
import jscodeshift from 'jscodeshift'
const addStyles = require('../../src/addStyles')
import * as path from 'path'

const noop = (): void => {
  // noop
}

describe(`addStyles`, function() {
  describe(`flow, with config in package.json`, function() {
    const fixtures = requireGlob.sync(
      './fixtures/flowPackageJson/src/components/*.js'
    )
    for (const key in fixtures) {
      const { input, output, parser, file } = fixtures[key]
      const position = input.indexOf('// position')
      it(key.replace(/\.js$/, ''), function() {
        const source = input.replace(/^\s*\/\/\s*position.*(\r\n?|\n)/gm, '')
        const result = addStyles(
          {
            path: path.join(
              __dirname,
              'fixtures/flowPackageJson/src/components',
              file || 'test.js'
            ),
            source,
          },
          {
            jscodeshift: jscodeshift.withParser(parser || 'babylon'),
            stats: noop,
            report: noop,
          },
          {
            selectionStart: position,
            selectionEnd: position,
          }
        )
        expect(result.trim()).to.equal(output.trim())
      })
    }
  })
})
