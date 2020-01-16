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

const Test = ({
  text,
  classes
}) => (
  <div>{text}</div>
)

const TestWithStyles = withStyles(testStyles)(Test)
`

export const parser = 'tsx'
export const file = 'test.tsx'
