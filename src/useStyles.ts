import addImports from 'jscodeshift-add-imports'
import {
  ASTPath,
  Node,
  JSCodeshift,
  ExportDefaultDeclaration,
  FunctionDeclaration,
  ArrowFunctionExpression,
  ExportNamedDeclaration,
  Statement,
  Identifier,
  FunctionExpression,
} from 'jscodeshift'
import { Collection } from 'jscodeshift/src/Collection'
import pathsInRange from 'jscodeshift-paths-in-range'
import importTheme from './util/importTheme'
import getStylesPackage from './util/getStylesPackage'

type Filter = (
  path: ASTPath<Node>,
  index: number,
  paths: Array<ASTPath<Node>>
) => boolean

module.exports = function addStyles(
  fileInfo: { path: string; source: string },
  api: {
    jscodeshift: JSCodeshift
    stats: (value: string) => void
    report: (value: string) => void
  },
  options: {
    selectionStart?: string
    selectionEnd?: string
    themeImport?: string
  }
): string {
  const j = api.jscodeshift

  const { statement } = j.template
  const root = j(fileInfo.source)

  let filter: Filter
  if (options.selectionStart) {
    const selectionStart = parseInt(options.selectionStart)
    const selectionEnd = options.selectionEnd
      ? parseInt(options.selectionEnd)
      : selectionStart
    filter = pathsInRange(selectionStart, selectionEnd)
  } else {
    filter = (): boolean => true
  }

  const { makeStyles } = addImports(
    root,
    statement([
      `import { makeStyles } from '${getStylesPackage(fileInfo.path)}';`,
    ])
  )
  const Theme = importTheme({
    root,
    jscodeshift: j,
    file: fileInfo.path,
    themeImport: options.themeImport,
  })

  const arrowFunction = root
    .find(j.ArrowFunctionExpression)
    .filter(filter)
    .at(0)
  const functionExpression = root
    .find(j.FunctionExpression)
    .filter(filter)
    .at(0)
  const functionDeclaration = root
    .find(j.FunctionDeclaration)
    .filter(filter)
    .at(0)

  const variableDeclarator = (arrowFunction.size()
    ? arrowFunction
    : functionExpression
  ).closest(j.VariableDeclarator)

  let component:
    | Collection<ArrowFunctionExpression>
    | Collection<FunctionExpression>
    | Collection<FunctionDeclaration>
  let componentNameNode: Identifier

  if (variableDeclarator.size()) {
    component = arrowFunction.size() ? arrowFunction : functionExpression
    const identifier = variableDeclarator.nodes()[0].id
    if (!identifier || identifier.type !== 'Identifier') {
      throw new Error(
        `expected component variable declarator to assign to an identifier`
      )
    }
    componentNameNode = identifier
  } else if (functionDeclaration.size()) {
    component = functionDeclaration
    const identifier = functionDeclaration.nodes()[0].id
    if (!identifier || identifier.type !== 'Identifier') {
      throw new Error(`function name must be an identifier`)
    }
    componentNameNode = identifier
  } else {
    throw new Error(`failed to find a function component to add styles to.
try positioning the cursor inside a function component.`)
  }

  const componentName = componentNameNode.name

  const componentNode = component.nodes()[0]

  let declaration:
    | Collection<Statement>
    | Collection<ArrowFunctionExpression>
    | Collection<FunctionExpression>
    | Collection<FunctionDeclaration>
    | Collection<ExportNamedDeclaration>
    | Collection<ExportDefaultDeclaration> = component.closest(j.Statement)
  if (!declaration.size()) declaration = component
  const exportNamedDeclaration = component.closest(j.ExportNamedDeclaration)
  const exportDefaultDeclaration = component.closest(j.ExportDefaultDeclaration)
  if (exportNamedDeclaration.size()) declaration = exportNamedDeclaration
  if (exportDefaultDeclaration.size()) declaration = exportDefaultDeclaration

  const afterStyles: Collection<any> = declaration // eslint-disable-line @typescript-eslint/no-explicit-any

  const useStyles = declaration.paths()[0].scope.lookup('useStyles')
    ? `use${componentName}Styles`
    : 'useStyles'

  afterStyles.insertBefore(
    statement([
      `\n\nconst ${useStyles} = ${makeStyles}(${
        Theme ? `(theme: ${Theme})` : 'theme'
      } => ({

}));\n\n`,
    ])
  )

  if (componentNode.body.type !== 'BlockStatement') {
    componentNode.body = j.blockStatement([
      j.returnStatement(componentNode.body),
    ])
  }

  componentNode.body.body.unshift(
    statement([`const classes = ${useStyles}();`])
  )

  return root.toSource()
}
