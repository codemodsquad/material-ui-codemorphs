import { Collection } from 'jscodeshift/src/Collection'
import { JSCodeshift } from 'jscodeshift'
import hasFlowAnnotation from './hasFlowAnnotation'
import pkgConf from 'pkg-conf'
import * as path from 'path'
import addImports from 'jscodeshift-add-imports'
import getStylesPackage from './getStylesPackage'

export default function importTheme(options: {
  root: Collection<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  jscodeshift: JSCodeshift
  file: string
  themeImport: string | undefined
}): string | undefined {
  const { root, jscodeshift, file } = options
  const isFlow = hasFlowAnnotation(root)
  const isTypeScript = /\.tsx?$/i.test(file)

  if (!isFlow && !isTypeScript) return undefined

  const { statement } = jscodeshift.template

  let Theme: string | undefined
  if (isFlow || isTypeScript) {
    const conf = pkgConf.sync<{ themeImport: string }>(
      'material-ui-codemorphs',
      {
        cwd: path.dirname(file),
        defaults: {
          themeImport: `import { Theme } from '${getStylesPackage(file)}'`,
        },
        skipOnFalse: true,
      }
    )
    const filepath = pkgConf.filepath(conf)

    const themeImport = options.themeImport || conf.themeImport

    if (themeImport) {
      const parsed = statement([themeImport])
      const themeName = parsed.specifiers[0].local.name
      if (parsed.source.value.startsWith('.') && filepath) {
        parsed.source.value = path.relative(
          path.dirname(file),
          path.resolve(path.dirname(filepath), parsed.source.value)
        )
      }
      ;({ [themeName]: Theme } = addImports(root, parsed))
    }
  }

  return Theme || 'Theme'
}
