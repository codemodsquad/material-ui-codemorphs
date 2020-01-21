export const input = `
// @flow

interface Props {
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

interface Props {
  +text: string,
  +classes: Classes<typeof styles>,
}

const TestWithStyles = ({
  text,
  classes
}: Props): React.Node => (
  <div>{text}</div>
)

const Test = withStyles(styles)(TestWithStyles)
`
