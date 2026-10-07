import { animate } from 'framer-motion'
import { ArrowDown, FolderOpen, Printer, RotateCcw, Save, Sparkles } from 'lucide-react'
import { lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { scrollToId } from '@/components/layout/SmoothScroll'
import { SceneBoundary } from '@/components/three/core/SceneBoundary'
import type { StageData } from '@/components/three/scenes/ToolStageScene'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/fields'
import { LogoMark } from '@/components/ui/Logo'
import { Callout } from '@/components/ui/primitives'
import type { ToolMeta } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { usePreferences } from '@/context/PreferencesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { TAX_YEARS, type TaxYear } from '@/lib/tax/years'
import type { AnalysisSummary } from '@/services/summaries'
import { clientName, useWorkspace, type Analysis } from '@/services/workspace'
import { SaveAnalysisModal } from './SaveAnalysisModal'

const ToolStageScene = lazy(() => import('@/components/three/scenes/ToolStageScene'))

interface ToolShellProps {
  /** Live data for the tool's 3D object (quarterly amounts, tax slabs, risk emphasis…). */
  stageData?: StageData
  tool: ToolMeta
  year: TaxYear
  onYearChange: (y: TaxYear) => void
  inputs: ReactNode
  results: ReactNode
  summary: AnalysisSummary
  input: unknown
  onLoadExample: () => void
  onReset: () => void
  assumptions: string[]
  loaded?: Analysis | null
}

export function ToolShell({ tool, year, onYearChange, inputs, results, summary, input, onLoadExample, onReset, assumptions, loaded, stageData }: ToolShellProps) {
  useDocumentTitle(tool.name)
  const { user } = useAuth()
  const { clients } = useWorkspace()
  const [saveOpen, setSaveOpen] = useState(false)

  return (
    <div>
      <header data-print-hide className="studio-bg relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-white/80 px-6 py-7 shadow-[0_40px_90px_-60px_rgba(15,23,42,0.4)] sm:px-9">
        <div className="relative z-10 min-w-0 md:max-w-[52%]">
          <p className="eyebrow">Tax tool</p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,3.8vw,3.2rem)] leading-[1.02] tracking-[-0.03em] text-fg">{tool.name}</h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-fg-subtle">{tool.description}</p>
        </div>
        <SceneBoundary className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] md:block" fallback={null}>
          <ToolStageScene toolId={tool.id} data={stageData} className="absolute inset-0" />
        </SceneBoundary>
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <Segmented
            label="Tax year"
            value={String(year) as `${TaxYear}`}
            onChange={(v) => onYearChange(Number(v) as TaxYear)}
            options={TAX_YEARS.map((y) => ({ value: String(y) as `${TaxYear}`, label: `TY ${y}` }))}
          />
          <Button variant="ghost" size="sm" icon={<Sparkles className="size-4" aria-hidden />} onClick={onLoadExample}>
            Example
          </Button>
          <Button variant="ghost" size="sm" icon={<RotateCcw className="size-4" aria-hidden />} onClick={onReset}>
            Reset
          </Button>
          <Button variant="subtle" size="sm" icon={<Printer className="size-4" aria-hidden />} onClick={() => window.print()}>
            Print
          </Button>
          <Button size="sm" icon={<Save className="size-4" aria-hidden />} onClick={() => setSaveOpen(true)}>
            Save analysis
          </Button>
          <Button variant="ghost" size="sm" icon={<ArrowDown className="size-4" aria-hidden />} className="lg:hidden" onClick={() => scrollToId('tool-results', -80)}>
            Jump to results
          </Button>
        </div>
      </header>

      {loaded && (
        <div data-print-hide className="mt-6">
          <Callout tone="accent" title={`Saved analysis: ${loaded.title}`}>
            {clientName(clients, loaded.clientId)} · saved {formatDate(loaded.createdAt)}. Edits here don’t change the saved copy until you save
            again.{' '}
            <Link to="/app/reports" className="font-semibold text-accent-300 hover:text-accent-200">
              <FolderOpen className="mb-0.5 mr-1 inline size-3.5" aria-hidden />
              All reports
            </Link>
          </Callout>
        </div>
      )}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(340px,430px)_minmax(0,1fr)]">
        <section
          aria-label="Inputs"
          data-print-hide
          data-lenis-prevent
          className="surface-card rounded-panel p-5 sm:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-y-auto"
        >
          {inputs}
        </section>

        <section id="tool-results" aria-label="Results" aria-live="polite" data-print-region className="flex min-w-0 scroll-mt-20 flex-col gap-6">
          <div className="print-only">
            <div className="flex items-center justify-between border-b border-black/20 pb-3">
              <span className="flex items-center gap-2">
                <LogoMark className="size-7" />
                <strong style={{ letterSpacing: '0.3em' }}>TAPRECO</strong>
              </span>
              <span style={{ fontSize: 12 }}>{tool.name} · Tax year {year}</span>
            </div>
            <p style={{ marginTop: 10, fontSize: 12 }}>
              {loaded ? `${loaded.title} · ${clientName(clients, loaded.clientId)} · ` : ''}Prepared {formatDate(new Date(), 'long')}
              {user ? ` by ${user.name}, ${user.firm}` : ''}
            </p>
          </div>
          {results}
          <AssumptionsCard items={assumptions} />
        </section>
      </div>

      <SaveAnalysisModal open={saveOpen} onClose={() => setSaveOpen(false)} toolId={tool.id} input={input} summary={summary} defaultClientId={loaded?.clientId} />
    </div>
  )
}

