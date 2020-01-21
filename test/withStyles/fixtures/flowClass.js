export const input = `
// @flow

import * as React from 'react'

type Props = {
  +text: string,
}

export default class Test extends React.Component<Props> {
  render() {
    const {text} = this.props
    // position
    return (
      <div>{text}</div>
    )
  }
}
`

export const output = `
// @flow

import * as React from 'react'

import { withStyles } from "@material-ui/core/styles";
import { type Theme } from "../../src/universal/theme";

type Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>

const styles = (theme: Theme) => ({

})

type Props = {
  +text: string,
  +classes: Classes<typeof styles>,
}

class TestWithStyles extends React.Component<Props> {
  render() {
    const {text} = this.props
    return (
      <div>{text}</div>
    )
  }
}

const Test = withStyles(styles)(TestWithStyles)

export default Test;
`
