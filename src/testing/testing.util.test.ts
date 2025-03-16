import { test } from 'vitest'
import { jestLog, jestLogger, silentConsole } from './testing.util'

test('jestLogger', () => {
  jestLog('hello')
  jestLog({ a: 'a' })
  jestLogger.log('hej')
  jestLogger.warn('hej warn')
  jestLogger.error('hej error')

  // expectTypeOf(jestLogger).toEqualTypeOf<CommonLogger>()
})

test('silentConsole', () => {
  silentConsole()
  console.log()
  console.debug()
  console.info()
  console.warn()
  console.error()
})
