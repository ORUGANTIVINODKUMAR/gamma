/**
 * Authentication service.
 *
 * One interface, two adapters:
 *  • HttpAuthAdapter — talks to the Tapreco backend (VITE_API_BASE_URL).
 *  • DemoAuthAdapter — self-contained, stores accounts in this browser so the
 *    product is fully explorable before the backend is connected.
 *
 * Sessions persist (localStorage when "Keep me signed in", else
 * sessionStorage) so a user signs in once and reaches every tool.
 */

import { apiRequest, ApiError, IS_DEMO_MODE, setTokenProvider } from './api'
import { readJSON, removeKey, uid, writeJSON } from './storage'

export type ProfessionalRole = 'CPA' | 'Enrolled Agent' | 'Tax Attorney' | 'Tax Preparer' | 'Financial Advisor' | 'Other'

export const PROFESSIONAL_ROLES: readonly ProfessionalRole[] = [
  'CPA',
  'Enrolled Agent',
  'Tax Attorney',
  'Tax Preparer',
  'Financial Advisor',
  'Other',
]

export interface User {
  id: string
  name: string
  email: string
  firm: string
  role: ProfessionalRole
  title?: string
  phone?: string
  createdAt: string
}

export interface SignupInput {
  name: string
  email: string
  password: string
  firm: string
  role: ProfessionalRole
}

export type ProfileUpdate = Partial<Pick<User, 'name' | 'firm' | 'role' | 'title' | 'phone'>>

export interface Session {
  token: string
  user: User
  expiresAt: number
  remember: boolean
}

interface AuthAdapter {
  login(email: string, password: string): Promise<{ token: string; user: User }>
  signup(input: SignupInput): Promise<{ token: string; user: User }>
  me(token: string): Promise<User>
  logout(token: string): Promise<void>
  updateProfile(token: string, patch: ProfileUpdate): Promise<User>
  changePassword(token: string, current: string, next: string): Promise<void>
  /** Returns 'sent' when an email went out; 'reset' when demo mode reset it directly. */
  resetPassword(email: string, newPassword?: string): Promise<'sent' | 'reset'>
}

export class AuthError extends Error {
  readonly field?: 'email' | 'password' | 'form'

  constructor(message: string, field?: 'email' | 'password' | 'form') {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}

/* ── HTTP adapter ───────────────────────────────────────────────────────── */

const httpAdapter: AuthAdapter = {
  login: (email, password) =>
    apiRequest('/auth/login', { method: 'POST', body: { email, password }, anonymous: true }),
  signup: (input) => apiRequest('/auth/signup', { method: 'POST', body: input, anonymous: true }),
  me: async () => (await apiRequest<{ user: User }>('/auth/me')).user,
  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' }).catch(() => undefined)
  },
  updateProfile: async (_token, patch) => (await apiRequest<{ user: User }>('/users/me', { method: 'PATCH', body: patch })).user,
  changePassword: async (_token, currentPassword, newPassword) => {
    await apiRequest('/auth/password', { method: 'POST', body: { currentPassword, newPassword } })
  },
  resetPassword: async (email) => {
    await apiRequest('/auth/forgot-password', { method: 'POST', body: { email }, anonymous: true })
    return 'sent'
  },
}

/* ── Demo adapter ───────────────────────────────────────────────────────── */

interface DemoUserRecord extends User {
  salt: string
  passwordHash: string
}

export const DEMO_CREDENTIALS = { email: 'demo@tapreco.com', password: 'Tapreco2026!' } as const

const USERS_KEY = 'demo.users'
const SESSIONS_KEY = 'demo.sessions'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  try {
    if (crypto?.subtle) {
      const digest = await crypto.subtle.digest('SHA-256', data)
      return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    /* insecure context — fall back below */
  }
  // FNV-1a fallback for non-secure contexts (demo only; never used with a backend).
  let h = 0x811c9dc5
  for (const byte of data) h = Math.imul(h ^ byte, 0x01000193) >>> 0
  return `fnv-${h.toString(16)}`
}

function publicUser(record: DemoUserRecord): User {
  const { salt: _s, passwordHash: _p, ...user } = record
  return user
}

async function demoUsers(): Promise<DemoUserRecord[]> {
  const users = readJSON<DemoUserRecord[]>(USERS_KEY, [])
  if (!users.some((u) => u.email === DEMO_CREDENTIALS.email)) {
    const salt = uid()
    users.push({
      id: 'demo-user',
      name: 'Jordan Ellis',
      email: DEMO_CREDENTIALS.email,
      firm: 'Ellis & Park CPAs',
      role: 'CPA',
      title: 'Tax Partner',
      createdAt: new Date('2026-01-12T15:00:00').toISOString(),
      salt,
      passwordHash: await hashPassword(DEMO_CREDENTIALS.password, salt),
    })
    writeJSON(USERS_KEY, users)
  }
  return users
}

