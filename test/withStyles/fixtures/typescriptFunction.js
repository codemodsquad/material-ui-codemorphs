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

import { withStyles, Theme, WithStyles } from "@material-ui/core/styles";

const styles = (theme: Theme) => ({

})

interface Props extends WithStyles<typeof styles> {
  text: string
}

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

export default Test;
`

export const parser = 'tsx'
export const file = 'test.tsx'
