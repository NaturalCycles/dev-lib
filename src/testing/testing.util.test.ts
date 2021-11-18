import { deepFreeze, jestLog, jestLogger, silentConsole } from './testing.util'

test('deepFreeze', () => {
  const o = {
    a: {
      b: 'bb',
    },
  }
  deepFreeze(o)
  expect(() => (o.a = 'cc' as any)).toThrow()
  expect(() => (o.a.b = 'cc')).toThrow()
})

test('jestLogger', () => {
  jestLog('hello')
  jestLog({ a: 'a' })
  jestLogger.log('hej')
  jestLogger.warn('hej warn')
  jestLogger.error('hej error')
})

test('silentConsole', () => {
  silentConsole()
  console.log()
  console.debug()
  console.info()
  console.warn()
  console.error()
})
