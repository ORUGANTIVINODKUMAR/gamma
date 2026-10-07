import { useCallback, useEffect, useRef, useState } from 'react'
import { readJSON, writeJSON } from '@/services/storage'

/**
 * Tool inputs that survive navigation and reloads (per browser). A saved
 * analysis can be reopened by passing its snapshot as `override`.
 */
export function useToolDraft<T extends object>(key: string, initial: T, override?: T | null) {
  const [value, setValue] = useState<T>(() => override ?? { ...initial, ...readJSON<Partial<T>>(`draft.${key}`, {}) })
  const first = useRef(true)

  // Opening a different saved analysis replaces the inputs (adjust-state-during-render pattern).
  const [lastOverride, setLastOverride] = useState(override)
  if (override !== lastOverride) {
    setLastOverride(override)
    if (override) setValue(override)
  }

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const id = window.setTimeout(() => writeJSON(`draft.${key}`, value), 250)
    return () => window.clearTimeout(id)
  }, [key, value])

  const update = useCallback(<K extends keyof T>(field: K, v: T[K]) => {
    setValue((prev) => ({ ...prev, [field]: v }))
  }, [])

  return [value, setValue, update] as const
}
