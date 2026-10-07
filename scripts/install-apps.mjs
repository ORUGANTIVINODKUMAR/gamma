import { fileURLToPath } from 'node:url'
import { apps } from './apps.mjs'
import { npm } from './run.mjs'

for (const app of apps) {
  console.log(`\nInstalling ${app.folder} from its existing lockfile`)
  npm(['ci', '--no-audit', '--no-fund'], fileURLToPath(new URL(`../${app.folder}/`, import.meta.url)))
}
