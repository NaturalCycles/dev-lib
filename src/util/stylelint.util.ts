import fs from 'node:fs'
import { execVoidCommandSync } from '@naturalcycles/nodejs-lib'
import yargs from 'yargs'
import { cfgDir } from '../cnst/paths.cnst'

const { prettierDirs, stylelintExtensions, lintExclude } = require('../../cfg/_cnst')

export const stylelintPaths = [
  // Everything inside these folders
  `./{${prettierDirs}}/**/*.{${stylelintExtensions}}`,

  // Exclude
  ...lintExclude.map((s: string) => `!${s}`),
]

export function stylelintAll(): void {
  const { fix } = yargs.options({
    fix: {
      type: 'boolean',
      default: true,
    },
  }).argv

  const config = [`./stylelint.config.js`, `${cfgDir}/stylelint.config.js`].find(f =>
    fs.existsSync(f),
  )!

  const args = [
    fix ? `--fix` : '',
    `--allow-empty-input`,
    `--config`,
    config,
    ...stylelintPaths,
  ].filter(Boolean)

  execVoidCommandSync('stylelint', args)
}
