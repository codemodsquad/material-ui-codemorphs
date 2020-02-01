# material-ui-codemorphs

[![CircleCI](https://circleci.com/gh/codemodsquad/material-ui-codemorphs.svg?style=svg)](https://circleci.com/gh/codemodsquad/material-ui-codemorphs)
[![Coverage Status](https://codecov.io/gh/codemodsquad/material-ui-codemorphs/branch/master/graph/badge.svg)](https://codecov.io/gh/codemodsquad/material-ui-codemorphs)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/material-ui-codemorphs.svg)](https://badge.fury.io/js/material-ui-codemorphs)

Smart codemod scripts for day-to-day work with Material UI

# Table of Contents

<!-- toc -->

- [`useStyles`](#usestyles)
  - [Special options](#special-options)
  - [Flow Example](#flow-example)
  - [TypeScript example](#typescript-example)
- [`withStyles`](#withstyles)
  - [Special options](#special-options-1)
  - [Flow example](#flow-example)
  - [TypeScript example](#typescript-example-1)
- [`setupSystem`](#setupsystem)
  - [Example](#example)

<!-- tocstop -->

# `useStyles`

A `jscodeshift` transform that adds a `makeStyles` declaration and `useStyles`
hook to a function component.

Supports Flow, TypeScript, and plain JS. It's freakin great.

## Special options

### `selectionStart` (_optional_)

The start of the selection (e.g. in a text editor) within the source code.
This is used to determine which component(s) to add styles to. Without this
option, styles will be added to all components in the file. If `selectionEnd`
is not given, styles will only be added to the component that contains `selectionStart`.

### `selectionEnd` (_optional_)

The end of the selection (e.g. in a text editor) within the source code.
This is used to determine which component(s) to add styles to.

### `themeImport` (_optional_)

Overrides the `import` statement added by `useStyles` for importing the `Theme` type definition.
You can also configure this by adding the following to your `package.json`:

```json
{
  "material-ui-codemorphs": {
    "themeImport": "import { type Theme } from './src/universal/theme'"
  }
}
```

## Flow Example

### Before

```js
// @flow

import * as React from 'react'

const Test = ({ text }) => (
  // position
  <div>{text}</div>
)
```

### Transform

```
jscodeshift path/to/material-ui-codemorphs/useStyles.js src/Test.js \
  --parser=babylon \
  --selectionStart=95
```

### After

```js
// @flow

import * as React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { type Theme } from '../../src/universal/theme'

const useStyles = makeStyles((theme: Theme) => ({}))

const Test = ({ text }) => {
  const classes = useStyles()
  return <div>{text}</div>
}
```

## TypeScript example

### Before

```ts
import * as React from 'react'

const Test = ({ text }) => (
  // position
  <div>{text}</div>
)
```

### Transform

```
jscodeshift path/to/material-ui-codemorphs/useStyles.js src/Test.tsx \
  --parser=tsx \
  --selectionStart=95
```

### After

```ts
import * as React from 'react'

import { makeStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) => ({}))

const Test = ({ text }) => {
  const classes = useStyles()
  return <div>{text}</div>
}
```

# `withStyles`

A `jscodeshift` transform that wraps a component with `withStyles`,
adds the `const styles = (theme: Theme) => ({ })` declaration,
and adds a `classes` type annotation and prop destructuring if possible.

Supports Flow, TypeScript, and plain JS. It's freakin great.

## Special options

### `selectionStart` (_optional_)

The start of the selection (e.g. in a text editor) within the source code.
This is used to determine which component(s) to add styles to. Without this
option, styles will be added to all components in the file. If `selectionEnd`
is not given, styles will only be added to the component that contains `selectionStart`.

### `selectionEnd` (_optional_)

The end of the selection (e.g. in a text editor) within the source code.
This is used to determine which component(s) to add styles to.

### `themeImport` (_optional_)

Overrides the `import` statement added by `withStyles` for importing the `Theme` type definition.
You can also configure this by adding the following to your `package.json`:

```json
{
  "material-ui-codemorphs": {
    "themeImport": "import { type Theme } from './src/universal/theme'"
  }
}
```

## Flow example

### Before

```js
// @flow

type Props = {
  +text: string,
}

export const Test = ({ text }: Props): React.Node => (
  // position
  <div>{text}</div>
)
```

### Transform

```
jscodeshift path/to/material-ui-codemorphs/withStyles.js src/Test.js \
  --parser=babylon \
  --selectionStart=95 \
  --themeImport='import {type Theme} from "./src/universal/theme"'
```

### After

```js
// @flow
import { withStyles } from '@material-ui/core/styles'

import { type Theme } from '../theme'

type Classes<Styles> = $Call<<T>((any) => T) => { [$Keys<T>]: string }, Styles>

const styles = (theme: Theme) => ({})

type Props = {
  +text: string,
  +classes: Classes<typeof styles>,
}

const TestWithStyles = ({ text, classes }: Props): React.Node => (
  <div>{text}</div>
)

const Test = withStyles(styles)(TestWithStyles)

export { Test }
```

## TypeScript example

### Before

```tsx
import * as React from 'react'

interface Props {
  text: string
}

export const Test = ({ text }: Props): React.ReactNode => (
  // position
  <div>{text}</div>
)
```

### Transform

```
jscodeshift path/to/material-ui-codemorphs/withStyles.js src/Test.tsx \
  --parser=tsx \
  --selectionStart=95
```

### After

```tsx
import * as React from 'react'

import { withStyles, Theme, WithStyles } from '@material-ui/core/styles'

interface Props extends WithStyles<typeof styles> {
  text: string
}

const styles = (theme: Theme) => ({})

const TestWithStyles = ({ text, classes }: Props): React.ReactNode => (
  <div>{text}</div>
)

const Test = withStyles(styles)(TestWithStyles)

export { Test }
```

# `setupSystem`

A `jscodeshift` transform that creates or updates the declaration for `Box` and corresponding imports
based upon the JSX attributes you use on it.

## Example

### Before

```js
import * as React from 'react'
const Foo = () => (
  <Box
    sm={{ marginLeft: 2, fontSize: 12 }}
    md={{ marginLeft: 3, fontSize: 16 }}
  />
)
const Bar = () => <Box boxShadow={1} />
```

### Transform

```
jscodeshift -t path/to/material-ui-codemorphs/setupSystem.js test.js
```

### After

```js
import * as React from 'react'
import { styled } from '@material-ui/styles'
import {
  spacing,
  typography,
  shadows,
  breakpoints,
  compose,
} from '@material-ui/system'
const Box = styled('div')(breakpoints(compose(shadows, spacing, typography)))
const Foo = () => (
  <Box
    sm={{ marginLeft: 2, fontSize: 12 }}
    md={{ marginLeft: 3, fontSize: 16 }}
  />
)
const Bar = () => <Box boxShadow={1} />
```
