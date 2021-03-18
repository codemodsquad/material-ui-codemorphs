export const input = `
// @flow

import * as React from 'react'

type Props = {
  text: string,
}

const Test = ({text}: Props) => (
  // position
  <div>{text}</div>
)
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

const Test = (props: Props) => {
  const classes: Classes = useStyles(props);

  const {text} = props

  return <div>{text}</div>;
}
`
