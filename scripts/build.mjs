import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { apps } from './apps.mjs'
import { npm } from './run.mjs'

const output = new URL('../dist/', import.meta.url)
// This fixed output path is the only directory this script removes.
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
await cp(new URL('../showcase/', import.meta.url), output, { recursive: true })

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const cards = apps.map((app, index) => `
  <article class="tool-card" aria-labelledby="tool-${index}">
    <div class="card-top"><span class="number">0${index + 1}</span><span class="card-label">${escape(app.variant)}</span></div>
    <h2 id="tool-${index}">${escape(app.name)}</h2>
    <p>${escape(app.description)}</p>
    <a class="open-button" href="/${app.slug}/" aria-label="Open Website: ${escape(app.name)} — ${escape(app.variant)}">Open Website <span aria-hidden="true">&rarr;</span></a>
  </article>`).join('\n')
const dashboard = await readFile(new URL('index.html', output), 'utf8')
await writeFile(new URL('index.html', output), dashboard.replace('<!-- APPLICATION_CARDS -->', cards))

for (const app of apps) {
  const folder = new URL(`../${app.folder}/`, import.meta.url)
  console.log(`\nBuilding ${app.folder} at /${app.slug}/`)
  npm(['run', 'build', '--', '--base', `/${app.slug}/`], fileURLToPath(folder))
  const destination = new URL(`${app.slug}/`, output)
  await cp(new URL('dist/', folder), destination, { recursive: true })
  // Inject navigation into the assembled copy, keeping original UI source intact.
  const html = await readFile(new URL('index.html', destination), 'utf8')
  await writeFile(new URL('index.html', destination), html
    .replace('</head>', '<link rel="stylesheet" href="/showcase-nav.css" /></head>')
    .replace('</body>', '<a id="showcase-back-link" href="/">&larr; Back to All Tools</a></body>'))
}
console.log('\nShowcase ready in dist/ (four independent application bundles).')
