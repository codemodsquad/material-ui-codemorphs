import { ObjectPattern, ObjectProperty } from 'jscodeshift'

export default function addPropertyBeforeRestElement(
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
