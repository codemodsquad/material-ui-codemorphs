import {
  ASTPath,
  ClassDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  ArrowFunctionExpression,
  TypeAnnotation,
  TSTypeAnnotation,
  TypeAlias,
  TSInterfaceDeclaration,
  InterfaceDeclaration,
} from 'jscodeshift'

import {
  FlowTypeKind,
  TSTypeKind,
  TSTypeAnnotationKind,
} from 'ast-types/gen/kinds'
import resolveIdentifier from './resolveIdentifier'

export default function getPropsType(
  path:
    | ASTPath<ClassDeclaration>
    | ASTPath<FunctionDeclaration>
    | ASTPath<FunctionExpression>
    | ASTPath<ArrowFunctionExpression>
):
  | ASTPath<FlowTypeKind>
  | ASTPath<TSTypeKind>
  | ASTPath<TSTypeAnnotationKind>
  | ASTPath<TypeAlias>
  | ASTPath<InterfaceDeclaration>
  | ASTPath<TSInterfaceDeclaration>
  | undefined {
  function resolve(
    path:
      | ASTPath<FlowTypeKind>
      | ASTPath<TSTypeKind>
      | ASTPath<TSTypeAnnotationKind>
  ):
    | ASTPath<FlowTypeKind>
    | ASTPath<TSTypeKind>
    | ASTPath<TSTypeAnnotationKind>
    | ASTPath<TypeAlias>
    | ASTPath<InterfaceDeclaration>
    | ASTPath<TSInterfaceDeclaration>
    | undefined {
    switch (path.node.type) {
      case 'TSTypeReference':
        return resolveIdentifier(path.get('typeName'))
      case 'GenericTypeAnnotation':
        return resolveIdentifier(path.get('id'))
    }
    return path
  }

  const { node } = path
  switch (node.type) {
    case 'ClassDeclaration':
      if (node.superTypeParameters && node.superTypeParameters.params[0]) {
        return resolve(path.get('superTypeParameters', 'params', 0))
      }
      return undefined
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression': {
      if (!node.params[0]) return undefined
      const { typeAnnotation } = node.params[0] as {
        typeAnnotation?: TypeAnnotation | TSTypeAnnotation
      }
      if (
        typeAnnotation &&
        (typeAnnotation.type === 'TypeAnnotation' ||
          typeAnnotation.type === 'TSTypeAnnotation')
      ) {
        return resolve(
          path.get('params', 0, 'typeAnnotation', 'typeAnnotation')
        )
      }
    }
  }
}
