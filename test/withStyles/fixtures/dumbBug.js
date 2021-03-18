export const input = `
/**
 * @flow
 * @prettier
 */

import * as React from 'react'

export type Props = {}

const Temp = ({ text }: Props): React.Node => (
  // position
  <div />
)

export default Temp
`

export const output = `
/**
 * @flow
 * @prettier
 */

import * as React from 'react'

import { withStyles } from "@material-ui/core/styles";
import { type Theme } from "../../src/universal/theme";

type Classes = {|

|}

const styles = (theme: Theme): $ObjMap<Classes, () => { ... }> => ({

})

export type Props = { classes: Classes }

const TempWithStyles = ({
 text,
 classes
}: Props): React.Node => (
  <div />
)

const Temp = withStyles(styles)(TempWithStyles)

export default Temp
`
