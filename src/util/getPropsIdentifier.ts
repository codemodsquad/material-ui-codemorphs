import j, {
  Identifier,
  ASTPath,
  Function,
  ArrowFunctionExpression,
} from 'jscodeshift'
import ensureBodyIsBlockStatement from './ensureBodyIsBlockStatement'

export default function getPropsIdentifier(
  componentPath: ASTPath<ArrowFunctionExpression> | ASTPath<Function>
): Identifier {
  const params = componentPath.get('params')
  const propsParam = componentPath.get('params').get(0)
  if (propsParam) {
    if (propsParam.node.type === 'Identifier') return propsParam.node
    const { typeAnnotation } = propsParam.node
    propsParam.get('typeAnnotation').prune()
    const body = ensureBodyIsBlockStatement(componentPath)
    const name = 'props'
    body
      .get('body')
      .unshift(
        j.variableDeclaration('const', [
          j.variableDeclarator(propsParam.node, j.identifier(name)),
        ])
      )
    const newPropsParam = j.identifier(name)
    newPropsParam.typeAnnotation = typeAnnotation
    propsParam.replace(newPropsParam)
    return newPropsParam
  } else {
    const identifier = j.identifier('props')
    params.value.push(identifier)
    return identifier
  }
}
