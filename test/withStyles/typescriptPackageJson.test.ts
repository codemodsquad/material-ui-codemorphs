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
  describe(`typescript, with config in package.json`, function() {
    const fixtures = requireGlob.sync(
      './fixtures/typescriptPackageJson/src/components/*.js'
    )
    for (const key in fixtures) {
      const { input, output, file } = fixtures[key]
      const position = input.indexOf('// position')
      it(key.replace(/\.js$/, ''), function() {
        const source = input.replace(/^\s*\/\/\s*position.*(\r\n?|\n)/gm, '')
        const result = addStyles(
          {
            path: path.join(
              __dirname,
              'fixtures/typescriptPackageJson/src/components',
              file
            ),
            source,
          },
          {
            jscodeshift: jscodeshift.withParser('tsx'),
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
