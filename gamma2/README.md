# Tapreco

A light, professional tax technology frontend built with React, TypeScript, Vite, React Three Fiber, Drei, Three.js, Framer Motion, and Lucide. The supplied workspace was empty; no backend, authentication implementation, or working tax tools were present.

## Run locally

Requires Node.js 22.12+ (tested with Node.js 24).

```sh
npm ci
npm run dev
```

The local site runs at `http://127.0.0.1:5173`. To create and serve the production bundle:

```sh
npm run build
npm run preview
```

## Verify

```sh
npm run lint
npx playwright install chromium
npm test
```

Browser checks cover the eight requested viewport widths, all five tool destinations, desktop navigation, CTA links, mobile navigation, form validation, password visibility, keyboard access, reduced motion, legal placeholders, direct URLs, unknown routes, and runtime console errors/warnings. Additional checks cover bounded spring-smoothed card tilt, motion-enabled route/hash navigation, and pausing 3D rendering offscreen and on visibility changes. The test configuration can use an existing Chromium binary through `TAPRECO_CHROMIUM_PATH`. It also supports the existing Windows Playwright browser cache on this workspace. Software WebGL rendering is enabled for automated checks; it is not a benchmark of hardware GPU performance.

Set `TAPRECO_TEST_PRODUCTION=1` before running `npm test` to check the built site on port 4173. The suite also checks WCAG accessibility using axe and confirms that account routes do not load the 3D engine.

## Structure

- `src/components/`: reusable navigation, landing sections, cards, typography, account and integration pages.
- `src/animations/motion.ts`: shared easing, reveal timing, and spring settings.
- `src/hooks/`: spring-smoothed mouse interaction, scene visibility, and section-relative scroll progress.
- `src/three/`: the lazy WebGL renderer, independently animated document layers, scene layouts, textures, and materials.
- `src/data/tools.ts`: tool descriptions, feature points, icons, and route definitions.
- `src/styles/`: separate design tokens, global controls, landing layouts, and account/integration page styles. `src/styles.css` is the stylesheet entry point.
- `tests/landing.spec.ts`: browser regression checks.

## Integration routes

| Destination | Route |
| --- | --- |
| Landing | `/` |
| Tax Planner | `/tools/tax-planner` |
| Mutual Fund Tax Calculator | `/tools/mutual-fund-tax-calculator` |
| Estimated Tax Calculator | `/tools/estimated-tax-calculator` |
| Audit Risk Analyzer | `/tools/audit-risk-analyzer` |
| Entity Comparison | `/tools/entity-comparison` |
| Sign in | `/sign-in` |
| Get started | `/get-started` |
| Legal | `/legal/privacy`, `/legal/terms`, `/legal/security` |

Tool routes are clearly labeled integration placeholders, not tax calculation implementations. Replace their route elements with the real tool components when available, and update `toolPath` if existing tool paths differ. Account forms validate input and show an explicit unconnected-service message. They do not submit, persist, or log credentials and do not create a session or account. Connect these pages to the existing authentication provider when its implementation is supplied. Legal pages explicitly await approved policy content.

Configure the production host to serve `index.html` for frontend routes so direct tool and account URLs work. Keep API routing separate from this SPA fallback.

## 3D and accessibility

The three scenes use generated document textures, rounded glass slabs, studio lighting, and baked contact shadows; no remote models, images, fonts, or HDR files are required. The scene module loads lazily. IntersectionObserver pauses rendering outside the viewport, and the Page Visibility API pauses it in inactive tabs. Reduced motion renders static compositions on demand. On mobile, mouse tracking is removed and pixel ratio, antialiasing, and shadow resolution are reduced. PerformanceMonitor lowers pixel ratio further when necessary. Text and navigation remain available during loading and WebGL failure.

The canvas is decorative and has an accessible description. All navigation and tool information are semantic HTML outside the scene. Controls support keyboard focus, a skip link, Escape to close mobile navigation, labeled form inputs, and visible focus states.

## Motion system

The hero enters in sequence: navigation, eyebrow, individually masked headline lines, supporting copy, staggered buttons, and the scene. Headings and cards share a controlled easing curve. Card tilt uses spring-smoothed motion values rather than pointer-driven CSS transitions. Page navigation uses `AnimatePresence` for coordinated exit and entrance; same-page anchors keep the current page mounted.

Each 3D panel has a distinct float phase and a section-relative scroll trajectory. Planner and platform layers spread and gather as their section passes through the viewport, while the hero recedes slightly. Motion values are read inside the Three.js frame loop without rendering React for every scroll frame. The CTA has a separate restrained depth/parallax treatment. Native scrolling remains intact; no scroll hijacking or additional animation dependency was introduced.

Rendering follows the official [React Three Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance). Hardware frame rates vary by GPU and device and have not been certified at 60 FPS.

Three.js and its types are pinned to r182 because the installed React Three Fiber v9 still uses `THREE.Clock`; [Three.js deprecated it in r183](https://threejs.org/docs/pages/Clock.html). This avoids runtime deprecation warnings without suppressing the console or modifying dependency source.
