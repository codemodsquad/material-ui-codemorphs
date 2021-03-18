export const input = `
// @flow

type Props = {
  +text: string,
}

export const Test = function({text}: Props): React.Node {
  // position
  return (
    <div>{text}</div>
  )
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
  classes: Classes,
};

const TestWithStyles = function({
  text,
  classes
}: Props): React.Node {
  return (
    <div>{text}</div>
  )
};

const Test = withStyles(styles)(TestWithStyles)

export { Test };
`
