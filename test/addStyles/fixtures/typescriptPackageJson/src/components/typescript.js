exports.input = `
import * as React from 'react'

interface Props {
  text: string
}

const Test = ({text}: Props): React.ReactNode => (
  // position
  <div>{text}</div>
)
`

exports.output = `
import * as React from 'react'

import { withStyles } from "@material-ui/core/styles";
import { Theme } from "../theme";
import { WithStyles } from "@material-ui/core";

interface Props extends WithStyles<typeof styles> {
  text: string
}

const styles = (theme: Theme) => ({

})

const TestWithStyles = ({
  text,
  classes
}: Props): React.ReactNode => (
  <div>{text}</div>
)

const Test = withStyles(styles)(TestWithStyles)
`

exports.parser = 'tsx'
exports.file = 'test.tsx'
