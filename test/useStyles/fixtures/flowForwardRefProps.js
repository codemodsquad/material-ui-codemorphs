export const input = `
// @flow

import * as React from 'react'

type Props = {
  text: string,
}

const Test = React.forwardRef(({text}: Props, ref) => (
  // position
  <div ref={ref}>{text}</div>
))
`

export const output = `
// @flow

import * as React from 'react'

import { makeStyles } from "@material-ui/core/styles";
import { type Theme } from "../../src/universal/theme";

type Classes = {|

|}

const useStyles = makeStyles((theme: Theme): $ObjMap<Classes, () => { ... }> => ({

}));

type Props = {
  text: string,
  classes?: $Shape<Classes>,
}

const Test = React.forwardRef((props: Props, ref) => {
  const classes: Classes = useStyles(props);

  const { text } = props

  return <div ref={ref}>{text}</div>;
})
`
