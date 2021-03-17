import addImports from 'jscodeshift-add-imports'
import {
  ExportDefaultDeclaration,
  FunctionDeclaration,
  ArrowFunctionExpression,
  ExportNamedDeclaration,
  Statement,
  Identifier,
  FunctionExpression,
  FileInfo,
  API,
} from 'jscodeshift'
import { Collection } from 'jscodeshift/src/Collection'
import { getFilter } from './util/filter'
import getImports from './util/getImports'
import hasFlowAnnotation from './util/hasFlowAnnotation'

module.exports = function addStyles(
  fileInfo: FileInfo,
  api: API,
  options: {
    selectionStart?: string
    selectionEnd?: string
    themeImport?: string
  }
): string {
  const { j } = api

  const { statement } = j.template
  const root = j(fileInfo.source)
  const isFlow = hasFlowAnnotation(root)
  const isTypeScript = /\.tsx?$/i.test(fileInfo.path)

  const filter = getFilter(options)

  const { themeImport, makeStylesImport } = getImports(fileInfo, api, options)

  const {
    [makeStylesImport.specifiers[0].local?.name || 'makeStyles']: makeStyles,
  } = addImports(root, makeStylesImport)
  let Theme
  if (isFlow || isTypeScript) {
    ;({
      [themeImport.specifiers[0].local?.name || 'Theme']: Theme,
    } = addImports(root, themeImport))
  }

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
  const propsParam = componentNode.params[0]

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

  let Classes: string | undefined

  if (isFlow) {
    Classes = declaration.paths()[0].scope.lookupType('Classes')
      ? `${componentName}Classes`
      : 'Classes'
  }

  const useStyles = declaration.paths()[0].scope.lookup('useStyles')
    ? `use${componentName}Styles`
    : 'useStyles'

  if (Classes) {
    afterStyles.insertBefore(statement([`\n\ntype ${Classes} = {|\n\n|}`]))
    afterStyles.insertBefore(
      statement([
        `\n\nconst ${useStyles} = ${makeStyles}(${
          Theme ? `(theme: ${Theme})` : '(theme)'
        }: $ObjMap<${Classes}, () => { ... }> => ({

}));\n\n`,
      ])
    )
  } else {
    afterStyles.insertBefore(
      statement([
        `\n\nconst ${useStyles} = ${makeStyles}(${
          Theme ? `(theme: ${Theme})` : 'theme'
        } => ({

}));\n\n`,
      ])
    )
  }

  if (componentNode.body.type !== 'BlockStatement') {
    componentNode.body = j.blockStatement([
      j.returnStatement(componentNode.body),
    ])
  }

  const classesDeclaration =
    propsParam?.type === 'Identifier'
      ? statement`const classes = ${j.identifier(useStyles)}(${j.identifier(
          propsParam.name
        )});`
      : statement`const classes = ${j.identifier(useStyles)}();`

  if (Classes) {
    classesDeclaration.declarations[0].id.typeAnnotation = j.typeAnnotation(
      j.genericTypeAnnotation(j.identifier(Classes), null)
    )
  }

  componentNode.body.body.unshift(classesDeclaration)

  return root.toSource()
}
