# Tapreco Project Showcase

One public dashboard for the four existing Tapreco projects. The dashboard is light, responsive and uses four cards. Each website opens in the same tab on the same domain and includes **Back to All Tools**.

See [PROJECT-AUDIT.md](PROJECT-AUDIT.md) for the original frameworks, routes, backend capabilities and exact integration scope.

## Build and verify locally

Use Node.js **24.19.0** (also recorded in `.node-version`). Run these commands from this repository root:

```sh
npm install
npm run build
npm run test:http
npm test
npm run preview
```

`npm install` installs the root browser-test dependencies and automatically installs all four apps using their existing lockfiles. Subsequent clean installations can use `npm ci`. Root production output is `dist/`. Preview runs at `http://127.0.0.1:4173`, with the same per-app fallback behavior configured for Render. This preview server is for local verification; Render serves the static output without a start command.

Browser tests need Chromium. If it is not installed, run `npx playwright install chromium`. An existing browser can be selected with `TAPRECO_CHROMIUM_PATH`. The tests check the dashboard at desktop/tablet/mobile widths, accessibility, all four links, page loading, internal routes, refresh, browser history, return navigation and the existing workspace demo/calculators. Screenshots and failure traces go into ignored `test-results/`.

Verification includes 6 HTTP routing checks and 13 production browser checks. The latter exercise the five calculator pages, a changed tax projection, persisted input drafts, a saved report, and the existing placeholder form confirmations. This verifies integration behavior; it does not certify the underlying tax calculations or provision a backend.

You can still develop any original project independently using `cd gamma` (or another folder), then `npm run dev`. Its original build and preview commands remain available.

## Deploy to Render

The supplied folder was not a Git repository. Put the complete root project into a GitHub or GitLab repository, including all four source folders, the five package lockfiles, scripts, showcase files and `render.yaml`. Do not upload `node_modules`, build output, npm caches or `.env` files. If initializing this folder yourself, run `git init`, add the source files, commit, add your repository remote and push your chosen branch.

### Option A: Blueprint (recommended)

1. Sign in to Render and connect your Git provider.
2. Select **New → Blueprint** and select this repository and deployment branch.
3. Use the root `render.yaml`. Review the one static-site resource named `tapreco-project-showcase` and create it.
4. Wait for installation and all four builds to succeed. Open the service's assigned public URL.
5. Check each card, one nested route and **Back to All Tools**. Send the dashboard URL to your manager.

### Option B: Manual Static Site

Create **New → Static Site**, select the repository and set:

| Setting | Value |
| --- | --- |
| Root Directory | Leave blank (repository root) |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Start Command | None — this is a Static Site |
| `NODE_VERSION` | `24.19.0` |
| `SKIP_INSTALL_DEPS` | `true` (the build command performs installation) |

Add these rules under **Redirects/Rewrites**, all with action **Rewrite**, in the listed order:

| Source | Destination |
| --- | --- |
| `/tapreco-workspace` | `/tapreco-workspace/index.html` |
| `/tapreco-workspace/*` | `/tapreco-workspace/index.html` |
| `/tapreco-globe` | `/tapreco-globe/index.html` |
| `/tapreco-globe/*` | `/tapreco-globe/index.html` |
| `/tapreco-tax-intelligence` | `/tapreco-tax-intelligence/index.html` |
| `/tapreco-tax-intelligence/*` | `/tapreco-tax-intelligence/index.html` |
| `/tapreco-platform` | `/tapreco-platform/index.html` |
| `/tapreco-platform/*` | `/tapreco-platform/index.html` |

Do not replace these with one `/* → /index.html` rule: each app needs its own entry HTML. Render serves existing static files before applying rewrites. Its static hosting provides an assigned `onrender.com` URL and managed HTTPS. Static sites are free to deploy, subject to the workspace's bandwidth/build allowances. See [Render Static Sites](https://render.com/docs/static-sites), [rewrite behavior](https://render.com/docs/redirects-rewrites) and [Blueprint fields](https://render.com/docs/blueprint-spec).

## Environment variables and API URLs

No application environment variables are required for this manager showcase. Leave `VITE_API_BASE_URL` unset to preserve the existing **gamma demo mode**; use the already provided **Use demo account** button on its sign-in page. All demo data is stored in the viewer's browser.

If an actual Tapreco backend exists outside this repository, set `VITE_API_BASE_URL` in the Render Static Site's environment to its real HTTPS API base URL and redeploy. Do not use a localhost URL, the showcase application prefix, or a guessed production hostname. The API must support the existing endpoint contracts in `gamma/README.md`, credentialed CORS for the showcase's exact origin, and suitable cross-site cookie settings if cookies are used. No backend is created by this showcase deployment; workspace data remains browser-local. The other three sites retain their existing placeholder account/tool behavior.

Vite variables are embedded into public JavaScript at build time. Never put API secrets, passwords, JWT signing keys or database credentials into a `VITE_*` variable or committed `.env`. Existing demo credentials shipped with `gamma` are unchanged and are not production authentication secrets.

## Example public URLs

Replace `my-project` with the hostname Render assigns:

- Dashboard: `https://my-project.onrender.com/`
- Tapreco workspace (`gamma`): `https://my-project.onrender.com/tapreco-workspace/`
- Tapreco Professional Tax Technology (`gamma1`): `https://my-project.onrender.com/tapreco-globe/`
- Tapreco Professional Tax Intelligence (`gamma2`): `https://my-project.onrender.com/tapreco-tax-intelligence/`
- Tapreco platform website (`gamma3`): `https://my-project.onrender.com/tapreco-platform/`

Example nested routes: `/tapreco-workspace/app/tools/tax-planner` (requires existing sign-in), `/tapreco-globe/tools/tax-planner`, `/tapreco-tax-intelligence/tools/tax-planner`, `/tapreco-platform/tools/tax-planner`.

## Files added and modified

Added: root `package.json`, `package-lock.json`, `.gitignore`, `.node-version`, `render.yaml`, `README.md`, `PROJECT-AUDIT.md`, `playwright.config.mjs`; `scripts/{apps,run,install-apps,build,preview}.mjs`; `showcase/{index.html,showcase.css,showcase-nav.css,showcase-favicon.svg}`; `tests/{routing.test,showcase.spec}.mjs`.

Original source modifications: `gamma/src/main.tsx`, `gamma1/src/App.tsx`, `gamma2/src/main.tsx`, `gamma3/src/main.tsx`, and `gamma/src/components/marketing/ToolGallery.tsx`. The first four set router basenames; the last makes an existing internal link respect that basename. Calculators, forms, APIs, authentication and original design styles are preserved.
