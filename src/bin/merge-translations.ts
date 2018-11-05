import * as fs from 'fs'
import * as path from 'path'
import * as yargs from 'yargs'

const argv = yargs.argv

if (!argv.base) {
  console.error('please specify --base)')
  process.exit(-1)
}

if (!argv.override) {
  console.error('please specify --override)')
  process.exit(-1)
}

if (!argv.outputDir) {
  console.error('please specify --outputDir)')
  process.exit(-1)
}

const root = process.cwd()
const LANG_MAP: { [key: string]: string } = {
  'pt.json': 'pt-BR.json',
}

// Params
const baseDir: string = path.join(root, argv.base)
const overrideDir: string = path.join(root, argv.override)
const outputDir: string = path.join(root, argv.outputDir)
const exitOnError: boolean = argv.exitOnError === 'true'

function merge () {
  pathExists(baseDir)
  pathExists(overrideDir)

  const baseFiles = getTranslationFiles(baseDir)

  baseFiles.forEach(fileName => {
    const filePath = path.join(baseDir, fileName)
    let overridePath = path.join(overrideDir, fileName)

    if (!pathExists(overridePath)) {
      const map = LANG_MAP[fileName]
      const mapPath = path.join(overrideDir, map)
      if (pathExists(mapPath)) {
        overridePath = mapPath
      } else {
        onError('could not find translation match for: ' + filePath)
        return
      }
    }

    const baseJSON = extractJSON(filePath)
    const overrideJSON = extractJSON(overridePath)

    // override base
    Object.keys(overrideJSON).forEach(key => {
      baseJSON[key] = overrideJSON[key]
    })

    const output = path.join(outputDir, fileName)
    fs.writeFileSync(output, JSON.stringify(baseJSON, undefined, 2), 'utf-8')

    console.info('\x1b[32m%s\x1b[0m', 'successfully translated: ' + output)
  })
}

function pathExists (path: string): boolean {
  if (fs.existsSync(path)) {
    return true
  }
  return false
}

function getTranslationFiles (path: string): string[] {
  const files: string[] = fs.readdirSync(path)
  return files
}

function extractJSON (path: string): any {
  const contents = fs.readFileSync(path, 'utf8')
  const jsonContent = JSON.parse(contents)
  return jsonContent
}

function onError (message: string): void {
  if (exitOnError) {
    console.error('\x1b[31m%s\x1b[0m', message)
    throw new Error(message)
  } else {
    console.warn('\x1b[33m%s\x1b[0m', message)
  }
}

merge()
