export const input = `
const Test = ({text}) => (
  // position
  <div>{text}</div>
)

const Binding = () => (
  <Test text="binding" />
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
)

const Test = withStyles(styles)(TestWithStyles)

const Binding = () => (
  <Test text="binding" />
)
`
