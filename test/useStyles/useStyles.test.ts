/* eslint-disable @typescript-eslint/no-var-requires */

import { describe } from 'mocha'
const useStyles = require('../../src/useStyles')
import * as path from 'path'
import testFixtures from '../testFixtures'

describe(`useStyles`, function() {
  testFixtures({
    glob: path.resolve(__dirname, './fixtures/*.js'),
    transform: useStyles,
    defaultParser: 'babylon',
    options: ({ parser }) => ({
      themeImport:
        parser === 'tsx'
          ? undefined
          : `import {type Theme} from './test/src/universal/theme'`,
    }),
  })
})
