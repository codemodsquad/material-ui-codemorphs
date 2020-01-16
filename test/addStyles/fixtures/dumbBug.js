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

type Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>

const styles = (theme: Theme) => ({

})

export type Props = { +classes: Classes<typeof styles> }

const Temp = ({
 text,
 classes
}: Props): React.Node => (
  <div />
)

const TempWithStyles = withStyles(styles)(Temp)

export default TempWithStyles;
`
