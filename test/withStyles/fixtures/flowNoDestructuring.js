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

type Classes = {|

|}

const styles = (theme: Theme): $ObjMap<Classes, () => { ... }> => ({

})

type Props = {
  +text: string,
  +classes: Classes,
};

const TestWithStyles = (props: Props) => {
  return <div>{props.text}</div>
}

const Test = withStyles(styles)(TestWithStyles)
`
