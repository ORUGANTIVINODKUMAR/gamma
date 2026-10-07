import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const toolNames = ['Tax Planner', 'Mutual Fund Tax Calculator', 'Estimated Tax Calculator', 'Audit Risk Analyzer', 'Entity Comparison']

for (const width of [1920, 1440, 1366, 1024, 768, 430, 390, 375]) {
  test(`landing fits ${width}px and keeps its 3D experience`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Smarter tax')
    await expect(page.locator('.scene-hero canvas')).toBeVisible()
    expect(await page.locator('.scene-hero canvas').evaluate(el => (el as HTMLCanvasElement).width)).toBeGreaterThan(100)
    await page.locator('#tools').scrollIntoViewIfNeeded()
    for (const name of toolNames) await expect(page.locator('.tool-card h3').filter({ hasText: name })).toBeVisible()
    await page.locator('.planner-section').scrollIntoViewIfNeeded()
    await expect(page.locator('.scene-workspace canvas')).toBeAttached()
    await page.locator('#platform').scrollIntoViewIfNeeded()
    await expect(page.locator('.scene-platform canvas')).toBeAttached()
    await page.locator('footer').scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    expect(errors).toEqual([])
    if (width === 1440 || width === 390) {
      // Scroll through every section first so viewport reveals appear in the full-page capture.
      for (const selector of ['.hero', '#tools', '.planner-section', '#platform', '#solutions', '#about', '.cta-section', 'footer']) {
        await page.locator(selector).scrollIntoViewIfNeeded()
      }
      await page.screenshot({ path: `test-results/tapreco-${width}.png`, fullPage: true })
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({ path: `test-results/tapreco-hero-${width}.png` })
    }
  })
}

test('all five cards open their defined tool routes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const name of toolNames) {
    await page.goto('/#tools')
    await page.locator('.tool-card').filter({ has: page.getByRole('heading', { name, exact: true }) }).click()
    await expect(page).toHaveURL(/\/tools\//)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
    await expect(page.getByText('FRONTEND PREVIEW', { exact: true })).toBeVisible()
    await page.getByRole('link', { name: 'All tax tools' }).click()
    await expect(page).toHaveURL(/#tools$/)
  }
})

test('desktop navigation and CTAs reach their destinations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const [name, id] of [['Platform', 'platform'], ['Tax Tools', 'tools'], ['Solutions', 'solutions'], ['About', 'about']]) {
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect.poll(() => page.locator(`#${id}`).evaluate(el => Math.round(el.getBoundingClientRect().top))).toBeLessThan(150)
  }
  await page.getByRole('link', { name: 'Sign In', exact: true }).click()
  await expect(page).toHaveURL('/sign-in')
  await page.locator('.nav-cta').click()
  await expect(page).toHaveURL('/get-started')
  await page.goto('/')
  await page.locator('.cta-buttons').getByRole('link', { name: 'Explore Tools', exact: true }).click()
  await expect(page).toHaveURL('/#tools')
})

test('mobile menu closes on navigation and Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Open navigation' })
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0)
  await menu.click()
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Tax Tools' }).click()
  await expect(page).toHaveURL('/#tools')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
})

test('account form validates and explicitly reports unconnected services', async ({ page }) => {
  await page.goto('/get-started')
  await page.getByRole('button', { name: 'Create your workspace' }).click()
  await expect(page).toHaveURL('/get-started')
  await page.getByLabel('Full name').fill('Preview User')
  await page.getByLabel('Work email').fill('preview@example.com')
  await page.getByLabel('Firm name').fill('Preview Firm')
  await page.getByLabel('Password', { exact: true }).fill('preview-only-123')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Hide password' }).click()
  await page.getByRole('button', { name: 'Create your workspace' }).click()
  await expect(page.getByRole('status')).toContainText('No credentials were sent')
  await page.locator('.account-switch').getByRole('link', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Sign in to Tapreco' })).toBeVisible()
})

test('keyboard skip link and reduced motion remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0)
})

test('legal, direct tool links, and unknown routes are safe', async ({ page }) => {
  for (const topic of ['privacy', 'terms', 'security']) {
    await page.goto(`/legal/${topic}`)
    await expect(page.getByText('PENDING PUBLICATION')).toBeVisible()
  }
  await page.goto('/tools/tax-planner')
  await expect(page.getByRole('heading', { name: 'Tax Planner', exact: true })).toBeVisible()
  await page.goto('/tools/unknown')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('back on track')
  await page.goto('/unknown')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('back on track')
})

