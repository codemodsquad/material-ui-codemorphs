export const input = `
import * as React from 'react'

interface Props {
  text: string
}

const Test = React.forwardRef(({text}: Props, ref): React.ReactNode => (
  // position
  <div ref={ref}>{text}</div>
))
`

export const output = `
import * as React from 'react'

import { withStyles, Theme, WithStyles } from "@material-ui/core/styles";

interface Props extends WithStyles<typeof styles> {
  text: string
}

const styles = (theme: Theme) => ({

})

const TestWithStyles = React.forwardRef(({
  text,
  classes
}: Props, ref): React.ReactNode => (
  <div ref={ref}>{text}</div>
))

const Test = withStyles(styles)(TestWithStyles)
`

export const parser = 'tsx'
export const file = 'test.tsx'
