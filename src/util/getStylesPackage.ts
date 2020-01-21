import * as path from 'path'
import resolve from 'resolve'

export default function getStylesPackage(file: string): string {
  try {
    resolve.sync('@material-ui/core', { basedir: path.dirname(file) })
    return '@material-ui/core/styles'
  } catch (error) {
    return '@material-ui/styles'
  }
}
