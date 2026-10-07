import { spawnSync } from 'node:child_process'

export function npm(args, cwd) {
  // Run npm's CLI directly: works on Windows and Linux without shell quoting.
  const cli = process.env.npm_execpath
  const result = cli
    ? spawnSync(process.execPath, [cli, ...args], { cwd, stdio: 'inherit', env: process.env })
    : spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
      cwd, stdio: 'inherit', env: process.env, shell: process.platform === 'win32',
    })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed in ${cwd} (${result.status})`)
}
