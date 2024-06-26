#!/usr/bin/env node

import fs from 'node:fs'
import { runScript } from '@naturalcycles/nodejs-lib'
import { cfgDir } from '../cnst/paths.cnst'

runScript(async () => {
  // const cwd = process.cwd()
  const localConfig = `./lint-staged.config.js`
  const sharedConfig = `${cfgDir}/lint-staged.config.js`
  const config = fs.existsSync(localConfig) ? localConfig : sharedConfig

  // this probably doesn't work, but we're still trying
  process.env['ESLINT_USE_FLAT_CONFIG'] = 'false'

  // await execWithArgs(`lint-staged`, [`--config`, config])
  // const lintStaged = require('lint-staged')
  // lint-staged is ESM since 12.0
  // const lintStaged = await import('lint-staged')
  // eslint-disable-next-line no-eval
  const { default: lintStaged } = await eval(`import('lint-staged')`)
  const success = await lintStaged({
    configPath: config,
  })

  if (!success) process.exit(3)
})
