import { lazy } from 'react'

/* Route-level code splitting. Each loader is also exposed for prefetching. */
export const loaders = {
  home: () => import('./pages/HomePage'),
  platform: () => import('./pages/PlatformPage'),
  tools: () => import('./pages/ToolsPage'),
  solutions: () => import('./pages/SolutionsPage'),
  about: () => import('./pages/AboutPage'),
  contact: () => import('./pages/ContactPage'),
  legal: () => import('./pages/LegalPage'),
  notFound: () => import('./pages/NotFoundPage'),
  login: () => import('./pages/LoginPage'),
  signup: () => import('./pages/SignupPage'),
  forgot: () => import('./pages/ForgotPasswordPage'),
  dashboard: () => import('./pages/app/DashboardPage'),
  clients: () => import('./pages/app/ClientsPage'),
  reports: () => import('./pages/app/ReportsPage'),
  profile: () => import('./pages/app/ProfilePage'),
  settings: () => import('./pages/app/SettingsPage'),
  toolsHub: () => import('./pages/app/ToolsHubPage'),
  appNotFound: () => import('./pages/app/AppNotFoundPage'),
  mutualFund: () => import('./pages/app/tools/MutualFundPage'),
  estimatedTax: () => import('./pages/app/tools/EstimatedTaxPage'),
  auditRisk: () => import('./pages/app/tools/AuditRiskPage'),
  entityComparison: () => import('./pages/app/tools/EntityComparisonPage'),
  taxPlanner: () => import('./pages/app/tools/TaxPlannerPage'),
}

export const Pages = {
  Home: lazy(loaders.home),
  Platform: lazy(loaders.platform),
  Tools: lazy(loaders.tools),
  Solutions: lazy(loaders.solutions),
  About: lazy(loaders.about),
  Contact: lazy(loaders.contact),
  Privacy: lazy(() => loaders.legal().then((m) => ({ default: m.PrivacyPage }))),
  Terms: lazy(() => loaders.legal().then((m) => ({ default: m.TermsPage }))),
  NotFound: lazy(loaders.notFound),
  Login: lazy(loaders.login),
  Signup: lazy(loaders.signup),
  Forgot: lazy(loaders.forgot),
  Dashboard: lazy(loaders.dashboard),
  Clients: lazy(loaders.clients),
  Reports: lazy(loaders.reports),
  Profile: lazy(loaders.profile),
  Settings: lazy(loaders.settings),
  ToolsHub: lazy(loaders.toolsHub),
  AppNotFound: lazy(loaders.appNotFound),
  MutualFund: lazy(loaders.mutualFund),
  EstimatedTax: lazy(loaders.estimatedTax),
  AuditRisk: lazy(loaders.auditRisk),
  EntityComparison: lazy(loaders.entityComparison),
  TaxPlanner: lazy(loaders.taxPlanner),
}

/** Warm likely-next chunks when the browser is idle. */
export function prefetchWhenIdle(keys: (keyof typeof loaders)[]): () => void {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return () => undefined
  const run = () => keys.forEach((k) => void loaders[k]().catch(() => undefined))
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(run, { timeout: 4000 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(run, 2500)
  return () => clearTimeout(id)
}
