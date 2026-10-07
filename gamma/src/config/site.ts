/** Brand + contact details. Edit here; every page reads from this file. */
export const site = {
  name: 'Tapreco',
  tagline: 'Smarter tax decisions, powered by Tapreco.',
  description:
    'Tapreco brings advanced tax planning, analysis, and advisory tools into one intelligent platform built for modern tax professionals.',
  email: {
    sales: 'sales@tapreco.com',
    support: 'support@tapreco.com',
    privacy: 'privacy@tapreco.com',
  },
  /** Social profiles — icons render in the footer only when a URL is set. */
  social: {
    linkedin: '',
    x: '',
  },
  /** Supported federal tax years — drives selectors and marketing copy. */
  taxYears: [2025, 2026] as const,
} as const
