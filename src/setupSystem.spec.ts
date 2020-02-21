/**
 * @flow
 * @prettier
 */

/* eslint-disable @typescript-eslint/no-var-requires */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import j from 'jscodeshift'
const setupMaterialUISystem = require('./setupSystem')

const stats = (): void => {
  // noop
}

describe(`setupMaterialUISystem`, function() {
  it(`works when Box isn't already declared`, function() {
    const source = `
import * as React from 'react'
const Foo = () => <Box marginLeft={2} />
const Bar = () => <Box boxShadow={1} />
`
    const fileInfo = {
      path: __filename,
      source,
    }
    const api = {
      j: j.withParser('babylon'),
      jscodeshift: j.withParser('babylon'),
      stats,
      report: process.stdout.write.bind(process.stdout),
    }
    const result = setupMaterialUISystem(fileInfo, api, {})
    expect(result).to.equal(`
import * as React from 'react'
import { styled } from "@material-ui/styles";
import { spacing, shadows, compose } from "@material-ui/system";
const Box = styled('div')(
  compose(shadows, spacing)
)
const Foo = () => <Box marginLeft={2} />
const Bar = () => <Box boxShadow={1} />
`)
  })
  it(`works when Box is already declared`, function() {
    const source = `
import * as React from 'react'
import { styled } from "@material-ui/styles";
import { shadows } from "@material-ui/system";
const Box = styled('div')(
  shadows
)
const Foo = () => <Box marginLeft={2} />
const Bar = () => <Box boxShadow={1} />
`
    const fileInfo = {
      path: __filename,
      source,
    }
    const api = {
      j: j.withParser('babel'),
      jscodeshift: j.withParser('babel'),
      stats,
      report: process.stdout.write.bind(process.stdout),
    }
    const result = setupMaterialUISystem(fileInfo, api, {})
    expect(result).to.equal(`
import * as React from 'react'
import { styled } from "@material-ui/styles";
import { shadows, spacing, compose } from "@material-ui/system";
const Box = styled('div')(
  compose(shadows, spacing)
)
const Foo = () => <Box marginLeft={2} />
const Bar = () => <Box boxShadow={1} />
`)
  })
  it(`works when there's a single system function`, function() {
    const source = `
import * as React from 'react'
const Foo = () => <Box marginLeft={2} />
`
    const fileInfo = {
      path: __filename,
      source,
    }
    const api = {
      j: j.withParser('babel'),
      jscodeshift: j.withParser('babel'),
      stats,
      report: process.stdout.write.bind(process.stdout),
    }
    const result = setupMaterialUISystem(fileInfo, api, {})
    expect(result).to.equal(`
import * as React from 'react'
import { styled } from "@material-ui/styles";
import { spacing } from "@material-ui/system";
const Box = styled('div')(
  spacing
)
const Foo = () => <Box marginLeft={2} />
`)
  })
  it(`removes unused system imports`, function() {
    const source = `
import * as React from 'react'
import { styled } from "@material-ui/styles";
import { spacing, shadows, compose } from "@material-ui/system";
const Box = styled('div')(
  spacing
)
const Foo = () => <Box marginLeft={2} />
`
    const fileInfo = {
      path: __filename,
      source,
    }
    const api = {
      j: j.withParser('babel'),
      jscodeshift: j.withParser('babel'),
      stats,
      report: process.stdout.write.bind(process.stdout),
    }
    const result = setupMaterialUISystem(fileInfo, api, {})
    expect(result).to.equal(`
import * as React from 'react'
import { styled } from "@material-ui/styles";
import { spacing } from "@material-ui/system";
const Box = styled('div')(
  spacing
)
const Foo = () => <Box marginLeft={2} />
`)
  })
  it(`handles breakpoints`, function() {
    const source = `
import * as React from 'react'
const Foo = () => <Box sm={{marginLeft: 2, fontSize: 12}} md={{marginLeft: 3, fontSize: 16}}/>
const Bar = () => <Box boxShadow={1} />
`
    const fileInfo = {
      path: __filename,
      source,
    }
    const api = {
      j: j.withParser('babel'),
      jscodeshift: j.withParser('babel'),
      stats,
      report: process.stdout.write.bind(process.stdout),
    }
    const result = setupMaterialUISystem(fileInfo, api, {})
    expect(result).to.equal(`
import * as React from 'react'
import { styled } from "@material-ui/styles";
import { spacing, typography, shadows, breakpoints, compose } from "@material-ui/system";
const Box = styled('div')(
  breakpoints(
    compose(shadows, spacing, typography)
  )
)
const Foo = () => <Box sm={{marginLeft: 2, fontSize: 12}} md={{marginLeft: 3, fontSize: 16}}/>
const Bar = () => <Box boxShadow={1} />
`)
  })
  it(`tsx parser`, function() {
    const source = `
import * as React from 'react'
const Foo = () => <Box sm={{marginLeft: 2, fontSize: 12}} md={{marginLeft: 3, fontSize: 16}}/>
const Bar = () => <Box boxShadow={1} />
`
    const fileInfo = {
      path: __filename,
      source,
    }
    const api = {
      j: j.withParser('tsx'),
      jscodeshift: j.withParser('tsx'),
      stats,
      report: process.stdout.write.bind(process.stdout),
    }
    const result = setupMaterialUISystem(fileInfo, api, {})
    expect(result).to.equal(`
import * as React from 'react'
import { styled } from "@material-ui/styles";
import { spacing, typography, shadows, breakpoints, compose } from "@material-ui/system";
const Box = styled('div')(
  breakpoints(
    compose(shadows, spacing, typography)
  )
)
const Foo = () => <Box sm={{marginLeft: 2, fontSize: 12}} md={{marginLeft: 3, fontSize: 16}}/>
const Bar = () => <Box boxShadow={1} />
`)
  })
})
