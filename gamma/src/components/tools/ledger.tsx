import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge, type Tone } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'
import { formatCompactCurrency, formatCurrency, formatDate, formatPercent, formatSignedCurrency } from '@/lib/format'
import { getYear, type FilingStatus, type TaxYear } from '@/lib/tax/years'

/**
 * Result presentation for the tax tools: numbers set in type, grouped by
 * hierarchy and position — no charts, gauges or progress bars. These are
 * presentational only; every figure comes from the tool's own calculation.
 */

/* ── Ledger ─────────────────────────────────────────────────────────────── */

export interface LedgerRowData {
  label: ReactNode
  /** Quiet second line (income character, basis, …). */
  note?: ReactNode
  value: string
  /** `credit` renders as a reduction, `cost` as an addition. */
  tone?: 'credit' | 'cost'
}

/** A ledger of line items with a closing total. Reads like the working paper it replaces. */
export function Ledger({ rows, totalLabel, total, caption }: { rows: LedgerRowData[]; totalLabel: string; total: string; caption: string }) {
  return (
    <div>
      <table className="w-full text-[13.5px]">
        <caption className="sr-only">{caption}</caption>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line/[0.07]">
              <th scope="row" className="py-3 pr-4 text-left font-normal text-fg-muted">
                {r.label}
                {r.note && <span className="mt-0.5 block text-[11.5px] text-fg-faint">{r.note}</span>}
              </th>
              <td className={cn('tabular py-3 text-right text-[15px] font-medium', r.tone === 'credit' ? 'text-good-soft' : 'text-fg')}>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <span className="text-[13.5px] font-semibold text-fg">{totalLabel}</span>
        <span className="t-numeral text-[2.1rem] text-accent-400">{total}</span>
      </div>
    </div>
  )
}

/* ── Layers ─────────────────────────────────────────────────────────────── */

export interface LayerItem {
  label: string
  value: number
  hint?: string
}

/**
 * Income stacked by tax character, largest first, each shown as a numbered
 * layer with its amount and share in words. Replaces the donut.
 */
