import addImports from 'jscodeshift-add-imports'
import {
  ObjectProperty,
  ObjectPattern,
  ASTPath,
  Node,
  JSCodeshift,
  ExportDefaultDeclaration,
  FunctionDeclaration,
  ArrowFunctionExpression,
  ClassDeclaration,
  TypeAnnotation,
  TSTypeAnnotation,
  TypeAlias,
  InterfaceDeclaration,
  TSInterfaceDeclaration,
  ExportNamedDeclaration,
  Statement,
  Identifier,
  FunctionExpression,
  ObjectTypeProperty,
} from 'jscodeshift'
import { Collection } from 'jscodeshift/src/Collection'
import {
  FlowTypeKind,
  TSTypeKind,
  TSTypeAnnotationKind,
} from 'ast-types/gen/kinds'

import { lowerFirst } from 'lodash'
import hasFlowAnnotation from './hasFlowAnnotation'
import pathsInRange from 'jscodeshift-paths-in-range'
import * as nodepath from 'path'
import findRoot from 'find-root'
import * as fs from 'fs'

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

  const shorthandProperty = (key: string): ObjectProperty => {
    const prop = j.objectProperty(j.identifier(key), j.identifier(key))
    prop.shorthand = true
    return prop
  }

  const addPropertyBeforeRestElement = (
    pattern: ObjectPattern,
    property: ObjectProperty
  ): void => {
    const props = pattern.properties
    const l = props.length
    if ((props[l - 1].type as string) === 'RestElement') {
      props.splice(l - 1, 0, property)
    } else {
      props.push(property)
    }
  }

  const isReactComponentClass = (path: ASTPath<ClassDeclaration>): boolean => {
    const { superClass } = path.node
    if (!superClass) return false
    switch (superClass.type) {
      case 'Identifier':
        return superClass.name === 'Component'
      case 'MemberExpression':
        return (
          superClass.property.type === 'Identifier' &&
          superClass.property.name === 'Component'
        )
    }
    return false
  }

  const getPropsType = (
    path:
      | ASTPath<ClassDeclaration>
      | ASTPath<FunctionDeclaration>
      | ASTPath<FunctionExpression>
      | ASTPath<ArrowFunctionExpression>
  ):
    | ASTPath<FlowTypeKind>
    | ASTPath<TSTypeKind>
    | ASTPath<TSTypeAnnotationKind>
    | undefined => {
    const { node } = path
    switch (node.type) {
      case 'ClassDeclaration':
        if (node.superTypeParameters && node.superTypeParameters.params[0]) {
          return path.get('superTypeParameters', 'params', 0)
        }
        return undefined
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression': {
        const { typeAnnotation } = node.params[0] as {
          typeAnnotation?: TypeAnnotation | TSTypeAnnotation
        }
        if (
          typeAnnotation &&
          (typeAnnotation.type === 'TypeAnnotation' ||
            typeAnnotation.type === 'TSTypeAnnotation')
        ) {
          return path.get('params', 0, 'typeAnnotation', 'typeAnnotation')
        }
      }
    }
  }

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

  const isTypeScript = /\.tsx?$/i.test(file)
  const isFlow = hasFlowAnnotation(root)

  const { withStyles } = addImports(
    root,
    statement`import { withStyles } from '@material-ui/core/styles'`
  )
  let Theme
  if (isFlow || isTypeScript) {
    let { themeImport } = options
    if (!themeImport) {
      const pkgJsonPath = nodepath.join(findRoot(file), 'package.json')
      const { ['material-ui-codemorphs']: pkgOptions } = JSON.parse(
        fs.readFileSync(pkgJsonPath, 'utf8')
      )
      if (pkgOptions) ({ themeImport } = pkgOptions)
    }
    if (themeImport) {
      const parsed = statement([themeImport])
      const themeName = parsed.specifiers[0].local.name
      if (parsed.source.value.startsWith('.')) {
        parsed.source.value = nodepath.relative(
          nodepath.dirname(file),
          nodepath.resolve(findRoot(file), parsed.source.value)
        )
      }
      ;({ [themeName]: Theme } = addImports(root, parsed))
    }
  }
  let WithStyles: string | undefined
  if (isTypeScript) {
    if (!Theme) {
      ;({ Theme } = addImports(
        root,
        statement([`import { Theme } from '@material-ui/core/styles'`])
      ))
    }
    ;({ WithStyles } = addImports(
      root,
      statement([`import { WithStyles } from '@material-ui/core/styles'`])
    ))
  }
  if ((isFlow || isTypeScript) && !Theme) {
    Theme = 'Theme'
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
    addPropertyBeforeRestElement(propsParam, shorthandProperty('classes'))
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
        shorthandProperty('classes')
      )
    }
  }

  let declaration:
    | Collection<Statement>
    | Collection<ClassDeclaration>
    | Collection<ExportNamedDeclaration>
    | Collection<ExportDefaultDeclaration> = component.closest(j.Statement)
  const exportNamedDeclaration = component.closest(j.ExportNamedDeclaration)
  const exportDefaultDeclaration = component.closest(j.ExportDefaultDeclaration)
  if (classDeclaration.size()) declaration = classDeclaration
  if (exportNamedDeclaration.size()) declaration = exportNamedDeclaration
  if (exportDefaultDeclaration.size()) declaration = exportDefaultDeclaration

  let afterStyles: Collection<any> = declaration // eslint-disable-line @typescript-eslint/no-explicit-any

  const styles = declaration.paths()[0].scope.lookup('styles')
    ? `${lowerFirst(componentName)}Styles`
    : 'styles'

  const resolveIdentifier = (
    path: ASTPath<Identifier>
  ):
    | ASTPath<FlowTypeKind>
    | ASTPath<TSTypeKind>
    | ASTPath<TSTypeAnnotationKind>
    | ASTPath<TypeAlias>
    | ASTPath<TSInterfaceDeclaration>
    | undefined => {
    const {
      scope,
      node: { name },
    } = path
    if (!scope) return undefined
    const declaringScope = isFlow ? scope.lookupType(name) : scope.lookup(name)
    if (!declaringScope) {
      const tsInterface = root
        .find(j.TSInterfaceDeclaration, { id: { name } })
        .at(0)
      if (tsInterface.size()) return tsInterface.paths()[0]
      return undefined
    }
    const bindings = (isFlow
      ? declaringScope.getTypes()
      : declaringScope.getBindings())[name]
    const binding = bindings ? bindings[0] : null
    if (!binding) return undefined
    const { parentPath } = binding
    switch (parentPath.node.type) {
      case 'TypeAlias':
      case 'InterfaceDeclaration':
        return parentPath
    }
    return undefined
  }

  const flowClassesPropTypeAnnotation = (): ObjectTypeProperty => {
    const classesPropAnnotation = j.objectTypeProperty(
      j.identifier('classes'),
      j.genericTypeAnnotation(
        j.identifier('Classes'),
        j.typeParameterInstantiation([
          j.typeofTypeAnnotation(
            j.genericTypeAnnotation(j.identifier(styles), null)
          ),
        ])
      ),
      false
    )
    classesPropAnnotation.variance = j.variance('plus')
    return classesPropAnnotation
  }

  const addClassesToPropsType = (
    path:
      | ASTPath<FlowTypeKind>
      | ASTPath<TSTypeKind>
      | ASTPath<TSTypeAnnotationKind>
      | ASTPath<TypeAlias>
      | ASTPath<InterfaceDeclaration>
      | ASTPath<TSInterfaceDeclaration>
  ): void => {
    const { node } = path
    switch (node.type) {
      case 'TSTypeReference': {
        const resolved = resolveIdentifier(path.get('typeName'))
        if (resolved) addClassesToPropsType(resolved)
        break
      }
      case 'GenericTypeAnnotation': {
        const resolved = resolveIdentifier(path.get('id'))
        if (resolved) addClassesToPropsType(resolved)
        break
      }
      case 'TypeAlias': {
        addClassesToPropsType(path.get('right'))
        const exportDecl = j([path]).closest(j.ExportNamedDeclaration)
        afterStyles = exportDecl.size() ? exportDecl : j([path])
        break
      }
      case 'TSInterfaceDeclaration': {
        if (WithStyles) {
          if (!node.extends) node.extends = []
          node.extends.push(
            j.tsExpressionWithTypeArguments(
              j.identifier(WithStyles),
              j.tsTypeParameterInstantiation([
                j.tsTypeQuery(j.identifier(styles)),
              ])
            )
          )
        }
        break
      }
      case 'InterfaceDeclaration': {
        node.body.properties.push(flowClassesPropTypeAnnotation())
        const exportDecl = j([path]).closest(j.ExportNamedDeclaration)
        afterStyles = exportDecl.size() ? exportDecl : j([path])
        break
      }
      case 'ObjectTypeAnnotation': {
        if (isFlow) node.properties.push(flowClassesPropTypeAnnotation())
        break
      }
    }
  }

  const propsTypeAnnotation = getPropsType(componentPath)
  if (propsTypeAnnotation) addClassesToPropsType(propsTypeAnnotation)

  if (isFlow && !root.find(j.TypeAlias, { id: { name: 'Classes' } }).size()) {
    afterStyles.insertBefore(
      statement([
        `\n\ntype Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>`,
      ])
    )
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