test('normal motion 3D scene loads without implementation warnings', async ({ page }) => {
  const issues: string[] = []
  page.on('pageerror', error => issues.push(error.message))
  page.on('console', message => { if (message.type() === 'error' || message.type() === 'warning') issues.push(message.text()) })
  await page.goto('/')
  await expect(page.locator('.scene-hero canvas')).toBeVisible()
  await page.mouse.move(1100, 350)
  await page.locator('.planner-section').scrollIntoViewIfNeeded()
  await expect(page.locator('.scene-workspace canvas')).toBeVisible()
  await page.locator('#platform').scrollIntoViewIfNeeded()
  await expect(page.locator('.scene-platform canvas')).toBeVisible()
  expect(issues).toEqual([])
})

test('landing and account pages pass WCAG accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const route of ['/', '/get-started', '/sign-in', '/tools/tax-planner']) {
    await page.goto(route)
    if (route === '/') {
      for (const selector of ['#tools', '.planner-section', '#platform', '#solutions', '#about', '.cta-section', 'footer']) {
        await page.locator(selector).scrollIntoViewIfNeeded()
      }
    }
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([])
  }
})

test('account routes do not load the 3D engine', async ({ page }) => {
  const sceneRequests: string[] = []
  page.on('request', request => { if (/three-(core|renderer|scene)|TaxScene/.test(request.url())) sceneRequests.push(request.url()) })
  await page.goto('/sign-in')
  await expect(page.getByRole('heading', { name: 'Sign in to Tapreco' })).toBeVisible()
  expect(sceneRequests).toEqual([])
})

test('3D rendering pauses offscreen and when the tab becomes inactive', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('.scene-hero')
  await expect(hero).toHaveAttribute('data-render-state', 'animated')
  await page.locator('#platform').scrollIntoViewIfNeeded()
  await expect(hero).toHaveAttribute('data-render-state', 'paused')
  await expect(page.locator('.scene-platform')).toHaveAttribute('data-render-state', 'animated')
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('.scene-platform')).toHaveAttribute('data-render-state', 'paused')
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden')
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('.scene-platform')).toHaveAttribute('data-render-state', 'animated')
})

test('card hover has bounded perspective and settles smoothly', async ({ page }) => {
  await page.goto('/#tools')
  const card = page.locator('.tool-card').nth(1)
  await card.scrollIntoViewIfNeeded()
  const bounds = await card.boundingBox()
  expect(bounds).not.toBeNull()
  await page.mouse.move(bounds!.x + bounds!.width * 0.8, bounds!.y + bounds!.height * 0.35)
  await expect.poll(() => card.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBeLessThan(-4)
  const tilt = await card.evaluate(el => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform)
    return Math.abs(Math.atan2(matrix.m13, matrix.m11) * 180 / Math.PI)
  })
  expect(tilt).toBeLessThan(4)
  await page.mouse.move(5, 5)
  await expect.poll(() => card.evaluate(el => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).m42))).toBeLessThan(0.1)
})

test('motion-enabled page transitions preserve routing and hash navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.hero-line-mask').first()).toBeVisible()
  await page.locator('.nav-cta').click()
  await expect(page).toHaveURL('/get-started')
  await expect(page.getByRole('heading', { name: 'Get started with Tapreco' })).toBeVisible()
  await expect(page.locator('#main-content')).toHaveCount(1)
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Tax Tools', exact: true }).click()
  await expect(page).toHaveURL('/#tools')
  await expect.poll(() => page.locator('#tools').evaluate(el => Math.abs(el.getBoundingClientRect().top - 84))).toBeLessThan(4)
  await page.screenshot({ path: 'test-results/tapreco-tools-animated.png' })
  for (const [selector, name] of [['.planner-section', 'planner'], ['#platform', 'platform']]) {
    await page.locator(selector).scrollIntoViewIfNeeded()
    await expect(page.locator(selector).locator('canvas')).toBeVisible()
    await expect.poll(() => page.locator(selector).locator('.heading-mask > span').evaluate(el => getComputedStyle(el).opacity)).toBe('1')
    // Let the software WebGL driver complete the scene's first rendered frames.
    await page.evaluate(() => new Promise<void>(resolve => {
      let frames = 0
      const next = () => { if (++frames >= 12) resolve(); else requestAnimationFrame(next) }
      requestAnimationFrame(next)
    }))
    await page.screenshot({ path: `test-results/tapreco-${name}.png` })
  }
})
