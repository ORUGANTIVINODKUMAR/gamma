# Tapreco — Web App

A light, spatial frontend for **Tapreco**, the tax technology platform for CPAs, EAs and tax advisors. Five tools — Mutual Fund Tax Calculator, Estimated Tax Calculator, Audit Risk Analyzer, Entity Comparison Tool and Tax Planner — share one federal tax engine, one client workspace and one report format.

The interface is built from real 3D objects (tax forms, folders, a shield, business structures) rather than charts and card grids: the homepage is a scroll-driven 3D story, the Tax Tools page is a 3D gallery, the dashboard is a virtual tax desk, and each tool has its own object.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Sign in with the demo account (or create your own on **Enter Platform**):

| Email | Password |
|---|---|
| `demo@tapreco.com` | `Tapreco2026!` |

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint (React, hooks, jsx-a11y rules — see `.oxlintrc.json`) |

## Stack

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS 4 · React Router 7 · Framer Motion · Lenis (smooth scroll) · three.js 0.182 + React Three Fiber + Drei · lucide-react · self-hosted Inter, Manrope and Instrument Serif.

> three.js is pinned to `0.182.x`: r183 deprecated `THREE.Clock`, which React Three Fiber 9 still constructs, producing a console warning on every canvas. Lift the pin once R3F moves to `THREE.Timer`.

## Project structure

```
src/
  App.tsx, routes.ts        Router, shell cross-fades, lazy routes + idle prefetch
  styles/index.css          Design tokens (@theme), type scale, surfaces, print + reduced-motion CSS
  config/                   tools registry, nav, site details, tax deadlines
  context/                  AuthProvider (session), PreferencesProvider (motion, defaults)
  services/                 api client, auth (demo + HTTP adapters), workspace store, seed data
  lib/
    tax/                    Federal engine + one module per tool (pure, framework-free) — untouched by the redesign
    three/                  3D foundation: quality tiers, input store, palette, procedural textures,
                            shared materials, geometry cache (all disposed together, after a grace period)
  hooks/                    useStory (scroll → scene index), media queries, viewport helpers
  components/
    ui/                     Button (depth + magnetic), fields, Modal, Menu, Tooltip, Toast, Reveal…
    motion/                 Magnetic pointer response
    layout/                 Navbar (floating capsule), Sidebar, Topbar, route transitions, layouts
    marketing/              JourneyStory (homepage), ToolGallery, Platform + Workspace sections, CTA
    tools/                  ToolShell (3D header), ledger.tsx (typographic results), shared inputs
    three/
      core/                 SceneCanvas (tiers, adaptive DPR, offscreen pause), SceneBoundary (lazy + fallbacks)
      lighting/             StudioLighting (procedural soft-box environment) + ground shadows
      camera/               CursorParallax
      models/               Document, DocumentStack, Folder, Calculator, CoinStack, Shield, FinancialBlocks,
                            EntityStructure, QuarterDocs, DocumentScanner, DataVault, TaxLogo3D, Plinth…
      tools/                One 3D identity per tool + registry (the Planner object is self-contained)
      scenes/               Journey, Gallery, Auth, Desk, ToolStage, ReportShelf, ClientFolder, PlatformStack, NotFound
  pages/                    Marketing, auth and app pages (app/ and app/tools/)
```

## Routes

| Path | Page | Access |
|---|---|---|
| `/` `/platform` `/tools` `/solutions` `/about` `/contact` `/privacy` `/terms` | Marketing | Public |
| `/login` `/signup` `/forgot-password` | Auth (redirects to the app when signed in) | Public |
| `/app` | Dashboard — the 3D desk | Signed in |
| `/app/tools` | Tax Tool Gallery | Signed in |
| `/app/tools/mutual-fund` · `estimated-tax` · `audit-risk` · `entity-comparison` · `tax-planner` | Tools | Signed in |
| `/app/clients` · `/app/reports` · `/app/profile` · `/app/settings` | Workspace | Signed in |
| `/dashboard` | Redirects to `/app` | — |

Visiting any `/app/*` route signed out redirects to `/login` and returns to the requested page after sign-in. Saved analyses reopen with `?analysis=<id>`; clients deep-link with `/app/clients?client=<id>`.

## Design system

- **Palette** — warm ivory page `#f7f6f2`, pearl-white surfaces, slate ink (≥ 4.5:1), silver neutrals and one sapphire accent `#2563eb`. No gold and no dark theme. Tokens live in `src/styles/index.css` (`@theme`); the 3D palette mirrors them in `src/lib/three/palette.ts`.
- **Type** — Instrument Serif for editorial display and large numerals (`t-display`, `t-h1`, `t-h2`, `t-numeral`), Manrope for UI headings, Inter for body. One scale, defined once as utilities.
- **Materials** (`lib/three/materials.ts`) — pearl ceramic, matte ceramic, brushed silver, sapphire enamel, ink glass, frosted glass and clear acrylic. Each is a single shared instance.
- **Lighting** — a procedural soft-box environment (no HDR download) plus a key and a cool rim light; contact shadows on high quality, blob shadows on low.
- **Motion** — short, damped, no bounce. Route changes are a soft depth shift; buttons have lit-edge depth, a tiny lift and a press-in.
- **Meaning** — every 3D object stands for something: documents for tax information, folders for clients and reports, the shield for audit protection, two structures for entity comparison, four sheets for quarters.

