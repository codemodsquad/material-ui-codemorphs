import { JSCodeshift, TypeAlias } from 'jscodeshift'

export default function flowClassesTypeAlias(j: JSCodeshift): TypeAlias {
  return j.template.statement([
    `\n\ntype Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>`,
  ])
}
