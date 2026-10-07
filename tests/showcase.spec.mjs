import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { apps } from '../scripts/apps.mjs'

for (const width of [1440, 768, 390]) {
  test(`dashboard and four applications fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Project Showcase', exact: true })).toBeVisible()
    await expect(page.locator('.tool-card')).toHaveCount(4)
    await expect(page.getByRole('link', { name: /^Open Website:/ })).toHaveCount(4)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `test-results/showcase-${width}.png`, fullPage: true })
    for (const app of apps) {
      await page.goto(`/${app.slug}/`)
      await expect(page.locator('#root h1').first()).toBeVisible()
      await expect(page.locator('#showcase-back-link')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), app.folder).toBe(true)
    }
  })
}

test('dashboard is keyboard accessible and passes WCAG checks', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(results.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([])
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Project Showcase home' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.locator('.open-button').first()).toBeFocused()
})

for (const app of apps) {
  test(`${app.folder}: card, refresh, internal navigation, browser Back and return link`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.locator(`.open-button[href="/${app.slug}/"]`).click()
    await expect(page).toHaveURL(`/${app.slug}/`)
    await expect(page.locator('#root h1').first()).toBeVisible()
    await page.reload()
    await expect(page.locator('#root h1').first()).toBeVisible()
    // Existing React Router links must stay inside their own base path.
    const link = page.locator('#root a').filter({ hasText: /Tax Tools|Explore Tools|Tools/ }).first()
    await link.click()
    await expect(page).toHaveURL(new RegExp(`/${app.slug}/?(?:tools|#tools)`))
    await page.goBack()
    await expect(page).toHaveURL(`/${app.slug}/`)
    await page.goto(`/${app.slug}`)
    await expect(page.locator('#root h1').first()).toBeVisible()
    await page.reload()
    await expect(page.locator('#root h1').first()).toBeVisible()
    await page.locator('#showcase-back-link').click()
    await expect(page).toHaveURL('/')
    await expect(page.locator('.tool-card')).toHaveCount(4)
    await page.goBack()
    await expect(page).toHaveURL(`/${app.slug}`)
    expect(errors).toEqual([])
  })
}

test('existing demo login, five calculators, edits and saved analysis work under the workspace base path', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/tapreco-workspace/app/tools/tax-planner')
  await expect(page).toHaveURL('/tapreco-workspace/login')
  await page.getByRole('button', { name: 'Use demo account' }).click()
  await expect(page).toHaveURL('/tapreco-workspace/app/tools/tax-planner')
  await expect(page.getByText('Projected federal tax with strategies', { exact: true })).toBeVisible()
  const wages = page.getByLabel('W-2 wages (box 1)', { exact: true })
  const projection = page.locator('main').getByText('Projected federal tax with strategies', { exact: true }).locator('..')
  const before = await projection.innerText()
  await wages.click()
  await wages.press('ControlOrMeta+A')
  await wages.pressSequentially('350000')
  await wages.blur()
  await expect(projection).not.toHaveText(before)
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('tapreco.draft.tool.tax-planner') || '{}').wages)).toBe(350000)
  await page.reload()
  await expect(wages).toHaveValue(/350,?000/)
  await page.getByRole('button', { name: 'Save analysis', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Title', { exact: true }).fill('Showcase verification analysis')
  await dialog.getByRole('button', { name: 'Save analysis', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await page.goto('/tapreco-workspace/app/reports')
  await expect(page.getByText('Showcase verification analysis', { exact: true })).toBeVisible()
  for (const slug of ['mutual-fund', 'estimated-tax', 'audit-risk', 'entity-comparison', 'tax-planner']) {
    await page.goto(`/tapreco-workspace/app/tools/${slug}`)
    await expect(page.locator('main h1').first()).toBeVisible()
    await expect(page.locator('main input').first()).toBeVisible()
    await page.reload()
    await expect(page.locator('main h1').first()).toBeVisible()
  }
  expect(errors).toEqual([])
})

for (const [slug, route, heading] of [
  ['tapreco-globe', 'tools/tax-planner', 'Tax Planner'],
  ['tapreco-tax-intelligence', 'tools/tax-planner', 'Tax Planner'],
  ['tapreco-platform', 'tools/tax-planner', 'Tax Planner'],
]) {
  test(`${slug}: existing tool placeholder deep links survive refresh`, async ({ page }) => {
    await page.goto(`/${slug}/${route}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    await page.locator('#showcase-back-link').click()
    await expect(page).toHaveURL('/')
  })
}

test('existing placeholder forms retain their behavior under application prefixes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/tapreco-globe/contact')
  await page.getByLabel('Name', { exact: true }).fill('Showcase Reviewer')
  await page.getByLabel('Email', { exact: true }).fill('reviewer@example.com')
  await page.getByLabel('Message', { exact: true }).fill('Local integration verification')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Thanks! This is a placeholder form.', { exact: false })).toBeVisible()
  await page.goto('/tapreco-tax-intelligence/sign-in')
  await page.getByLabel('Work email').fill('reviewer@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Local-test-only-123')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('No credentials were sent')
  await page.goto('/tapreco-platform/login')
  await page.getByLabel('Work email').fill('reviewer@example.com')
  await page.getByLabel('Password', { exact: true }).fill('Local-test-only-123')
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Authentication is not connected')
})
