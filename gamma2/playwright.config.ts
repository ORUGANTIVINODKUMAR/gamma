import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const cachedChromium = join(process.env.LOCALAPPDATA || '', 'ms-playwright/chromium-1234/chrome-win64/chrome.exe')
const production = process.env.TAPRECO_TEST_PRODUCTION === '1'
const port = production ? 4173 : 5173

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: process.env.TAPRECO_CHROMIUM_PATH || (existsSync(cachedChromium) ? cachedChromium : undefined),
      args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npm run ${production ? 'preview' : 'dev'} -- --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
