/**
 * Defensive Web Storage access. Storage can be unavailable (private mode,
 * blocked site data, quota) — every call degrades to a no-op instead of
 * throwing, so the UI always renders.
 */

type Area = 'local' | 'session'

function area(which: Area): Storage | null {
  try {
    return which === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export const PREFIX = 'tapreco.'

export function readJSON<T>(key: string, fallback: T, which: Area = 'local'): T {
  try {
    const raw = area(which)?.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown, which: Area = 'local'): void {
  try {
    area(which)?.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or blocked — non-fatal */
  }
}

export function removeKey(key: string, which: Area = 'local'): void {
  try {
    area(which)?.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

/** crypto.randomUUID is secure-context only (not on plain-http LAN IPs). */
export function uid(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`
}
