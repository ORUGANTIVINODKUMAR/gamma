import { MotionConfig } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_TAX_YEAR, type FilingStatus, type TaxYear } from '@/lib/tax/years'
import { readJSON, writeJSON } from '@/services/storage'

export type MotionPreference = 'system' | 'reduced' | 'full'

export interface Preferences {
  motion: MotionPreference
  smoothScroll: boolean
  defaultTaxYear: TaxYear
  defaultFilingStatus: FilingStatus
}

const DEFAULTS: Preferences = {
  motion: 'system',
  smoothScroll: true,
  defaultTaxYear: DEFAULT_TAX_YEAR,
  defaultFilingStatus: 'mfj',
}

interface PreferencesContextValue {
  prefs: Preferences
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  /** True when animation should be minimized (OS setting or user override). */
  reduceMotion: boolean
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

const query = '(prefers-reduced-motion: reduce)'

function systemReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.(query).matches
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(() => ({ ...DEFAULTS, ...readJSON<Partial<Preferences>>('prefs', {}) }))
  const [systemReduce, setSystemReduce] = useState(systemReducedMotion)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setSystemReduce(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const setPref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value }
      writeJSON('prefs', next)
      return next
    })
  }, [])

  const reduceMotion = prefs.motion === 'reduced' || (prefs.motion === 'system' && systemReduce)

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = prefs.motion === 'reduced' ? 'true' : 'false'
  }, [prefs.motion])

  const value = useMemo(() => ({ prefs, setPref, reduceMotion }), [prefs, setPref, reduceMotion])

  return (
    <PreferencesContext.Provider value={value}>
      <MotionConfig reducedMotion={prefs.motion === 'reduced' ? 'always' : prefs.motion === 'full' ? 'never' : 'user'}>
        {children}
      </MotionConfig>
    </PreferencesContext.Provider>
  )
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within <PreferencesProvider>')
  return ctx
}
