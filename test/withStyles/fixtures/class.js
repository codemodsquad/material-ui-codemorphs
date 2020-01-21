export const input = `
import * as React from 'react'

class Test extends React.Component {
  render() {
    // position
    return (
      <div>{text}</div>
    )
  }
}
`

export const output = `
import * as React from 'react'

import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({

})

class TestWithStyles extends React.Component {
  render() {
    return (
      <div>{text}</div>
    )
  }
}

const Test = withStyles(styles)(TestWithStyles)
`
