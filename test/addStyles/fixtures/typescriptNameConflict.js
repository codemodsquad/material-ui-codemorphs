export const input = `
const styles = {}

const Test = ({text}) => (
  // position
  <div>{text}</div>
)
`

export const output = `
import { withStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { WithStyles } from "@material-ui/core";
const styles = {}

const testStyles = (theme: Theme) => ({

})

const TestWithStyles = ({
  text,
  classes
}) => (
  <div>{text}</div>
)

const Test = withStyles(testStyles)(TestWithStyles)
`

export const parser = 'tsx'
export const file = 'test.tsx'
