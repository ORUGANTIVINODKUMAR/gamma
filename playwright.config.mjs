import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const cached = join(process.env.LOCALAPPDATA || '', 'ms-playwright/chromium-1234/chrome-win64/chrome.exe')
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.mjs', workers: 1,
  timeout: 60_000, expect: { timeout: 15_000 }, reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173', viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: process.env.TAPRECO_CHROMIUM_PATH || (existsSync(cached) ? cached : undefined),
      args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
    },
    trace: 'retain-on-failure', screenshot: 'only-on-failure',
  },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 30_000 },
})
