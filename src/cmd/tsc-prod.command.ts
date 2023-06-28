import { _since } from '@naturalcycles/js-lib'
import { boldGrey, dimGrey } from '@naturalcycles/nodejs-lib/dist/colors'
import { execVoidCommandSync } from '../util/exec.util'

export function tscProdCommand(): void {
  // You cannot have a shared `tsconfig.prod.json` because of relative paths for `include`
  const projectTsconfigPath = `./tsconfig.prod.json`

  const args: string[] = ['-P', projectTsconfigPath]

  const started = Date.now()
  execVoidCommandSync(`tsc`, args)
  console.log(`${boldGrey('tsc prod')} ${dimGrey(`took ` + _since(started))}`)
}
