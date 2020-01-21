export const input = `
export const Test = ({text}) => (
  // position
  <div>{text}</div>
)
`

export const output = `
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({

})

const TestWithStyles = ({
  text,
  classes
}) => (
  <div>{text}</div>
);

const Test = withStyles(styles)(TestWithStyles)

export { Test };
`
