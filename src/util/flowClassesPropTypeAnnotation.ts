import { JSCodeshift } from 'jscodeshift'
import { IdentifierKind } from 'ast-types/gen/kinds'
import { ObjectTypeProperty } from 'ast-types/gen/nodes'

export default function flowClassesPropTypeAnnotation(
  j: JSCodeshift,
  ClassesType: IdentifierKind
): ObjectTypeProperty {
  const classesPropAnnotation = j.objectTypeProperty(
    j.identifier('classes'),
    j.genericTypeAnnotation(ClassesType, null),
    false
  )
  classesPropAnnotation.variance = j.variance('plus')
  return classesPropAnnotation
}