function demoSessionUser(token: string, users: DemoUserRecord[]): DemoUserRecord | undefined {
  const sessions = readJSON<Record<string, string>>(SESSIONS_KEY, {})
  const userId = sessions[token]
  return users.find((u) => u.id === userId)
}

function issueDemoToken(userId: string): string {
  const token = `demo.${uid()}`
  const sessions = readJSON<Record<string, string>>(SESSIONS_KEY, {})
  sessions[token] = userId
  writeJSON(SESSIONS_KEY, sessions)
  return token
}

const demoAdapter: AuthAdapter = {
  async login(email, password) {
    await delay(450)
    const users = await demoUsers()
    const record = users.find((u) => u.email === email.trim().toLowerCase())
    if (!record || record.passwordHash !== (await hashPassword(password, record.salt))) {
      throw new AuthError('The email or password you entered is incorrect.', 'form')
    }
    return { token: issueDemoToken(record.id), user: publicUser(record) }
  },
  async signup(input) {
    await delay(550)
    const users = await demoUsers()
    const email = input.email.trim().toLowerCase()
    if (users.some((u) => u.email === email)) {
      throw new AuthError('An account with this email already exists. Try signing in.', 'email')
    }
    const salt = uid()
    const record: DemoUserRecord = {
      id: uid(),
      name: input.name.trim(),
      email,
      firm: input.firm.trim(),
      role: input.role,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: await hashPassword(input.password, salt),
    }
    writeJSON(USERS_KEY, [...users, record])
    return { token: issueDemoToken(record.id), user: publicUser(record) }
  },
  async me(token) {
    const record = demoSessionUser(token, await demoUsers())
    if (!record) throw new AuthError('Session expired', 'form')
    return publicUser(record)
  },
  async logout(token) {
    const sessions = readJSON<Record<string, string>>(SESSIONS_KEY, {})
    delete sessions[token]
    writeJSON(SESSIONS_KEY, sessions)
  },
  async updateProfile(token, patch) {
    await delay(350)
    const users = await demoUsers()
    const record = demoSessionUser(token, users)
    if (!record) throw new AuthError('Session expired', 'form')
    Object.assign(record, patch)
    writeJSON(USERS_KEY, users)
    return publicUser(record)
  },
  async changePassword(token, current, next) {
    await delay(400)
    const users = await demoUsers()
    const record = demoSessionUser(token, users)
    if (!record) throw new AuthError('Session expired', 'form')
    if (record.passwordHash !== (await hashPassword(current, record.salt))) {
      throw new AuthError('Your current password is incorrect.', 'password')
    }
    record.salt = uid()
    record.passwordHash = await hashPassword(next, record.salt)
    writeJSON(USERS_KEY, users)
  },
  async resetPassword(email, newPassword) {
    await delay(450)
    const users = await demoUsers()
    const record = users.find((u) => u.email === email.trim().toLowerCase())
    if (!record) throw new AuthError('No account uses that email in this browser.', 'email')
    if (!newPassword) throw new AuthError('Enter a new password.', 'password')
    record.salt = uid()
    record.passwordHash = await hashPassword(newPassword, record.salt)
    writeJSON(USERS_KEY, users)
    return 'reset'
  },
}

/* ── Session persistence ────────────────────────────────────────────────── */

const SESSION_KEY = 'session'
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
const TWELVE_HOURS = 12 * 60 * 60 * 1000

export const adapter: AuthAdapter = IS_DEMO_MODE ? demoAdapter : httpAdapter

export function loadSession(): Session | null {
  const s = readJSON<Session | null>(SESSION_KEY, null) ?? readJSON<Session | null>(SESSION_KEY, null, 'session')
  if (!s || !s.token || !s.user) return null
  if (Date.now() > s.expiresAt) {
    clearSession()
    return null
  }
  return s
}

export function persistSession(token: string, user: User, remember: boolean): Session {
  const session: Session = { token, user, remember, expiresAt: Date.now() + (remember ? THIRTY_DAYS : TWELVE_HOURS) }
  clearSession()
  writeJSON(SESSION_KEY, session, remember ? 'local' : 'session')
  return session
}

export function clearSession(): void {
  removeKey(SESSION_KEY)
  removeKey(SESSION_KEY, 'session')
}

export const SESSION_STORAGE_KEY = `tapreco.${SESSION_KEY}`

setTokenProvider(() => loadSession()?.token ?? null)

export function describeAuthError(err: unknown): { message: string; field?: 'email' | 'password' | 'form' } {
  if (err instanceof AuthError) return { message: err.message, field: err.field }
  if (err instanceof ApiError) {
    if (err.status === 401) return { message: 'The email or password you entered is incorrect.', field: 'form' }
    if (err.status === 409) return { message: 'An account with this email already exists.', field: 'email' }
    return { message: err.message, field: 'form' }
  }
  return { message: 'Something went wrong. Please try again.', field: 'form' }
}
