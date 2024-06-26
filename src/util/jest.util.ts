import fs from 'node:fs'
import os from 'node:os'
import { _range, _uniq } from '@naturalcycles/js-lib'
import { execVoidCommandSync, dimGrey, white } from '@naturalcycles/nodejs-lib'
import { cfgDir } from '../cnst/paths.cnst'
import { nodeModuleExists } from './test.util'

export function getJestConfigPath(): string {
  return fs.existsSync(`./jest.config.js`) ? './jest.config.js' : `${cfgDir}/jest.config.js`
}

export function getJestIntegrationConfigPath(): string {
  return fs.existsSync(`./jest.integration-test.config.js`)
    ? `./jest.integration-test.config.js`
    : `${cfgDir}/jest.integration-test.config.js`
}

export function getJestManualConfigPath(): string {
  return fs.existsSync(`./jest.manual-test.config.js`)
    ? `./jest.manual-test.config.js`
    : `${cfgDir}/jest.manual-test.config.js`
}

/**
 * Detects if jest is run with all tests, or with specific tests.
 */
export function isRunningAllTests(): boolean {
  const args = process.argv.slice(2)
  const positionalArgs = args.filter(a => !a.startsWith('-'))

  // console.log(process.argv, positionalArgs)

  return !positionalArgs.length
}

interface RunJestOpt {
  integration?: boolean
  manual?: boolean
  leaks?: boolean
}

/**
 * 1. Adds `--silent` if running all tests at once.
 */
export function runJest(opt: RunJestOpt = {}): void {
  if (!nodeModuleExists('jest')) {
    console.log(dimGrey(`node_modules/${white('jest')} not found, skipping tests`))
    return
  }

  const {
    CI,
    CPU_LIMIT,
    TZ = 'UTC',
    APP_ENV,
    JEST_NO_ALPHABETIC,
    JEST_SHARDS,
    NODE_OPTIONS = 'not defined',
  } = process.env
  const { node } = process.versions
  const cpuLimit = Number(CPU_LIMIT) || undefined
  const { integration, manual, leaks } = opt
  const processArgs = process.argv.slice(2)

  let jestConfig: string

  if (manual) {
    jestConfig = getJestManualConfigPath()
  } else if (integration) {
    jestConfig = getJestIntegrationConfigPath()
  } else {
    jestConfig = getJestConfigPath()
  }

  // Allow to override --maxWorkers
  let maxWorkers = processArgs.find(a => a.startsWith('--maxWorkers'))

  const args: string[] = [
    `--config=${jestConfig}`,
    '--logHeapUsage',
    '--passWithNoTests',
    ...processArgs,
  ]

  const env = {
    TZ,
    DEBUG_COLORS: '1',
  }

  if (CI) {
    args.push('--ci')

    // Works with both --coverage=false and --no-coverage syntaxes
    if (!integration && !manual && !processArgs.some(a => a.includes('-coverage'))) {
      // Coverage only makes sense for unit tests, not for integration/manual
      args.push('--coverage')
    }

    if (!maxWorkers && cpuLimit && cpuLimit > 1) {
      maxWorkers = `--maxWorkers=${cpuLimit - 1}`
    }
  }

  // Running all tests - will use `--silent` to suppress console-logs, will also set process.env.JEST_SILENT=1
  if (CI || isRunningAllTests()) {
    args.push('--silent')
  }

  if (leaks) {
    args.push('--detectOpenHandles', '--detectLeaks')
    maxWorkers ||= '--maxWorkers=1'
  }

  if (maxWorkers) args.push(maxWorkers)

  if (args.includes('--silent')) {
    Object.assign(env, {
      JEST_SILENT: '1',
    })
  }

  if (!integration && !manual && !APP_ENV) {
    Object.assign(env, {
      APP_ENV: 'test',
    })
  }

  if (!JEST_NO_ALPHABETIC) {
    args.push(`--testSequencer=${cfgDir}/jest.alphabetic.sequencer.js`)
  }

  const availableParallelism = os.availableParallelism?.()
  const cpus = os.cpus().length
  console.log(
    `${dimGrey(
      Object.entries({
        node,
        NODE_OPTIONS,
        cpus,
        availableParallelism,
        cpuLimit,
      })
        .map(([k, v]) => `${k}: ${v}`)
        .join(', '),
    )}`,
  )

  if (JEST_SHARDS) {
    const totalShards = Number(JEST_SHARDS)
    const shards = _range(1, totalShards + 1)

    for (const shard of shards) {
      execVoidCommandSync('jest', _uniq([...args, `--shard=${shard}/${totalShards}`]), {
        env,
      })
    }
  } else {
    execVoidCommandSync('jest', _uniq(args), {
      env,
    })
  }
}
