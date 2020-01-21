import addImports from 'jscodeshift-add-imports'
import {
  ObjectPattern,
  ASTPath,
  Node,
  JSCodeshift,
  ExportDefaultDeclaration,
  FunctionDeclaration,
  ArrowFunctionExpression,
  ClassDeclaration,
  ExportNamedDeclaration,
  Statement,
  Identifier,
  FunctionExpression,
} from 'jscodeshift'
import { Collection } from 'jscodeshift/src/Collection'

import { lowerFirst } from 'lodash'
import hasFlowAnnotation from './util/hasFlowAnnotation'
import pathsInRange from 'jscodeshift-paths-in-range'
import importTheme from './util/importTheme'
import flowClassesTypeAlias from './util/flowClassesTypeAlias'
import getPropsType from './util/getPropsType'
import addClassesToPropsType from './util/addClassesToPropsType'
import shorthandProperty from './util/shorthandProperty'
import isReactComponentClass from './util/isReactComponentClass'
import addPropertyBeforeRestElement from './util/addPropertyBeforeRestElement'

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
  const file = fileInfo.path
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

  const isFlow = hasFlowAnnotation(root)

  const { withStyles } = addImports(
    root,
    statement`import { withStyles } from '@material-ui/core/styles'`
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
  const classDeclaration = root
    .find(j.ClassDeclaration)
    .filter(isReactComponentClass)
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
    | Collection<ClassDeclaration>
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
  } else if (classDeclaration.size()) {
    component = classDeclaration
    const identifier = classDeclaration.nodes()[0].id
    if (!identifier || identifier.type !== 'Identifier') {
      throw new Error(`class name must be an identifier`)
    }
    componentNameNode = identifier
  } else {
    throw new Error(`failed to find a component to add styles to.
try positioning the cursor inside a component.`)
  }

  const componentName = componentNameNode.name
  const componentNameWithStyles = `${componentName}WithStyles`

  const componentPath = component.paths()[0]
  const componentNode = component.nodes()[0]

  componentNameNode.name = componentNameWithStyles

  const propsParam =
    componentNode.type === 'ClassDeclaration' ? null : componentNode.params[0]

  if (propsParam && propsParam.type === 'ObjectPattern') {
    addPropertyBeforeRestElement(propsParam, shorthandProperty(j, 'classes'))
  } else if (propsParam && propsParam.type === 'Identifier') {
    const props = propsParam.name
    const destructuring = component
      .find(j.VariableDeclarator, {
        id: {
          type: 'ObjectPattern',
        },
        init: {
          name: props,
        },
      })
      .at(0)
    if (destructuring.size()) {
      addPropertyBeforeRestElement(
        destructuring.nodes()[0].id as ObjectPattern,
        shorthandProperty(j, 'classes')
      )
    }
  }

  let declaration:
    | Collection<Statement>
    | Collection<ArrowFunctionExpression>
    | Collection<FunctionExpression>
    | Collection<FunctionDeclaration>
    | Collection<ClassDeclaration>
    | Collection<ExportNamedDeclaration>
    | Collection<ExportDefaultDeclaration> = component.closest(j.Statement)
  if (!declaration.size()) declaration = component
  const exportNamedDeclaration = component.closest(j.ExportNamedDeclaration)
  const exportDefaultDeclaration = component.closest(j.ExportDefaultDeclaration)
  if (classDeclaration.size()) declaration = classDeclaration
  if (exportNamedDeclaration.size()) declaration = exportNamedDeclaration
  if (exportDefaultDeclaration.size()) declaration = exportDefaultDeclaration

  let afterStyles: Collection<any> = declaration // eslint-disable-line @typescript-eslint/no-explicit-any

  const styles = declaration.paths()[0].scope.lookup('styles')
    ? `${lowerFirst(componentName)}Styles`
    : 'styles'

  const propsTypeAnnotation = getPropsType(componentPath)
  if (propsTypeAnnotation) {
    addClassesToPropsType({
      j,
      root,
      path: propsTypeAnnotation,
      styles,
    })
    const exportDecl = j([propsTypeAnnotation]).closest(
      j.ExportNamedDeclaration
    )
    if (exportDecl.size()) afterStyles = exportDecl
    else {
      switch (propsTypeAnnotation.node.type) {
        case 'TypeAlias':
        case 'InterfaceDeclaration':
        case 'TSInterfaceDeclaration':
          afterStyles = j([propsTypeAnnotation])
      }
    }
  }

  if (isFlow && !root.find(j.TypeAlias, { id: { name: 'Classes' } }).size()) {
    afterStyles.insertBefore(flowClassesTypeAlias(j))
  }

  afterStyles.insertBefore(
    statement([
      `\n\nconst ${styles} = ${Theme ? `(theme: ${Theme})` : 'theme'} => ({

})\n\n`,
    ])
  )
  if (exportNamedDeclaration.size()) {
    declaration.insertAfter(
      j.exportNamedDeclaration(null, [
        j.exportSpecifier(
          j.identifier(componentName),
          j.identifier(componentName)
        ),
      ])
    )
  }
  if (exportDefaultDeclaration.size()) {
    declaration.insertAfter(
      j.exportDefaultDeclaration(j.identifier(componentName))
    )
  }

  declaration.insertAfter(
    statement([
      `\n\nconst ${componentName} = ${withStyles}(${styles})(${componentNameWithStyles})\n\n`,
    ])
  )

  if (exportNamedDeclaration.size()) {
    exportNamedDeclaration.replaceWith(path => path.node.declaration)
  }
  if (exportDefaultDeclaration.size()) {
    exportDefaultDeclaration.replaceWith(path => path.node.declaration)
  }

  return root.toSource()
}
