#!/usr/bin/env node

import { runScript } from '@naturalcycles/nodejs-lib'
import { lintCircleCICommand } from '../cmd/lint-circleci.command'

runScript(lintCircleCICommand)
