/* eslint-disable @typescript-eslint/no-var-requires */

import { describe } from 'mocha'
const withStyles = require('../../src/withStyles')
import * as path from 'path'
import testFixtures from '../testFixtures'

describe(`withStyles`, function() {
  testFixtures({
    glob: path.resolve(__dirname, './fixtures/*.js'),
    defaultParser: 'babylon',
    transform: withStyles,
    options: ({ parser }) => ({
      themeImport:
        parser === 'tsx'
          ? undefined
          : `import {type Theme} from './test/src/universal/theme'`,
    }),
  })
  describe(`flow, with config in package.json`, function() {
    testFixtures({
      glob: path.resolve(
        __dirname,
        './fixtures/flowPackageJson/src/components/*.js'
      ),
      transform: withStyles,
      defaultParser: 'babylon',
    })
  })
  describe(`typescript, with config in package.json`, function() {
    testFixtures({
      glob: path.resolve(
        __dirname,
        './fixtures/typescriptPackageJson/src/components/*.js'
      ),
      transform: withStyles,
      defaultParser: 'tsx',
    })
  })
})
