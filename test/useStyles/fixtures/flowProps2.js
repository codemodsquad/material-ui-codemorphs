export const input = `
// @flow

import * as React from 'react'

const Test = ({text}: {
  text: string,
}) => (
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

const Test = (props: {
  text: string,
  classes?: $Shape<Classes>,
}) => {
  const classes: Classes = useStyles(props);

  const {text} = props

  return <div>{text}</div>;
}
`
