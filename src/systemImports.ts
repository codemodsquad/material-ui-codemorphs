/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as path from 'path'

export default function systemImports(file: string): Record<string, string> {
  const system = require(require.resolve('@material-ui/system', {
    paths: [path.dirname(file)],
  }))

  const result: Record<string, string> = {}

  for (const key in system) {
    const value = system[key]
    if (value && Array.isArray(value.filterProps)) {
      value.filterProps.forEach((prop: any) => {
        if (
          !result[prop] ||
          system[result[prop]].filterProps.length < value.filterProps.length
        ) {
          result[prop] = key
        }
      })
    }
  }
  return result
}
