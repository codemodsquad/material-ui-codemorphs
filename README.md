# material-ui-codemorphs

[![CircleCI](https://circleci.com/gh/jedwards1211/material-ui-codemorphs.svg?style=svg)](https://circleci.com/gh/jedwards1211/material-ui-codemorphs)
[![Coverage Status](https://codecov.io/gh/jedwards1211/material-ui-codemorphs/branch/master/graph/badge.svg)](https://codecov.io/gh/jedwards1211/material-ui-codemorphs)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/material-ui-codemorphs.svg)](https://badge.fury.io/js/material-ui-codemorphs)

Smart codemod scripts for day-to-day work with Material UI

# `addStyles`

A `jscodeshift` transform that wraps a functional component with `withStyles`,
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

Overrides the `import` statement added by `addStyles` for importing the `Theme` type definition.

## Flow example

### Before

```js
// @flow

type Props = {
  +text: string,
}

const Test = ({ text }: Props): React.Node => (
  // position
  <div>{text}</div>
)

const Consumer = () => <Test text="binding" />
```

### Transform

```
jscodeshift path/to/material-ui-codemorphs/addStyles.js src/Test.js \
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

const Test = ({ text, classes }: Props): React.Node => <div>{text}</div>

const TestWithStyles = withStyles(styles)(Test)

const Consumer = () => <TestWithStyles text="binding" />
```

## TypeScript example

### Before

```tsx
import * as React from 'react'

interface Props {
  text: string
}

const Test = ({ text }: Props): React.ReactNode => (
  // position
  <div>{text}</div>
)

const Consumer = () => <Test text="binding" />
```

### Transform

```
jscodeshift path/to/material-ui-codemorphs/addStyles.js src/Test.tsx \
  --parser=tsx \
  --selectionStart=95
```

### After

```tsx
import * as React from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import { WithStyles } from '@material-ui/core'

interface Props extends WithStyles<typeof styles> {
  text: string
}

const styles = (theme: Theme) => ({})

const Test = ({ text, classes }: Props): React.ReactNode => <div>{text}</div>

const TestWithStyles = withStyles(styles)(Test)

const Consumer = () => <TestWithStyles text="binding" />
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
