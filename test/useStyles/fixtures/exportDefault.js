export const input = `
import * as React from 'react'

export default function Test({text}) {
  // position
  return <div>{text}</div>
}
`

export const output = `
import * as React from 'react'

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({

}));

export default function Test({text}) {
  const classes = useStyles();
  return <div>{text}</div>
}
`
