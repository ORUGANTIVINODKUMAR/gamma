import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { extname, resolve, sep } from 'node:path'
import { apps } from './apps.mjs'

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)))
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' }
export const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    let file = resolve(root, `.${pathname}`)
    if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403); response.end(); return }
    let exists = await stat(file).catch(() => null)
    if (exists?.isDirectory()) { file = resolve(file, 'index.html'); exists = await stat(file).catch(() => null) }
    if (!exists?.isFile()) {
      const app = apps.find(app => pathname === `/${app.slug}` || pathname.startsWith(`/${app.slug}/`))
      if (!app) { response.writeHead(404); response.end('Not found'); return }
      file = resolve(root, app.slug, 'index.html')
    }
    const body = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    response.end(request.method === 'HEAD' ? undefined : body)
  } catch {
    response.writeHead(500); response.end('Unable to serve build. Run npm run build first.')
  }
})
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173)
  server.listen(port, '127.0.0.1', () => console.log(`Showcase preview: http://127.0.0.1:${port}`))
}