Results are presented as typography and structure (ledgers, ranked lists, payment slips, a bracket ladder, side-by-side structures) — the product contains no pie, donut, gauge, bar or line charts.

## 3D architecture

- **One scene, one story.** The homepage keeps a single sticky canvas. `useStory` turns scroll into a continuous scene index (0 → 7) held in a ref; `JourneyScene` derives camera, object poses and per-tool animation from it, so scrolling never re-renders React.
- **Drivers, not state.** Animated models take a `Driver` (a number or a `{ current }` box) and damp toward it inside `useFrame`.
- **Data in, not baked in.** Tool objects accept live inputs (quarterly lift, tax slabs, audit-layer emphasis) via `ToolShell`'s `stageData`; nothing important is hardcoded in a 3D component.
- **Lazy by default.** Scenes are `lazy()` imports behind `SceneBoundary`: no WebGL → static poster, three.js never downloads; a scene that throws → poster; chunk loading → quiet placeholder.

## Performance & accessibility

- **Quality tiers** (`lib/three/quality.ts`) — `high` (desktop), `low` (phones, tablets, constrained devices), `none` (no WebGL). Low drops contact shadows and the hero's extra objects, caps DPR and simplifies camera motion. A live `PerformanceMonitor` steps DPR and shadows down further if frames drop.
- **Frame budget** — canvases render only while on screen, pause while a field is being typed in, and use instancing (coins, calculator keys), shared geometry and shared materials. Shared GPU resources are freed once the last canvas unmounts.
- **Reduced motion** — OS setting or Settings override: render on demand, no ambient motion, no parallax, no smooth scroll.
- **Accessibility** — every canvas is `role="img"` with a description (or hidden when interactive); the Tax Tool Gallery has a keyboard-operable tool rail (arrow keys, Esc) that drives the same state; skip link, visible focus, labelled controls, ARIA live regions, print stylesheet for reports.

## Authentication — sign in once

Sessions persist in `localStorage` for 30 days with **Keep me signed in** (otherwise `sessionStorage`, 12 hours), sync across tabs, and are validated in the background on load. Any `401` from the API signs the user out everywhere.

### Connecting the backend

Set the API base URL (see `.env.example`):

```bash
VITE_API_BASE_URL=https://api.tapreco.com/v1
```

Without it the app runs in **demo mode**: accounts live in this browser (salted SHA-256) so the product is fully explorable. With it, `src/services/auth.ts` switches to the HTTP adapter, which expects:

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| POST | `/auth/signup` | `{ name, email, password, firm, role }` | `{ token, user }` |
| GET | `/auth/me` | — | `{ user }` |
| POST | `/auth/logout` | — | — |
| PATCH | `/users/me` | `{ name?, firm?, role?, title?, phone? }` | `{ user }` |
| POST | `/auth/password` | `{ currentPassword, newPassword }` | — |
| POST | `/auth/forgot-password` | `{ email }` | — |
| POST | `/contact` | contact form fields | — |

`user` = `{ id, name, email, firm, role, title?, phone?, createdAt }`. Requests send `Authorization: Bearer <token>`; errors may return `{ message }`, which is shown to the user.

## Tax engine

`src/lib/tax/engine.ts` implements the Form 1040 flow once (brackets, the qualified-dividend/capital-gain worksheet, standard/65+/OBBBA senior deductions, itemized deductions with the OBBBA SALT cap and phase-down, §199A with the W-2 wage limit and SSTB phase-in, SE tax, Additional Medicare Tax, NIIT, CTC/ODC/ACTC, taxable Social Security). Every tool calls it, so results agree across tools.

All parameters for **TY2025** (Rev. Proc. 2024-40 as amended by P.L. 119-21) and **TY2026** (Rev. Proc. 2025-32) live in `src/lib/tax/years.ts` — review them there; add a year by adding an entry. Each tool lists its simplifications in an **Assumptions & limitations** panel. Not modeled: AMT, state income tax, 25%/28% capital-gain classes, the Form 1116 limitation, tips/overtime deductions, the 2026 itemized-deduction limit for the 37% bracket.

The audit-risk score is an explainable indicator analysis (18 indicators from documented IRS focus areas), **not** the IRS DIF score.

## Backend dependencies (current state)

| Area | Today | Needs from the backend |
|---|---|---|
| Auth | Demo adapter or HTTP adapter (contract above) | The endpoints above |
| Clients, saved analyses, notifications read-state | Stored per user in this browser (`services/workspace.ts`) | REST resources for clients/analyses; swap the store's persistence |
| Contact form | Kept locally + "Send via email" fallback in demo mode | `POST /contact` |
| Password reset | Instant local reset in demo mode | `POST /auth/forgot-password` + email delivery |
| Tax calculations | Client-side (`lib/tax`) | Optional: server-side verification |
