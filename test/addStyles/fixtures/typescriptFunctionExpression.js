export const input = `
import * as React from 'react'

interface Props {
  text: string
}

export const Test = function({text}: Props): React.ReactNode {
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

const TestWithStyles = function({
  text,
  classes
}: Props): React.ReactNode {
  return (
    <div>{text}</div>
  )
};

const Test = withStyles(styles)(TestWithStyles)

export { Test }
`

export const parser = 'tsx'
export const file = 'test.tsx'
