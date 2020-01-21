import { ASTPath, ClassDeclaration } from 'jscodeshift'

export default function isReactComponentClass(
  path: ASTPath<ClassDeclaration>
): boolean {
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
