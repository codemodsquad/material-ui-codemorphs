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

import { withStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { WithStyles } from "@material-ui/core";

interface Props extends WithStyles<typeof styles> {
  text: string
}

const styles = (theme: Theme) => ({

})

const Test = ({
  text,
  classes
}: Props): React.ReactNode => (
  <div>{text}</div>
)

const TestWithStyles = withStyles(styles)(Test)
`

export const parser = 'tsx'
export const file = 'test.tsx'
