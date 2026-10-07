import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { server } from '../scripts/preview.mjs'
import { apps } from '../scripts/apps.mjs'

let origin
before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${server.address().port}`
})
after(() => new Promise(resolve => server.close(resolve)))

test('dashboard contains all four real application links', async () => {
  const response = await fetch(origin)
  assert.equal(response.status, 200)
  const html = await response.text()
  for (const app of apps) assert.ok(html.includes(`href="/${app.slug}/"`))
  assert.equal((html.match(/class="tool-card"/g) || []).length, 4)
})
for (const app of apps) {
  test(`${app.folder}: entry paths, deep links, and assets serve the correct bundle`, async () => {
    const html = await readFile(new URL(`../dist/${app.slug}/index.html`, import.meta.url), 'utf8')
    for (const route of [`/${app.slug}`, `/${app.slug}/`, `/${app.slug}/tools/tax-planner?from=showcase`]) {
      const response = await fetch(origin + route)
      assert.equal(response.status, 200)
      assert.equal(await response.text(), html)
    }
    assert.ok(html.includes('id="showcase-back-link" href="/"'))
    for (const match of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)) {
      const url = match[1]
      if (url === '/') continue
      const response = await fetch(origin + url)
      assert.equal(response.status, 200, url)
      if (/\.(js|css)$/.test(url)) assert.ok(!response.headers.get('content-type').includes('text/html'), url)
    }
  })
}
test('unknown top-level paths are not rewritten into the dashboard', async () => {
  assert.equal((await fetch(origin + '/unknown-app')).status, 404)
})
