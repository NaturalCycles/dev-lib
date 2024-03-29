/**
 * Default config for jest.
 * Extendable.
 */

const fs = require('node:fs')

const runInIDE = process.argv.some(
  a => a === '--runTestsByPath' || a.includes('IDEA') || a.includes('Visual Studio'),
)
const ideIntegrationTest = runInIDE && process.argv.some(a => a.endsWith('.integration.test.ts'))
const ideManualTest = runInIDE && process.argv.some(a => a.endsWith('.manual.test.ts'))
const { CI, GITHUB_ACTIONS } = process.env
const cwd = process.cwd()

// Set 'setupFilesAfterEnv' only if it exists
const setupFilesAfterEnv = []
if (fs.existsSync(`${cwd}/src/test/setupJest.ts`)) {
  setupFilesAfterEnv.push('<rootDir>/src/test/setupJest.ts')
}

if (ideIntegrationTest) {
  if (fs.existsSync(`${cwd}/src/test/setupJest.integration.ts`)) {
    setupFilesAfterEnv.push('<rootDir>/src/test/setupJest.integration.ts')
  }
} else if (ideManualTest) {
  if (fs.existsSync(`${cwd}/src/test/setupJest.manual.ts`)) {
    setupFilesAfterEnv.push('<rootDir>/src/test/setupJest.manual.ts')
  }
} else {
  if (fs.existsSync(`${cwd}/src/test/setupJest.unit.ts`)) {
    setupFilesAfterEnv.push('<rootDir>/src/test/setupJest.unit.ts')
  }
}

const testMatch = ['<rootDir>/src/**/*.test.ts?(x)']
const roots = ['<rootDir>/src']
const scriptDirExists = fs.existsSync(`${cwd}/scripts`)
if (scriptDirExists) {
  testMatch.push('<rootDir>/scripts/**/*.test.ts?(x)')
  roots.push('<rootDir>/scripts')
}

const testPathIgnorePatterns = ['<rootDir>/.*/__exclude/', '<rootDir>/src/environments/']

// console.log({argv: process.argv})

if (runInIDE) {
  console.log({ runInIDE, ideIntegrationTest, ideManualTest })
  process.env.APP_ENV = process.env.APP_ENV || 'test'
  process.env.TZ = process.env.TZ || 'UTC'
} else {
  // This allows to run integration/manual tests in IDE
  testPathIgnorePatterns.push('\\.integration\\.test\\.ts$', '\\.manual\\.test\\.ts$')
}

/** @typedef {import('ts-jest/dist/types')} */
module.exports = {
  transform: {
    // '^.+\\.js$': 'babel-jest',
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: false,
        // compilerHost: true, // disabled, cause its effects are not detected/understood yet
        // incremental: true,
        isolatedModules: true, // faster when run without cache (e.g in CI), 50s vs 83s for NCBackend3 right now
        babelConfig: false, // https://kulshekhar.github.io/ts-jest/user/config/babelConfig
        tsconfig: {
          sourceMap: true,
          allowJs: true,
        },
      },
    ],
    // example (experimental):
    // '^.+\\.ts$': '@naturalcycles/dev-lib/cfg/jest.esbuild.transformer.js',
  },
  transformIgnorePatterns: ['/node_modules/'], // Jest default value
  testMatch,
  roots,
  rootDir: cwd,
  testPathIgnorePatterns,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'd.ts', 'json'],
  moduleNameMapper: {
    // should match aliases from tsconfig.json
    // as explained here: https://alexjoverm.github.io/2017/10/07/Enhance-Jest-configuration-with-Module-Aliases/
    '@src/(.*)$': '<rootDir>/src/$1',
  },
  skipNodeResolution: true,
  testEnvironment: 'node',
  errorOnDeprecated: true,
  restoreMocks: true,
  unmockedModulePathPatterns: [],
  setupFilesAfterEnv,
  workerIdleMemoryLimit: '800MB', // workaround for this: https://github.com/facebook/jest/issues/11956
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/__exclude/**',
    '!src/index.{ts,tsx}',
    '!src/test/**',
    '!src/typings/**',
    '!scripts/**',
    '!src/env/**',
    '!src/environment/**',
    '!src/environments/**',
    '!src/env/**',
    '!src/bin/**',
    '!src/vendor/**',
    '!public/**',
    '!**/*.test.ts',
    '!**/*.script.ts',
    '!**/*.module.ts',
    '!**/*.mock.ts',
    '!**/*.page.{ts,tsx}',
    '!**/*.component.{ts,tsx}',
    '!**/*.modal.{ts,tsx}',
  ],
  // default: ["clover", "json", "lcov", "text"]
  coverageReporters: ['clover', 'json', 'json-summary', 'lcov', !CI && 'text'].filter(Boolean),
  // CI: only jest-junit reporter (no default)
  // not-CI: only default reporter, but not jest-junit
  reporters: [
    'default',
    CI && [
      'jest-junit',
      {
        suiteName: 'jest tests',
        outputDirectory: './tmp/jest',
        outputName: 'unit.xml',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{filename} - {classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' ',
      },
    ],
    GITHUB_ACTIONS && 'github-actions', // https://jestjs.io/blog/2022/04/25/jest-28#github-actions-reporter
  ].filter(Boolean),
  prettierPath: null, // todo: remove when jest has fixed it https://github.com/jestjs/jest/issues/14305
}
