import { Options, ASTPath, Node } from 'jscodeshift'
import pathsInRange from 'jscodeshift-paths-in-range'

type Filter = (
  path: ASTPath<Node>,
  index: number,
  paths: Array<ASTPath<Node>>
) => boolean

export function getFilter(options: Options): Filter {
  if (options.selectionStart) {
    const selectionStart = parseInt(options.selectionStart)
    const selectionEnd = options.selectionEnd
      ? parseInt(options.selectionEnd)
      : selectionStart
    return pathsInRange(selectionStart, selectionEnd)
  } else {
    return (): boolean => true
  }
}
