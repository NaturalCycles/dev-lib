#!/usr/bin/env node

import { execCommand } from '../util/exec.util'

// `test` needs full path, cause, I guess, it conflicts with native OS `test` command?..
execCommand(`build && test-compile && yarn test`)