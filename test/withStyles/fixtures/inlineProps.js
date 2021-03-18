export const input = `
// @flow

const Test = ({text}: {+text: string}): React.Node => (
  // position
  <div>{text}</div>
)
`

export const output = `
// @flow
import { withStyles } from "@material-ui/core/styles";

import { type Theme } from "../../src/universal/theme";

type Classes = {|

|}

const styles = (theme: Theme): $ObjMap<Classes, () => { ... }> => ({

})

const TestWithStyles = ({
  text,
  classes
}: {
  +text: string,
  classes: Classes,
}): React.Node => (
  <div>{text}</div>
);

const Test = withStyles(styles)(TestWithStyles)
`
