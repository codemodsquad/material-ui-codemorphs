export const input = `
const Test = (props) => {
  const {text} = props
  // position
  return <div>{text}</div>
}
`

export const output = `
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({

})

const TestWithStyles = (props) => {
  const {
    text,
    classes
  } = props
  return <div>{text}</div>
}

const Test = withStyles(styles)(TestWithStyles)
`
