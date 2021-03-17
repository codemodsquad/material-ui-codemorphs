export const input = `
// @flow

import * as React from 'react'

const Test = React.forwardRef(({text}, ref) => (
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

const Test = React.forwardRef(({text}, ref) => {
  const classes: Classes = useStyles();
  return <div ref={ref}>{text}</div>;
})
`
