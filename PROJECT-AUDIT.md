# Repository audit and integration scope

Audited before implementation on 7 October 2026. The root contained four sibling projects (`gamma`, `gamma1`, `gamma2`, `gamma3`) and no root application, Git repository, or AGENTS.md. All four are branded **Tapreco**, rather than four differently named products. Dashboard subtitles distinguish their existing designs and capabilities.

## Applications

| Folder | Real identity | Framework and supporting libraries | Entry points | Existing commands | Showcase prefix |
| --- | --- | --- | --- | --- | --- |
| `gamma` | Tapreco — Tax Technology for Modern Tax Professionals | React 19, TypeScript 6, Vite 8, React Router 7, Tailwind 4, Framer Motion, Lenis, React Three Fiber / Drei / Three.js | `index.html` → `src/main.tsx` → `src/App.tsx`; lazy pages in `src/routes.ts` | `npm run dev`; `npm run build` = `tsc -b && vite build`; `npm run preview`; typecheck and lint scripts | `/tapreco-workspace/` |
| `gamma1` | Tapreco — Professional Tax Technology | React 19, TypeScript 6, Vite 8, React Router 7, Framer Motion, Lenis, React Three Fiber / Drei / Three.js | `index.html` → `src/main.tsx` → `src/App.tsx` | `npm run dev`; `npm run build` = `tsc -b && vite build`; `npm run preview`; oxlint | `/tapreco-globe/` |
| `gamma2` | Tapreco — Professional Tax Intelligence | React 19, TypeScript 6, Vite 8, React Router 7, Framer Motion, React Three Fiber / Drei / Three.js | `index.html` → `src/main.tsx` → `src/App.tsx` | `npm run dev`; `npm run build` = `tsc -b && vite build`; `npm run preview`; ESLint; Playwright | `/tapreco-tax-intelligence/` |
| `gamma3` | Tapreco — Professional Tax Intelligence | React 19, TypeScript 7, Vite 8, React Router 7, Lucide; CSS scenes rather than WebGL | `index.html` → `src/main.tsx` → `src/App.tsx` | `npm run dev`; `npm run build` = `tsc --noEmit && vite build`; `npm run preview` | `/tapreco-platform/` |

Each folder has its own `package.json`, `package-lock.json`, `vite.config.ts`, TypeScript configuration, `public/`, `src/`, and pre-existing `dist/` and `node_modules/` output. `gamma2` also contains its existing browser test suite and npm cache. Caches, dependency folders and old build output are excluded from deployment source by the root `.gitignore`.

## Existing routes (relative to each application)

- **gamma:** `/`, `/platform`, `/tools`, `/solutions`, `/about`, `/contact`, `/privacy`, `/terms`; `/login`, `/signup`, `/forgot-password`; `/dashboard` redirects to `/app`. Authenticated routes: `/app`, `/app/clients`, `/app/reports`, `/app/profile`, `/app/settings`, `/app/tools`, and `/app/tools/{mutual-fund,estimated-tax,audit-risk,entity-comparison,tax-planner}`. Unknown routes retain their existing not-found/redirect behavior. Saved analysis and client IDs use query parameters.
- **gamma1:** `/`, `/tools`, `/process`, `/why-tapreco`, `/contact`, `/signin`, `/signup`, `/tools/:id`, `/p/:slug`; unknown routes redirect to the app home. Its tool registry includes six tool destinations, including Roth Strategy Analyzer. Tool and account pages are existing placeholders; the contact form only displays a placeholder confirmation.
- **gamma2:** `/`, `/tools/:slug`, `/sign-in`, `/get-started`, `/legal/:topic`; unknown routes show its not-found page. Five tool pages are existing integration placeholders. Account forms validate input and explain that authentication is unconnected.
- **gamma3:** `/`, `/platform`, `/tools`, `/solutions`, `/about`, `/login`, `/signup`, `/tools/:slug`, `/p/:slug`; unknown routes redirect to the app home. Five tool pages and account forms are existing placeholders.

## Backend, environment and assets

There is no backend server, database, serverless API implementation or backend package in these projects. **gamma** implements five calculators locally in `src/lib/tax/`, and browser-local accounts, sessions, client data, drafts, saved reports and settings. `VITE_API_BASE_URL` is its only application environment variable; unset means demo mode. Setting it switches authentication, password/profile operations and contact submission to existing HTTP adapters. Workspace persistence remains browser-local even when an API is configured. Endpoint contracts are documented in `gamma/README.md` and `gamma/src/services/auth.ts`.

`gamma1`, `gamma2`, `gamma3` do not make backend calls or require application environment variables. Existing Google Fonts requests in `gamma1` and `gamma3` remain as supplied; `gamma` and `gamma2` have local fonts. Favicons and `gamma3/public/hero-bg.svg` are local public assets. The CLI `--base` option lets Vite prefix bundled JS, CSS, fonts, favicon and CSS asset URLs without editing any Vite configuration.

Existing `gamma/vercel.json` and `gamma/public/_redirects` target standalone hosting providers and do not configure Render. Render needs its own per-application rules, supplied in the new root `render.yaml`. `gamma2` test environment variables (`TAPRECO_TEST_PRODUCTION`, `TAPRECO_CHROMIUM_PATH`) control local tests, not application behavior.

## Chosen architecture

One Render **Static Site**, with a plain HTML/CSS dashboard at `/` and four independent production bundles underneath separate prefixes. This avoids a paid Node server and keeps incompatible dependency versions and existing CSS isolated. Each child retains its original lockfile and build command. The root installer runs `npm ci` for each child; the root build passes the correct Vite base path and copies the output into `dist/<prefix>/`.

React Router uses `import.meta.env.BASE_URL` so links, redirects, authentication return URLs and nested routes remain inside the correct app. Render rewrites each app's routes to its own HTML file. Assets continue to be served as real files. There is no broad dashboard fallback that would mask unknown application names.

The build adds a scoped, fixed bottom-left **Back to All Tools** link only to each assembled HTML copy. Original layouts are preserved, and the link is hidden when printing. Standalone `npm run dev` inside each original folder still uses `/` as its base and does not include the showcase link.

## Original source files modified

Only five original source files were modified:

1. `gamma/src/main.tsx`: router basename.
2. `gamma1/src/App.tsx`: router basename.
3. `gamma2/src/main.tsx`: router basename.
4. `gamma3/src/main.tsx`: router basename.
5. `gamma/src/components/marketing/ToolGallery.tsx`: internal anchor becomes a React Router Link, so its href includes the app prefix, including when opening in a new tab.

No calculator, form, authentication service, API adapter, storage implementation, app stylesheet, original package manifest, lockfile, or Vite configuration was rewritten. Generated child `dist/` and TypeScript build metadata are refreshed by their original build commands.
