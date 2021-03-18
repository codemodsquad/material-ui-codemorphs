import { JSCodeshift } from 'jscodeshift'
import { IdentifierKind } from 'ast-types/gen/kinds'
import { ObjectTypeProperty } from 'ast-types/gen/nodes'

export default function flowClassesPropTypeAnnotation(
  j: JSCodeshift,
  ClassesType: IdentifierKind,
  { overrides = false }: { overrides?: boolean } = {}
): ObjectTypeProperty {
  const classesPropAnnotation = j.objectTypeProperty(
    j.identifier('classes'),
    overrides
      ? j.genericTypeAnnotation(
          j.identifier('$Shape'),
          j.typeParameterInstantiation([
            j.genericTypeAnnotation(ClassesType, null),
          ])
        )
      : j.genericTypeAnnotation(ClassesType, null),
    overrides
  )
  return classesPropAnnotation
}
