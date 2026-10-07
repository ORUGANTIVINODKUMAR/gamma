import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { IS_DEMO_MODE, onUnauthorized } from '@/services/api'
import {
  adapter,
  clearSession,
  loadSession,
  persistSession,
  SESSION_STORAGE_KEY,
  type ProfileUpdate,
  type SignupInput,
  type User,
} from '@/services/auth'
import { workspace } from '@/services/workspace'

export type AuthStatus = 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  isDemoMode: boolean
  login: (email: string, password: string, remember: boolean) => Promise<User>
  signup: (input: SignupInput) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (patch: ProfileUpdate) => Promise<User>
  changePassword: (current: string, next: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore synchronously so a signed-in user never sees a login flash.
  const [user, setUser] = useState<User | null>(() => {
    const session = loadSession()
    workspace.bind(session?.user.id ?? null)
    return session?.user ?? null
  })

  const signOutLocally = useCallback(() => {
    clearSession()
    workspace.bind(null)
    setUser(null)
  }, [])

  // Validate the stored session in the background and refresh the profile.
  useEffect(() => {
    const session = loadSession()
    if (!session) return
    let cancelled = false
    adapter
      .me(session.token)
      .then((fresh) => {
        if (cancelled) return
        persistSession(session.token, fresh, session.remember)
        setUser(fresh)
      })
      .catch((err: unknown) => {
        // Only a definitive rejection signs the user out; network blips keep the session.
        const status = (err as { status?: number }).status
        if (!cancelled && (IS_DEMO_MODE || status === 401 || status === 403)) signOutLocally()
      })
    return () => {
      cancelled = true
    }
  }, [signOutLocally])

  useEffect(() => onUnauthorized(signOutLocally), [signOutLocally])

  // Keep tabs in sync: signing in/out in one tab updates the others.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEY || e.key === null) {
        const session = loadSession()
        workspace.bind(session?.user.id ?? null)
        setUser(session?.user ?? null)
      } else if (e.key === workspace.storageKey()) {
        workspace.refresh()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const { token, user: u } = await adapter.login(email, password)
    persistSession(token, u, remember)
    workspace.bind(u.id)
    setUser(u)
    return u
  }, [])

  const signup = useCallback(async (input: SignupInput) => {
    const { token, user: u } = await adapter.signup(input)
    persistSession(token, u, true)
    workspace.bind(u.id)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    const session = loadSession()
    if (session) await adapter.logout(session.token).catch(() => undefined)
    signOutLocally()
  }, [signOutLocally])

  const updateProfile = useCallback(async (patch: ProfileUpdate) => {
    const session = loadSession()
    if (!session) throw new Error('Not signed in')
    const updated = await adapter.updateProfile(session.token, patch)
    persistSession(session.token, updated, session.remember)
    setUser(updated)
    return updated
  }, [])

  const changePassword = useCallback(async (current: string, next: string) => {
    const session = loadSession()
    if (!session) throw new Error('Not signed in')
    await adapter.changePassword(session.token, current, next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status: user ? 'authenticated' : 'unauthenticated',
      user,
      isDemoMode: IS_DEMO_MODE,
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, login, signup, logout, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
