import fs from 'node:fs'
import { _since } from '@naturalcycles/js-lib'
import { boldGrey, dimGrey, execVoidCommand, fs2, kpySync } from '@naturalcycles/nodejs-lib'

export async function buildEsmCjs(): Promise<void> {
  // You cannot have a shared `tsconfig.prod.json` because of relative paths for `include`
  const TSCONF_CJS_PATH = `./tsconfig.cjs.prod.json`
  const TSCONF_ESM_PATH = `./tsconfig.esm.prod.json`
  const TSCONF_PROD_PATH = `./tsconfig.prod.json`

  const cjsExists = fs2.pathExists(TSCONF_CJS_PATH)
  const esmExists = fs2.pathExists(TSCONF_ESM_PATH)

  // it doesn't delete the dir itself, to prevent IDE jumping
  fs2.emptyDir('./dist')
  fs2.emptyDir('./dist-esm')

  buildCopy()

  const cjsPath = cjsExists ? TSCONF_CJS_PATH : TSCONF_PROD_PATH
  const esmPath = esmExists ? TSCONF_ESM_PATH : TSCONF_PROD_PATH

  await Promise.all([
    execVoidCommand('tsc', [
      '-P',
      cjsPath,
      '--outDir',
      './dist',
      '--module',
      'nodenext',
      '--moduleResolution',
      'nodenext',
    ]),
    execVoidCommand('tsc', [
      '-P',
      esmPath,
      '--outDir',
      './dist-esm',
      '--module',
      'esnext',
      '--moduleResolution',
      'bundler',
      '--declaration',
      'false',
    ]),
  ])
}

export async function buildProd(): Promise<void> {
  fs2.emptyDir('./dist') // it doesn't delete the dir itself, to prevent IDE jumping
  buildCopy()
  await runTSCProd()
}

/**
 * Use '.' to indicate root.
 */
export async function runTSCInFolders(
  tsconfigPaths: string[],
  args: string[] = [],
  parallel = true,
): Promise<void> {
  if (parallel) {
    await Promise.all(tsconfigPaths.map(p => runTSCInFolder(p, args)))
  } else {
    for (const p of tsconfigPaths) {
      await runTSCInFolder(p, args)
    }
  }
}

/**
 * Pass '.' to run in root.
 */
export async function runTSCInFolder(tsconfigPath: string, args: string[] = []): Promise<void> {
  if (!fs.existsSync(tsconfigPath)) {
    console.log(`Skipping to run tsc for ${tsconfigPath}, as it doesn't exist`)
    return
  }

  const started = Date.now()
  await execVoidCommand(`tsc`, ['-P', tsconfigPath, ...args])
  console.log(`${boldGrey(`tsc ${tsconfigPath}`)} ${dimGrey(`took ` + _since(started))}`)
}

export async function runTSCProd(): Promise<void> {
  const tsconfigPath = [`./tsconfig.prod.json`].find(p => fs.existsSync(p)) || 'tsconfig.json'

  const args: string[] = ['-P', tsconfigPath]

  const started = Date.now()
  await execVoidCommand(`tsc`, args)
  console.log(`${boldGrey('tsc prod')} ${dimGrey(`took ` + _since(started))}`)
}

export function buildCopy(): void {
  const baseDir = 'src'
  const inputPatterns = [
    '**',
    '!**/*.ts',
    '!**/__snapshots__',
    '!**/__exclude',
    '!test',
    '!**/*.test.js',
  ]
  const outputDir = 'dist'

  kpySync({
    baseDir,
    inputPatterns,
    outputDir,
    dotfiles: true,
  })
}
