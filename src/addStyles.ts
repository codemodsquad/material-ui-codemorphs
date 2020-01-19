import addImports from 'jscodeshift-add-imports'
import jscodeshift, {
  ObjectProperty,
  ObjectPattern,
  ASTPath,
  Node,
  JSCodeshift,
  ExportDefaultDeclaration,
  FunctionDeclaration,
  ArrowFunctionExpression,
} from 'jscodeshift'
const j = jscodeshift.withParser('babylon')
const { statement } = j.template
import { lowerFirst } from 'lodash'
import hasFlowAnnotation from './hasFlowAnnotation'
import pathsInRange from 'jscodeshift-paths-in-range'
import * as nodepath from 'path'
import findRoot from 'find-root'
import * as fs from 'fs'
import {
  ExportNamedDeclaration,
  Statement,
  Identifier,
  FunctionExpression,
} from 'ast-types/gen/nodes'
import { Collection } from 'jscodeshift/src/Collection'

function shorthandProperty(key: string): ObjectProperty {
  const prop = j.objectProperty(j.identifier(key), j.identifier(key))
  prop.shorthand = true
  return prop
}

function addPropertyBeforeRestElement(
  pattern: ObjectPattern,
  property: ObjectProperty
): void {
  const props = pattern.properties
  const l = props.length
  if ((props[l - 1].type as string) === 'RestElement') {
    props.splice(l - 1, 0, property)
  } else {
    props.push(property)
  }
}

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
  let WithStyles
  if (isTypeScript) {
    if (!Theme) {
      ;({ Theme } = addImports(
        root,
        statement([
          `import { Theme } from '@material-ui/core/styles/createMuiTheme'`,
        ])
      ))
    }
    ;({ WithStyles } = addImports(
      root,
      statement([`import { WithStyles } from '@material-ui/core'`])
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
  } else {
    if (!functionDeclaration.size()) {
      throw new Error(`failed to find a function or arrow function component to add styles to.
try positioning the cursor inside the component.`)
    }

    component = functionDeclaration
    const identifier = functionDeclaration.nodes()[0].id
    if (!identifier || identifier.type !== 'Identifier') {
      throw new Error(`function name must be an identifier`)
    }
    componentNameNode = identifier
  }

  const componentName = componentNameNode.name
  const componentNameWithStyles = `${componentName}WithStyles`

  const componentScope = component.paths()[0].scope.lookup(componentName)
  const componentNode = component.nodes()[0]

  componentNameNode.name = componentNameWithStyles

  const propsParam = componentNode.params[0]
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
    | Collection<ExportNamedDeclaration>
    | Collection<ExportDefaultDeclaration> = component.closest(j.Statement)
  const exportNamedDeclaration = component.closest(j.ExportNamedDeclaration)
  const exportDefaultDeclaration = component.closest(j.ExportDefaultDeclaration)
  if (exportNamedDeclaration.size()) declaration = exportNamedDeclaration
  if (exportDefaultDeclaration.size()) declaration = exportDefaultDeclaration

  let afterStyles: Collection<any> = declaration // eslint-disable-line @typescript-eslint/no-explicit-any

  const styles = declaration.paths()[0].scope.lookup('styles')
    ? `${lowerFirst(componentName)}Styles`
    : 'styles'

  if (isFlow) {
    if (
      propsParam &&
      (propsParam.type === 'ObjectPattern' ||
        propsParam.type === 'Identifier') &&
      propsParam.typeAnnotation
    ) {
      const { typeAnnotation } = propsParam.typeAnnotation
      if (typeAnnotation) {
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
        if (
          typeAnnotation.type === 'GenericTypeAnnotation' &&
          typeAnnotation.id.type === 'Identifier'
        ) {
          const propsTypeName = typeAnnotation.id.name
          const typeScope = componentScope.lookupType(propsTypeName)
          const propsTypeAlias = root
            .find(j.TypeAlias, {
              id: { name: propsTypeName },
            })
            .filter(path => path.scope === typeScope)
            .at(0)
          if (propsTypeAlias.size()) {
            const exportDecl = propsTypeAlias.closest(j.ExportNamedDeclaration)
            afterStyles = exportDecl.size() ? exportDecl : propsTypeAlias
          }
          const propsType = propsTypeAlias.find(j.ObjectTypeAnnotation).at(0)
          if (propsType.size()) {
            propsType.nodes()[0].properties.push(classesPropAnnotation)
          }
        } else if (
          typeAnnotation &&
          typeAnnotation.type === 'ObjectTypeAnnotation'
        ) {
          typeAnnotation.properties.push(classesPropAnnotation)
        }
      }
    }
  }

  if (isTypeScript) {
    if (
      propsParam &&
      (propsParam.type === 'ObjectPattern' ||
        propsParam.type === 'Identifier') &&
      propsParam.typeAnnotation
    ) {
      const { typeAnnotation } = propsParam.typeAnnotation
      if (
        typeAnnotation &&
        typeAnnotation.type === 'TSTypeReference' &&
        typeAnnotation.typeName.type === 'Identifier'
      ) {
        const propsTypeName = typeAnnotation.typeName.name
        const typeScope = componentScope.lookupType(propsTypeName)
        const propsInterface = root
          .find(j.TSInterfaceDeclaration, {
            id: { name: propsTypeName },
          })
          .filter(path => path.scope === typeScope)
          .at(0)
        if (propsInterface.size() && WithStyles) {
          const node = propsInterface.nodes()[0]
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
      }
    }
  }

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
    declaration.insertAfter(`export { ${componentName} }`)
  }
  if (exportDefaultDeclaration.size()) {
    declaration.insertAfter(`export default ${componentName}`)
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
