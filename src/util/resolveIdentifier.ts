import {
  ASTPath,
  Identifier,
  TypeAlias,
  TSInterfaceDeclaration,
  InterfaceDeclaration,
} from 'jscodeshift'
import {
  FlowTypeKind,
  TSTypeKind,
  TSTypeAnnotationKind,
} from 'ast-types/gen/kinds'

export default function resolveIdentifier(
  path: ASTPath<Identifier>
):
  | ASTPath<FlowTypeKind>
  | ASTPath<TSTypeKind>
  | ASTPath<TSTypeAnnotationKind>
  | ASTPath<TypeAlias>
  | ASTPath<InterfaceDeclaration>
  | ASTPath<TSInterfaceDeclaration>
  | undefined {
  const {
    scope,
    node: { name },
  } = path
  if (!scope) return undefined
  const typeScope = scope.lookupType(name)
  const valueScope = scope.lookup(name)
  const bindings =
    (typeScope && typeScope.getTypes()[name]) ||
    (valueScope && valueScope.getBindings()[name])
  const binding = bindings ? bindings[0] : null
  if (!binding) return undefined
  const { parentPath } = binding
  switch (parentPath.node.type) {
    case 'TypeAlias':
    case 'InterfaceDeclaration':
    case 'TSInterfaceDeclaration':
      return parentPath
  }
  return undefined
}
