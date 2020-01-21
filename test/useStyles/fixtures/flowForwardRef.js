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

const useStyles = makeStyles((theme: Theme) => ({

}));

const Test = React.forwardRef(({text}, ref) => {
  const classes = useStyles();
  return <div ref={ref}>{text}</div>;
})
`
