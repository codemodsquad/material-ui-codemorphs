/* eslint-disable @typescript-eslint/no-explicit-any */

import { FileInfo, API } from 'jscodeshift'
import addImports from 'jscodeshift-add-imports'
import pipeline from './util/pipeline'
import { uniq, map, compact, flatMap } from 'lodash/fp'
import resolve from 'resolve'

const getSystemImports = (dir: string): Record<string, string> => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const system = require(resolve.sync('@material-ui/system', { basedir: dir }))
  /* eslint-enable @typescript-eslint/no-var-requires */

  const result: Record<string, string> = {}

  for (const key in system) {
    const value = system[key]
    if (value && Array.isArray(value.filterProps)) {
      value.filterProps.forEach((prop: string) => {
        if (
          !result[prop] ||
          system[result[prop]].filterProps.length < value.filterProps.length
        ) {
          result[prop] = key
        }
      })
    }
  }

  return result
}

module.exports = function setupMaterialUISystem(
  { path, source }: FileInfo,
  { j }: API
): string {
  const root = j(source)
  const { statement } = j.template

  const systemImports = getSystemImports(path)

  const breakpointKeys = new Set(['xs', 'sm', 'md', 'lg', 'xl'])
  let hasBreakpoints = false

  function getBreakpointAttributes(value: any): string[] {
    hasBreakpoints = true
    if (value.type !== 'JSXExpressionContainer') return []
    if (value.expression.type !== 'ObjectExpression') return []
    return value.expression.properties.map((p: any) => p.key.name)
  }

  // get all attributes on <Box> elements
  const boxAttributes = flatMap((node: any) =>
    breakpointKeys.has(node.name.name)
      ? getBreakpointAttributes(node.value)
      : node.name.name
  )(
    root
      .find(j.JSXOpeningElement, {
        name: {
          name: 'Box',
        },
      })
      .find(j.JSXAttribute)
      .nodes()
  )

  // add imports from @material-ui/system needed to support the <Box> attributes
  const neededImports = pipeline(
    boxAttributes,
    map((attr: string) => systemImports[attr]),
    compact,
    uniq
  )
  const { styled } = addImports(
    root,
    statement`import { styled } from '@material-ui/styles'`
  )
  const imports = [
    ...Object.values(
      addImports(
        root,
        statement([
          `import { ${neededImports.join(', ')} } from '@material-ui/system'`,
        ])
      )
    ),
  ].sort()
  let breakpoints
  if (hasBreakpoints) {
    ;({ breakpoints } = addImports(
      root,
      statement`import { breakpoints } from '@material-ui/system'`
    ))
  }
  let compose
  if (neededImports.length > 1) {
    ;({ compose } = addImports(
      root,
      statement`import { compose } from '@material-ui/system'`
    ))
  }

  // create const Box = styled('div')(...) declaration
  let boxFns = imports.join(', ')
  if (compose) boxFns = `${compose}(${boxFns})`
  if (breakpoints)
    boxFns = `${breakpoints}(
    ${boxFns}
  )`

  const boxStatement = statement([
    `const Box = ${styled}('div')(
  ${boxFns}
)`,
  ])

  // insert or replace existing const Box = ... declaration
  const existingBox = root.find(j.VariableDeclarator, {
    id: { name: 'Box' },
  })

  if (existingBox.size()) {
    existingBox.replaceWith(boxStatement.declarations[0])
  } else {
    const importDecls = root.find(j.ImportDeclaration)
    const lastImportDecl = importDecls.at(importDecls.size() - 1)
    lastImportDecl.insertAfter(boxStatement)
  }

  // remove any unused @material-ui/system import specifiers
  const importsToKeep = new Set(neededImports)
  if (compose) importsToKeep.add('compose')
  if (breakpoints) importsToKeep.add('breakpoints')

  root
    .find(j.ImportDeclaration, { source: { value: '@material-ui/system' } })
    .forEach(
      ({ node }) =>
        (node.specifiers = node.specifiers.filter(
          specifier =>
            specifier.type === 'ImportSpecifier' &&
            importsToKeep.has(specifier.imported.name)
        ))
    )

  return root.toSource()
}
