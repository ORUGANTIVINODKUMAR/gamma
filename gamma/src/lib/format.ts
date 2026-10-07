const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const num0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const pct1 = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 })
const pct0 = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 })

/** $12,345 — whole dollars, the convention for tax projections. */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(value)
  return usd0.format(Object.is(rounded, -0) ? 0 : rounded)
}

/** Signed currency for deltas: +$1,200 / −$450 */
export function formatSignedCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(value)
  if (rounded === 0) return '$0'
  return `${rounded > 0 ? '+' : '−'}${usd0.format(Math.abs(rounded))}`
}

/** $12.9K / $4.2M — compact form for stat tiles and axis ticks. */
export function formatCompactCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const sign = value < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sign}$${trim(abs / 1_000_000)}M`
  if (abs >= 10_000) return `${sign}$${trim(abs / 1_000)}K`
  return `${sign}${usd0.format(Math.round(abs))}`
}

function trim(n: number): string {
  return n >= 100 ? n.toFixed(0) : n.toFixed(1).replace(/\.0$/, '')
}

export function formatNumber(value: number): string {
  return Number.isFinite(value) ? num0.format(value) : '—'
}

export function formatPercent(value: number, digits: 0 | 1 = 1): string {
  if (!Number.isFinite(value)) return '—'
  return digits === 0 ? pct0.format(value) : pct1.format(value)
}

const dateLong = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
const dateShort = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const dateMonthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export function formatDate(date: Date | string, style: 'long' | 'short' | 'monthDay' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return '—'
  return style === 'long' ? dateLong.format(d) : style === 'monthDay' ? dateMonthDay.format(d) : dateShort.format(d)
}

/** "3 hours ago", "2 days ago" */
export function formatRelative(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  const days = Math.floor(diff / 86400)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  return formatDate(d)
}

/** Parse user-typed money ("12,500.50", "$9k") into a number. */
export function parseMoney(raw: string): number {
  const s = raw.trim().toLowerCase().replace(/[$,\s]/g, '')
  if (!s || s === '-' || s === '.') return 0
  const mult = s.endsWith('k') ? 1_000 : s.endsWith('m') ? 1_000_000 : 1
  const n = Number.parseFloat(mult === 1 ? s : s.slice(0, -1))
  return Number.isFinite(n) ? n * mult : 0
}

export function initials(name: string): string {
  return name
    .replace(/[^\p{L}\s&]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w && w !== '&')
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
