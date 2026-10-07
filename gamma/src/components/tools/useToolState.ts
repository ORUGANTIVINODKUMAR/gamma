import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ToolId } from '@/config/tools'
import { usePreferences } from '@/context/PreferencesContext'
import { useToolDraft } from '@/hooks/useToolDraft'
import type { FilingStatus, TaxYear } from '@/lib/tax/years'
import { useWorkspace, type Analysis } from '@/services/workspace'

/**
 * Tool input state: starts from the example (so results show immediately),
 * persists as a draft, and can be replaced by a saved analysis via
 * `?analysis=<id>`.
 */
export function useToolState<T extends { year: TaxYear; status: FilingStatus }>(toolId: ToolId, example: T, blank: T) {
  const { prefs } = usePreferences()
  const [params, setParams] = useSearchParams()
  const { analyses } = useWorkspace()
  const analysisId = params.get('analysis')

  const loaded: Analysis | null = useMemo(
    () => analyses.find((a) => a.id === analysisId && a.toolId === toolId) ?? null,
    [analyses, analysisId, toolId],
  )

  const initial = useMemo(
    () => ({ ...example, year: prefs.defaultTaxYear, status: prefs.defaultFilingStatus }),
    [example, prefs.defaultTaxYear, prefs.defaultFilingStatus],
  )
  const override = useMemo(() => (loaded ? ({ ...example, ...(loaded.input as Partial<T>) } as T) : null), [loaded, example])
  const [value, setValue, update] = useToolDraft<T>(`tool.${toolId}`, initial, override)

  const detach = useCallback(() => {
    if (!analysisId) return
    setParams(
      (p) => {
        p.delete('analysis')
        return p
      },
      { replace: true },
    )
  }, [analysisId, setParams])

  const reset = useCallback(() => {
    detach()
    setValue((v) => ({ ...blank, year: v.year, status: prefs.defaultFilingStatus }))
  }, [blank, detach, setValue, prefs.defaultFilingStatus])

  const loadExample = useCallback(() => {
    detach()
    setValue((v) => ({ ...example, year: v.year }))
  }, [detach, example, setValue])

  return { value, setValue, update, loaded, reset, loadExample }
}
