export const input = `
const Test = ({text, ...props}) => (
  // position
  <div {...props}>{text}</div>
)
`

export const output = `
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({

})

const Test = ({
  text,
  classes,
  ...props
}) => (
  <div {...props}>{text}</div>
)

const TestWithStyles = withStyles(styles)(Test)
`
