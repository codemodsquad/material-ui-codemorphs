export const input = `
import * as React from 'react'

const useStyles = 2

const Test = ({text}) => (
  // position
  <div>{text}</div>
)
`

export const output = `
import * as React from 'react'

import { makeStyles } from "@material-ui/core/styles";

const useStyles = 2

const useTestStyles = makeStyles(theme => ({

}));

const Test = ({text}) => {
  const classes = useTestStyles();
  return <div>{text}</div>;
}
`
