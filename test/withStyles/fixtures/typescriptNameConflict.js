export const input = `
const styles = {}

const Test = ({text}) => (
  // position
  <div>{text}</div>
)
`

export const output = `
import { withStyles, Theme } from "@material-ui/core/styles";
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
