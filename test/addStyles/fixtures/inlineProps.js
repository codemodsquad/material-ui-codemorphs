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

type Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>

const styles = (theme: Theme) => ({

})

const Test = ({
  text,
  classes
}: {
  +text: string,
  +classes: Classes<typeof styles>,
}): React.Node => (
  <div>{text}</div>
);

const TestWithStyles = withStyles(styles)(Test)
`
