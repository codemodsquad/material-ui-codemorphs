import {
  JSCodeshift,
  ASTPath,
  TypeAlias,
  InterfaceDeclaration,
  TSInterfaceDeclaration,
} from 'jscodeshift'

import {
  FlowTypeKind,
  TSTypeKind,
  TSTypeAnnotationKind,
} from 'ast-types/gen/kinds'
import flowClassesPropTypeAnnotation from './flowClassesPropTypeAnnotation'
import addImports from 'jscodeshift-add-imports'
import { Collection } from 'jscodeshift/src/Collection'
import hasFlowAnnotation from './hasFlowAnnotation'

export default function addClassesToPropsType(options: {
  j: JSCodeshift
  root: Collection<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  path:
    | ASTPath<FlowTypeKind>
    | ASTPath<TSTypeKind>
    | ASTPath<TSTypeAnnotationKind>
    | ASTPath<TypeAlias>
    | ASTPath<InterfaceDeclaration>
    | ASTPath<TSInterfaceDeclaration>
  styles: string
  Classes: string | undefined
}): void {
  const { j, root, path, styles, Classes } = options
  const isFlow = hasFlowAnnotation(root)
  const { statement } = j.template
  const { node } = path
  switch (node.type) {
    case 'TypeAlias': {
      addClassesToPropsType({
        j,
        root,
        path: path.get('right'),
        styles,
        Classes,
      })
      break
    }
    case 'TSInterfaceDeclaration': {
      const { WithStyles } = addImports(
        root,
        statement([`import { WithStyles } from '@material-ui/core/styles'`])
      )
      if (!node.extends) node.extends = []
      node.extends.push(
        j.tsExpressionWithTypeArguments(
          j.identifier(WithStyles),
          j.tsTypeParameterInstantiation([j.tsTypeQuery(j.identifier(styles))])
        )
      )
      break
    }
    case 'InterfaceDeclaration': {
      if (!Classes)
        throw new Error(`Classes must be provided when code is Flow`)
      node.body.properties.push(
        flowClassesPropTypeAnnotation(j, j.identifier(Classes))
      )
      break
    }
    case 'ObjectTypeAnnotation': {
      if (!Classes)
        throw new Error(`Classes must be provided when code is Flow`)
      if (isFlow) {
        node.properties.push(
          flowClassesPropTypeAnnotation(j, j.identifier(Classes))
        )
      }
      break
    }
  }
}
