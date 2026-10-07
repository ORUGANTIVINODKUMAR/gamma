/**
 * Single place that maps landing-page links to application routes.
 * When Tapreco's real authentication and tool routes are connected, edit only this file.
 */
export const ROUTES = {
  tools: '/tools',
  process: '/process',
  why: '/why-tapreco',
  contact: '/contact',
  signIn: '/signin',
  signUp: '/signup',
  tool: (id: string) => `/tools/${id}`,
  info: (slug: string) => `/p/${slug}`,
}
