import * as fs from 'node:fs'
import { cfgDir } from '../cnst/paths.cnst'
import { execVoidCommandSync } from './exec.util'
const { prettierDirs, prettierExtensionsAll, lintExclude } = require('../../cfg/_cnst')

const prettierPaths = [
  // Everything inside these folders
  `./{${prettierDirs}}/**/*.{${prettierExtensionsAll}}`,

  // Root
  `./*.{${prettierExtensionsAll}}`,

  // Exclude
  ...lintExclude.map((s: string) => `!${s}`),
]

export function runPrettier(): void {
  // If there's no `prettier.config.js` in target project - pass `./cfg/prettier.config.js`
  const prettierConfigPath =
    [`./prettier.config.js`].find(f => fs.existsSync(f)) || `${cfgDir}/prettier.config.js`

  // prettier --write 'src/**/*.{js,ts,css,scss,graphql}'
  const args = [`--write`, `--loglevel=warn`, `--config`, prettierConfigPath, ...prettierPaths]

  execVoidCommandSync('prettier', args)
}