/* ── Input grouping ─────────────────────────────────────────────────────── */

export function InputGroup({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <fieldset className={cn('border-t border-line/[0.06] pt-5 first:border-0 first:pt-0 [&+&]:mt-6', className)}>
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-400/90">
        {title}
      </h2>
      {description && <p className="mt-1 text-[12.5px] leading-relaxed text-fg-faint">{description}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </fieldset>
  )
}

/* ── Result primitives ──────────────────────────────────────────────────── */

/** Number that glides to its new value when inputs change. */
export function AnimatedNumber({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const { reduceMotion } = usePreferences()
  const [display, setDisplay] = useState(value)
  const shown = useRef(value)
  useEffect(() => {
    if (reduceMotion) {
      shown.current = value
      return
    }
    // Tween from whatever is on screen, so interrupted animations never jump.
    const controls = animate(shown.current, value, {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        shown.current = v
        setDisplay(v)
      },
    })
    return () => controls.stop()
  }, [value, reduceMotion])
  return <span className={className}>{format(reduceMotion ? value : display)}</span>
}

export function HeroResult({
  label,
  value,
  format,
  sub,
  aside,
  tone = 'accent',
}: {
  label: string
  value: number
  format: (n: number) => string
  sub?: ReactNode
  aside?: ReactNode
  tone?: 'accent' | 'neutral'
}) {
  return (
    <div className="surface-card relative overflow-hidden rounded-panel p-6 sm:p-8">
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[13px] font-medium text-fg-subtle">{label}</p>
          <p className={cn('t-numeral mt-2 text-[clamp(3.2rem,7vw,5rem)]', tone === 'accent' ? 'text-accent-400' : 'text-fg')}>
            <AnimatedNumber value={value} format={format} />
          </p>
          {sub && <div className="mt-3 text-[13.5px] text-fg-subtle">{sub}</div>}
        </div>
        {aside && <div className="relative">{aside}</div>}
      </div>
    </div>
  )
}

export function StatTile({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'good' | 'warning' | 'critical' }) {
  return (
    <div className="surface-card rounded-card p-4 sm:p-5">
      <p className="text-[12.5px] text-fg-faint">{label}</p>
      <p className="mt-1.5 font-serif text-[1.9rem] leading-none tracking-[-0.02em] text-fg">{value}</p>
      {sub && (
        <p className={cn('mt-1 text-[12px]', tone === 'good' ? 'text-good-soft' : tone === 'warning' ? 'text-warning' : tone === 'critical' ? 'text-critical-soft' : 'text-fg-faint')}>
          {sub}
        </p>
      )}
    </div>
  )
}

export function ResultCard({ title, description, action, children, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('surface-card rounded-panel p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[16px] font-semibold text-fg">{title}</h2>
          {description && <p className="mt-1 text-[12.5px] leading-relaxed text-fg-faint">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  )
}

export interface BreakdownRow {
  label: ReactNode
  value: string
  kind?: 'total' | 'subtotal' | 'muted' | 'credit'
  hint?: string
}

export function BreakdownTable({ rows, caption }: { rows: BreakdownRow[]; caption: string }) {
  return (
    <table className="w-full text-[13.5px]">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={i}
            className={cn(
              'border-b border-line/[0.045] last:border-0',
              r.kind === 'subtotal' && 'border-t border-line/[0.1]',
              r.kind === 'total' && 'border-0',
            )}
          >
            <th
              scope="row"
              className={cn(
                'py-2.5 pr-4 text-left font-normal',
                r.kind === 'total' ? 'pt-4 font-semibold text-fg' : r.kind === 'subtotal' ? 'font-semibold text-fg-muted' : r.kind === 'muted' ? 'pl-4 text-fg-faint' : 'text-fg-subtle',
              )}
            >
              {r.label}
              {r.hint && <span className="ml-2 text-[11.5px] font-normal text-fg-faint">{r.hint}</span>}
            </th>
            <td
              className={cn(
                'tabular py-2.5 text-right',
                r.kind === 'total' ? 'pt-4 text-[17px] font-semibold text-accent-200' : r.kind === 'subtotal' ? 'font-semibold text-fg' : r.kind === 'credit' ? 'text-good-soft' : r.kind === 'muted' ? 'text-fg-faint' : 'text-fg-muted',
              )}
            >
              {r.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AssumptionsCard({ items }: { items: string[] }) {
  return (
    <details className="surface-card group rounded-panel p-5 sm:p-6 [&_summary::-webkit-details-marker]:hidden" open={false}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-[14px] font-semibold text-fg">
        Assumptions & limitations
        <span className="text-[12px] font-medium text-accent-300 group-open:hidden">Show</span>
        <span className="hidden text-[12px] font-medium text-accent-300 group-open:inline">Hide</span>
      </summary>
      <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[13px] leading-relaxed text-fg-subtle marker:text-accent-500">
        {items.map((a) => (
          <li key={a}>{a}</li>
        ))}
        <li>Estimates for professional review — not tax or legal advice. Federal tax only unless stated.</li>
      </ul>
    </details>
  )
}
