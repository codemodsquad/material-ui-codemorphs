import j, {
  BlockStatement,
  Function,
  ASTPath,
  ArrowFunctionExpression,
} from 'jscodeshift'

export default function ensureBodyIsBlockStatement(
  path: ASTPath<ArrowFunctionExpression> | ASTPath<Function>
): ASTPath<BlockStatement> {
  if (path.node.body.type === 'BlockStatement')
    return path.get('body') as ASTPath<BlockStatement>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newBody = j.blockStatement([j.returnStatement(path.node.body as any)])
  return path.get('body').replace(newBody)
}
