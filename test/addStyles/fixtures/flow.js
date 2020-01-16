export const input = `
// @flow

type Props = {
  +text: string,
}

const Test = ({text}: Props): React.Node => (
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

type Props = {
  +text: string,
  +classes: Classes<typeof styles>,
};

const Test = ({
  text,
  classes
}: Props): React.Node => (
  <div>{text}</div>
)

const TestWithStyles = withStyles(styles)(Test)
`
