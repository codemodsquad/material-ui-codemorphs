export const input = `
// @flow

type Props = {
  +text: string,
}

const Test = (props: Props) => {
  // position
  return <div>{props.text}</div>
}
`

export const output = `
// @flow
import { withStyles } from "@material-ui/core/styles";

import { type Theme } from "../../src/universal/theme";

type Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>

const styles = (theme: Theme) => ({

})

type Props = {
  +text: string,
  +classes: Classes<typeof styles>,
};

const TestWithStyles = (props: Props) => {
  return <div>{props.text}</div>
}

const Test = withStyles(styles)(TestWithStyles)
`
