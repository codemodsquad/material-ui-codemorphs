import { JSCodeshift, ObjectProperty } from 'jscodeshift'

export default function shorthandProperty(
  j: JSCodeshift,
  key: string
): ObjectProperty {
  const prop = j.objectProperty(j.identifier(key), j.identifier(key))
  prop.shorthand = true
  return prop
}
