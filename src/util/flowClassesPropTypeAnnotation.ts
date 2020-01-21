import { JSCodeshift } from 'jscodeshift'
import {
  IdentifierKind,
  QualifiedTypeIdentifierKind,
} from 'ast-types/gen/kinds'
import { ObjectTypeProperty } from 'ast-types/gen/nodes'

export default function flowClassesPropTypeAnnotation(
  j: JSCodeshift,
  stylesType: IdentifierKind | QualifiedTypeIdentifierKind
): ObjectTypeProperty {
  const classesPropAnnotation = j.objectTypeProperty(
    j.identifier('classes'),
    j.genericTypeAnnotation(
      j.identifier('Classes'),
      j.typeParameterInstantiation([
        j.typeofTypeAnnotation(j.genericTypeAnnotation(stylesType, null)),
      ])
    ),
    false
  )
  classesPropAnnotation.variance = j.variance('plus')
  return classesPropAnnotation
}
