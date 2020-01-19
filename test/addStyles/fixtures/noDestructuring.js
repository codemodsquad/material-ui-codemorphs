export const input = `
const Test = (props) => {
  // position
  return <div>{props.text}</div>
}
`

export const output = `
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({

})

const TestWithStyles = (props) => {
  return <div>{props.text}</div>
}

const Test = withStyles(styles)(TestWithStyles)
`
