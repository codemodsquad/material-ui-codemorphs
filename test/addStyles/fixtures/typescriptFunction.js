export const input = `
import * as React from 'react'

interface Props {
  text: string
}

export default function Test({text}: Props): React.ReactNode {
  // position
  return (
    <div>{text}</div>
  )
}
`

export const output = `
import * as React from 'react'

import { withStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { WithStyles } from "@material-ui/core";

interface Props extends WithStyles<typeof styles> {
  text: string
}

const styles = (theme: Theme) => ({

})

function TestWithStyles(
  {
    text,
    classes
  }: Props
): React.ReactNode {
  return (
    <div>{text}</div>
  )
}

const Test = withStyles(styles)(TestWithStyles)

export default Test
`

export const parser = 'tsx'
export const file = 'test.tsx'
