exports.input = `
// @flow

type Props = {
  +text: string,
}

const Test = ({text}: Props): React.Node => (
  // position
  <div>{text}</div>
)
`

exports.output = `
// @flow
import { withStyles } from "@material-ui/core/styles";

import { type Theme } from "../theme";

type Classes = {|

|}

const styles = (theme: Theme): $ObjMap<Classes, () => { ... }> => ({

})

type Props = {
  +text: string,
  +classes: Classes,
};

const TestWithStyles = ({
  text,
  classes
}: Props): React.Node => (
  <div>{text}</div>
)

const Test = withStyles(styles)(TestWithStyles)
`
