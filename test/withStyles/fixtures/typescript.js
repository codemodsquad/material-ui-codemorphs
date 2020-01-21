export const input = `
import * as React from 'react'

interface Props {
  text: string
}

const Test = ({text}: Props): React.ReactNode => (
  // position
  <div>{text}</div>
)
`

export const output = `
import * as React from 'react'

import { withStyles, Theme, WithStyles } from "@material-ui/core/styles";

const styles = (theme: Theme) => ({

})

interface Props extends WithStyles<typeof styles> {
  text: string
}

const TestWithStyles = ({
  text,
  classes
}: Props): React.ReactNode => (
  <div>{text}</div>
)

const Test = withStyles(styles)(TestWithStyles)
`

export const parser = 'tsx'
export const file = 'test.tsx'
