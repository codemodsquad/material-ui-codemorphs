import * as path from 'path'
import { Options, ImportDeclaration, FileInfo, API } from 'jscodeshift'
import getStylesPackage from './getStylesPackage'
import pkgConf from 'pkg-conf'
import defaults from 'lodash/defaults'
import mapValues from 'lodash/fp/mapValues'
import pick from 'lodash/fp/pick'
import pickBy from 'lodash/fp/pickBy'
import flow from 'lodash/fp/flow'

type Imports = {
  themeImport: ImportDeclaration
  withStylesImport: ImportDeclaration
  makeStylesImport: ImportDeclaration
}

export default function getImports(
  { path: file }: FileInfo,
  { j }: API,
  options: Options
): Imports {
  const { statement } = j.template
  const stylesPackage = getStylesPackage(file)
  const packageConf = pkgConf.sync('material-ui-codemorphs', {
    cwd: path.dirname(file),
    skipOnFalse: true,
  })
  const filepath = pkgConf.filepath(packageConf)
  const resolveImport = (cwd: string) => (imp: string): ImportDeclaration => {
    const parsed = statement([imp])
    if (parsed.source.value.startsWith('.') && file) {
      parsed.source.value = path.relative(
        path.dirname(file),
        path.resolve(cwd, parsed.source.value)
      )
    }
    return parsed
  }
  const resolveImports = (
    cwd: string
  ): ((raw: Record<string, unknown>) => Partial<Imports>) =>
    flow([
      pick(['themeImport', 'withStylesImport', 'makeStylesImport']),
      pickBy(Boolean),
      mapValues(resolveImport(cwd)),
    ])
  return defaults(
    resolveImports(process.cwd())(options),
    resolveImports(path.dirname(filepath || process.cwd()))(packageConf),
    resolveImports(process.cwd())({
      themeImport: `import { Theme } from '${stylesPackage}'`,
      withStylesImport: `import { withStyles } from '${stylesPackage}'`,
      makeStylesImport: `import { makeStyles } from '${stylesPackage}'`,
    })
  ) as Imports
}
