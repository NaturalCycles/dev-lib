#!/usr/bin/env node

import type { ExecSyncOptions } from 'node:child_process'
import * as cp from 'node:child_process'
import * as fs from 'node:fs'
import { cfgDir } from '../cnst/paths.cnst'
import { gitCurrentBranchName } from '../util/git.util'

const editMsg = process.argv[process.argv.length - 1] || '.git/COMMIT_EDITMSG'
// console.log(editMsg)

const cwd = process.cwd()
const localConfig = `${cwd}/commitlint.config.js`
const sharedConfig = `${cfgDir}/commitlint.config.js`
const config = fs.existsSync(localConfig) ? localConfig : sharedConfig

const env = { GIT_BRANCH: gitCurrentBranchName() }

// await execWithArgs(`commitlint`, [`--edit`, editMsg, `--config`, config], { env })
execSync(`node ./node_modules/.bin/commitlint --edit ${editMsg} --config ${config}`, {
  env,
})

function execSync(cmd: string, opt?: ExecSyncOptions): void {
  try {
    cp.execSync(cmd, {
      ...opt,
      encoding: 'utf8',
      stdio: 'inherit',
    })
  } catch {
    process.exit(1)
  }
}
