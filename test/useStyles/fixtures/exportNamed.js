export const input = `
import * as React from 'react'

export const Test = ({text}) => {
  // position
  return <div>{text}</div>
}
`

export const output = `
import * as React from 'react'

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({

}));

export const Test = (props) => {
  const classes = useStyles(props);
  const {text} = props
  return <div>{text}</div>
}
`
