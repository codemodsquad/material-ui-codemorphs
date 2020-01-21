export const input = `
import * as React from 'react'

const Test = ({text}) => (
  // position
  <div>{text}</div>
)
`

export const output = `
import * as React from 'react'

import { makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({

}));

const Test = ({text}) => {
  const classes = useStyles();
  return <div>{text}</div>;
}
`

export const parser = 'tsx'
export const file = 'test.tsx'
