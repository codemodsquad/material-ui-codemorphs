/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { it } from 'mocha'
import { expect } from 'chai'
import requireGlob from 'require-glob'
import jscodeshift, { Transform } from 'jscodeshift'
import * as path from 'path'
import pkgConf from 'pkg-conf'
import * as prettier from 'prettier'

const prettierOptions = { ...pkgConf.sync('prettier'), parser: 'babel' }
const normalize = (code: string): string =>
  prettier.format(code, prettierOptions).trim()

const noop = (): void => {
  // noop
}

export default function runFixtures({
  glob,
  transform,
  defaultParser,
  options,
}: {
  glob: string
  transform: Transform
  defaultParser: string
  options?: (fixture: { parser?: string }) => Record<string, any>
}): void {
  if (!path.isAbsolute(glob)) {
    throw new Error('glob must be absolute')
  }
  const fixtures = requireGlob.sync(glob, {
    reducer: (
      options: Record<string, any>,
      result: Record<string, any>,
      file: { path: string; exports: any }
    ) => {
      result[file.path] = file.exports
      return result
    },
  })
  for (const fixturePath in fixtures) {
    const fixture = fixtures[fixturePath]
    const { input, output, parser } = fixture
    const file = path.resolve(
      __dirname,
      fixture.file
        ? path.resolve(path.dirname(fixturePath), fixture.file)
        : fixturePath
    )
    const position = input.indexOf('// position')
    it(path.basename(fixturePath).replace(/\.js$/, ''), function() {
      const source = input.replace(/^\s*\/\/\s*position.*(\r\n?|\n)/gm, '')
      const j = jscodeshift.withParser(parser || defaultParser)
      const result = transform(
        { path: file, source },
        {
          j,
          jscodeshift: j,
          stats: noop,
          report: noop,
        },
        {
          ...(options ? options(fixture) : null),
          selectionStart: position,
          selectionEnd: position,
        }
      )
      if (!result) throw new Error('expected result to be defined')
      expect(normalize(result)).to.equal(normalize(output))
    })
  }
}
