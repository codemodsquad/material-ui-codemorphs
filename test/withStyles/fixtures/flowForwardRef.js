export const input = `
// @flow

import * as React from 'react'

type Props = {
  +text: string,
}

const Test = React.forwardRef(({text}: Props, ref): React.Node => (
  // position
  <div ref={ref}>{text}</div>
))
`

export const output = `
// @flow

import * as React from 'react'

import { withStyles } from "@material-ui/core/styles";
import { type Theme } from "../../src/universal/theme";

type Classes = {|

|}

const styles = (theme: Theme): $ObjMap<Classes, () => { ... }> => ({

})

type Props = {
  +text: string,
  classes: Classes,
}

const TestWithStyles = React.forwardRef(({
  text,
  classes
}: Props, ref): React.Node => (
  <div ref={ref}>{text}</div>
))

const Test = withStyles(styles)(TestWithStyles)
`
