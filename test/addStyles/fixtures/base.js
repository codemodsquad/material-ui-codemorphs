export const input = `
const Test = ({text}) => (
  // position
  <div>{text}</div>
)
`

export const output = `
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({

})

const Test = ({
  text,
  classes
}) => (
  <div>{text}</div>
)

const TestWithStyles = withStyles(styles)(Test)
`
