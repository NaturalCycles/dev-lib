#!/usr/bin/env node

import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import { runJest } from '../util/jest.util'

runScript(async () => {
  await runJest({ ci: true })
})
