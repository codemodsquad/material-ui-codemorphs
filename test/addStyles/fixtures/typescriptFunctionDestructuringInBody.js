export const input = `
import * as React from 'react'

interface Props {
  text: string
}

export default function Test(props: Props): React.ReactNode {
  const {text} = props
  // position
  return (
    <div>{text}</div>
  )
}
`

export const output = `
import * as React from 'react'

import { withStyles, Theme, WithStyles } from "@material-ui/core/styles";

interface Props extends WithStyles<typeof styles> {
  text: string
}

const styles = (theme: Theme) => ({

})

function TestWithStyles(props: Props): React.ReactNode {
  const {
    text,
    classes
  } = props
  return (
    <div>{text}</div>
  )
}

const Test = withStyles(styles)(TestWithStyles)

export default Test;
`

export const parser = 'tsx'
export const file = 'test.tsx'
