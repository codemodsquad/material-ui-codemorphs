export const input = `
// @flow

import * as React from 'react'

const Test = ({text}) => (
  // position
  <div>{text}</div>
)
`

export const output = `
// @flow

import * as React from 'react'

import { makeStyles } from "@material-ui/core/styles";
import { type Theme } from "../../src/universal/theme";

const useStyles = makeStyles((theme: Theme) => ({

}));

const Test = ({text}) => {
  const classes = useStyles();
  return <div>{text}</div>;
}
`