export function LayerList({ items, caption }: { items: LayerItem[]; caption: string }) {
  const total = items.reduce((s, i) => s + Math.max(0, i.value), 0)
  const ranked = [...items].sort((a, b) => b.value - a.value)
  return (
    <ol aria-label={caption} className="flex flex-col">
      {ranked.map((it, i) => (
        <li key={it.label} className="flex items-baseline gap-4 border-b border-line/[0.07] py-3 last:border-0">
          <span className="tabular w-6 text-[12px] text-fg-faint">{String(i + 1).padStart(2, '0')}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] text-fg-muted">{it.label}</span>
            {it.hint && <span className="block text-[11.5px] text-fg-faint">{it.hint}</span>}
          </span>
          <span className="text-right">
            <span className="tabular block font-serif text-[1.5rem] leading-none text-fg">{formatCurrency(it.value)}</span>
            <span className="tabular mt-1 block text-[11.5px] text-fg-faint">{total > 0 ? `${formatPercent(Math.max(0, it.value) / total, 0)} of fund income` : '—'}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

/* ── Quarterly slips ────────────────────────────────────────────────────── */

export interface SlipData {
  quarter: number
  dueDate: Date | string
  required: number
  paid: number
  status: { label: string; tone: Tone }
}

/** Four payment slips, Q1–Q4 — the same sheets that assemble in the 3D header. */
export function QuarterSlips({ slips }: { slips: SlipData[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Quarterly estimated tax payments">
      {slips.map((s) => (
        <li
          key={s.quarter}
          className="group relative overflow-hidden rounded-xl border border-line/[0.08] bg-[linear-gradient(180deg,#fff,#fbfaf6)] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_26px_-22px_rgba(15,23,42,0.4)] transition-[transform,box-shadow] duration-300 ease-premium hover:-translate-y-1 hover:shadow-[0_28px_36px_-24px_rgba(15,23,42,0.45)]"
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-accent-400" />
          <div className="flex items-start justify-between gap-2">
            <span className="font-serif text-[2.6rem] leading-none tracking-[-0.03em] text-fg">Q{s.quarter}</span>
            <Badge tone={s.status.tone}>{s.status.label}</Badge>
          </div>
          <p className="mt-2 text-[12px] text-fg-faint">Due {formatDate(s.dueDate)}</p>
          <dl className="mt-4 grid gap-2.5 text-[12.5px]">
            <div>
              <dt className="text-fg-faint">Required</dt>
              <dd className="tabular text-[17px] font-semibold text-fg">{formatCurrency(s.required)}</dd>
            </div>
            <div>
              <dt className="text-fg-faint">Paid</dt>
              <dd className={cn('tabular text-[17px] font-semibold', s.paid >= s.required - 0.5 ? 'text-accent-300' : 'text-fg')}>{formatCurrency(s.paid)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  )
}

/* ── Bracket ladder ─────────────────────────────────────────────────────── */

/** Ordinary brackets as a ladder with a marker where taxable income sits. Replaces the bracket bar. */
export function BracketLadder({ year, status, taxable }: { year: TaxYear; status: FilingStatus; taxable: number }) {
  const p = getYear(year)
  const tops = p.bracketTops[status]
  const rows = p.rates.map((rate, i) => ({ rate, from: i === 0 ? 0 : tops[i - 1]!, to: i < tops.length ? tops[i]! : Infinity }))
  const here = rows.findIndex((r) => taxable >= r.from && taxable < r.to)
  const current = rows[here === -1 ? rows.length - 1 : here]!
  const next = rows[(here === -1 ? rows.length - 1 : here) + 1]
  const visible = rows.slice(0, Math.min(rows.length, (here === -1 ? rows.length - 1 : here) + 3))

  return (
    <div>
      <ol className="flex flex-col-reverse" aria-label="Federal ordinary income brackets">
        {visible.map((r) => {
          const on = r === current
          const passed = taxable >= r.to
          return (
            <li
              key={r.rate}
              aria-current={on ? 'true' : undefined}
              className={cn(
                'relative flex items-baseline gap-4 border-t border-line/[0.07] py-2.5 pl-4 first:border-t-0',
                on ? 'bg-accent-500/[0.06]' : passed ? 'text-fg-muted' : 'text-fg-faint',
              )}
            >
              <span aria-hidden className={cn('absolute inset-y-1 left-0 w-[3px] rounded-full', on ? 'bg-accent-400' : passed ? 'bg-fg/20' : 'bg-transparent')} />
              <span className={cn('tabular w-14 font-serif text-[1.5rem] leading-none', on ? 'text-accent-300' : '')}>{Math.round(r.rate * 100)}%</span>
              <span className="tabular flex-1 text-[12.5px]">
                {formatCompactCurrency(r.from)} – {Number.isFinite(r.to) ? formatCompactCurrency(r.to) : 'and above'}
              </span>
              {on && <span className="text-[11.5px] font-semibold text-accent-300">You are here</span>}
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-[13px] text-fg-subtle">
        Taxable income <span className="tabular font-semibold text-fg">{formatCurrency(taxable)}</span> sits in the {Math.round(current.rate * 100)}% bracket.{' '}
        {next && Number.isFinite(current.to) ? (
          <>
            Room before {Math.round(next.rate * 100)}%: <span className="tabular font-semibold text-accent-200">{formatCurrency(current.to - taxable)}</span>.
          </>
        ) : (
          'This is the top bracket.'
        )}
      </p>
    </div>
  )
}

/* ── Bridge ─────────────────────────────────────────────────────────────── */

export interface BridgeStep {
  label: string
  delta: number
}

/** Baseline → each strategy → plan, as a running ledger. Replaces the waterfall. */
export function Bridge({ start, steps, endLabel }: { start: { label: string; value: number }; steps: BridgeStep[]; endLabel: string }) {
  const rows = steps.reduce<(BridgeStep & { running: number })[]>((acc, s) => {
    const prev = acc.length ? acc[acc.length - 1]!.running : start.value
    acc.push({ ...s, running: prev + s.delta })
    return acc
  }, [])
  const running = rows.length ? rows[rows.length - 1]!.running : start.value
  return (
    <table className="w-full text-[13.5px]">
      <caption className="sr-only">Federal tax from baseline to plan, one strategy at a time</caption>
      <thead>
        <tr className="text-[11.5px] uppercase tracking-[0.1em] text-fg-faint">
          <th scope="col" className="pb-2 text-left font-semibold">Step</th>
          <th scope="col" className="pb-2 text-right font-semibold">Change</th>
          <th scope="col" className="pb-2 text-right font-semibold">Running tax</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t border-line/[0.08]">
          <th scope="row" className="py-3 text-left font-semibold text-fg">{start.label}</th>
          <td>
            <span className="sr-only">No change</span>
          </td>
          <td className="tabular py-3 text-right font-serif text-[1.35rem] text-fg">{formatCurrency(start.value)}</td>
        </tr>
        {rows.map((s) => (
          <tr key={s.label} className="border-t border-line/[0.06]">
            <th scope="row" className="py-3 pl-5 text-left font-normal text-fg-muted">{s.label}</th>
            <td className={cn('tabular py-3 text-right font-medium', s.delta < 0 ? 'text-good-soft' : 'text-serious')}>{formatSignedCurrency(s.delta)}</td>
            <td className="tabular py-3 text-right text-fg-muted">{formatCurrency(s.running)}</td>
          </tr>
        ))}
        <tr className="border-t border-line/[0.15]">
          <th scope="row" className="pt-4 text-left font-semibold text-fg">{endLabel}</th>
          <td>
            <span className="sr-only">No change</span>
          </td>
          <td className="tabular pt-4 text-right font-serif text-[1.75rem] text-accent-300">{formatCurrency(running)}</td>
        </tr>
      </tbody>
    </table>
  )
}

/* ── Structures side by side ────────────────────────────────────────────── */

export interface StructureData {
  title: string
  subtitle: string
  rows: { label: string; value: number }[]
  total: number
  rate: number
}

/**
 * Two business structures set face to face: each lists the tax components it
 * carries and its total. The lower-cost structure is marked. Mirrors the 3D
 * comparison, where the same components stack as slabs on each structure.
 */
export function StructureLedger({ left, right, winner }: { left: StructureData; right: StructureData; winner: 'left' | 'right' | null }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[
        { d: left, win: winner === 'left' },
        { d: right, win: winner === 'right' },
      ].map(({ d, win }) => (
        <section
          key={d.title}
          aria-label={d.title}
          className={cn(
            'relative rounded-2xl border bg-[linear-gradient(180deg,#fff,#fcfbf8)] p-5 sm:p-6',
            win ? 'border-accent-500/40 shadow-[0_26px_44px_-30px_rgba(37,99,235,0.5)]' : 'border-line/[0.08] shadow-[0_14px_26px_-22px_rgba(15,23,42,0.3)]',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-[1.75rem] leading-none tracking-[-0.02em] text-fg">{d.title}</h3>
              <p className="mt-1.5 text-[12px] text-fg-faint">{d.subtitle}</p>
            </div>
            {win && (
              <Badge tone="accent" withIcon={false}>
                <Check className="size-3" aria-hidden /> Lower cost
              </Badge>
            )}
          </div>
          <ul className="mt-5 flex flex-col">
            {d.rows.map((r) => (
              <li key={r.label} className="flex items-baseline justify-between gap-3 border-t border-line/[0.07] py-2.5 text-[13.5px]">
                <span className="text-fg-muted">{r.label}</span>
                <span className="tabular font-medium text-fg">{formatCurrency(r.value)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line/[0.15] pt-4">
            <span className="text-[13px] font-semibold text-fg">Total annual cost</span>
            <span className={cn('t-numeral text-[2.4rem]', win ? 'text-accent-400' : 'text-fg')}>{formatCurrency(d.total)}</span>
          </div>
          <p className="tabular mt-1 text-right text-[12px] text-fg-faint">{formatPercent(d.rate)} of income</p>
        </section>
      ))}
    </div>
  )
}

/* ── Salary sensitivity ─────────────────────────────────────────────────── */

export interface SensitivityPoint {
  salary: number
  savings: number
}

/** How the S-corp saving moves with officer salary, as a table with the best row marked. */
export function SensitivityTable({ points, current }: { points: SensitivityPoint[]; current: number }) {
  const best = points.reduce((b, p, i) => (p.savings > points[b]!.savings ? i : b), 0)
  const nearest = points.reduce((b, p, i) => (Math.abs(p.salary - current) < Math.abs(points[b]!.salary - current) ? i : b), 0)
  return (
    <div className="-mx-1 overflow-x-auto px-1" data-lenis-prevent>
      <table className="w-full min-w-[360px] text-[13.5px]">
        <caption className="sr-only">S corporation savings at different officer salaries</caption>
        <thead>
          <tr className="text-[11.5px] uppercase tracking-[0.1em] text-fg-faint">
            <th scope="col" className="pb-2 text-left font-semibold">Officer salary</th>
            <th scope="col" className="pb-2 text-right font-semibold">S-corp savings</th>
            <th scope="col" className="pb-2 text-right font-semibold">
              <span className="sr-only">Note</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={`${p.salary}-${i}`} className={cn('border-t border-line/[0.07]', i === nearest && 'bg-accent-500/[0.06]')}>
              <th scope="row" className="tabular py-2.5 pl-2 text-left font-normal text-fg-muted">{formatCurrency(p.salary)}</th>
              <td className={cn('tabular py-2.5 text-right font-medium', p.savings >= 0 ? 'text-fg' : 'text-serious')}>{formatSignedCurrency(p.savings)}</td>
              <td className="py-2.5 pr-2 text-right text-[11.5px] font-semibold text-accent-300">
                {i === nearest && 'Your salary'}
                {i === nearest && i === best && ' · '}
                {i === best && 'Best'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
