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
  root: Collection<any>
  path:
    | ASTPath<FlowTypeKind>
    | ASTPath<TSTypeKind>
    | ASTPath<TSTypeAnnotationKind>
    | ASTPath<TypeAlias>
    | ASTPath<InterfaceDeclaration>
    | ASTPath<TSInterfaceDeclaration>
  styles: string
}): void {
  const { j, root, path, styles } = options
  const isFlow = hasFlowAnnotation(root)
  const { statement } = j.template
  const { node } = path
  switch (node.type) {
    case 'TypeAlias': {
      addClassesToPropsType({ j, root, path: path.get('right'), styles })
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
      node.body.properties.push(
        flowClassesPropTypeAnnotation(j, j.identifier(styles))
      )
      break
    }
    case 'ObjectTypeAnnotation': {
      if (isFlow) {
        node.properties.push(
          flowClassesPropTypeAnnotation(j, j.identifier(styles))
        )
      }
      break
    }
  }
}
