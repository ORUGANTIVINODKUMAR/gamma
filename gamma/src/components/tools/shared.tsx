import type { ReactNode } from 'react'
import { MoneyField, Segmented, SelectField } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { formatCurrency, formatPercent, formatSignedCurrency } from '@/lib/format'
import { FILING_STATUS_LABELS, getYear, type FilingStatus, type TaxYear } from '@/lib/tax/years'

export const FILING_STATUS_OPTIONS = (Object.keys(FILING_STATUS_LABELS) as FilingStatus[]).map((s) => ({ value: s, label: FILING_STATUS_LABELS[s] }))

export function FilingStatusField({ value, onChange }: { value: FilingStatus; onChange: (s: FilingStatus) => void }) {
  return <SelectField label="Filing status" value={value} onChange={onChange} options={FILING_STATUS_OPTIONS} />
}

/** Standard vs itemized with the year's standard deduction shown inline. */
export function DeductionFields({
  year,
  status,
  mode,
  amount,
  onMode,
  onAmount,
}: {
  year: TaxYear
  status: FilingStatus
  mode: 'standard' | 'itemized'
  amount: number
  onMode: (m: 'standard' | 'itemized') => void
  onAmount: (n: number) => void
}) {
  const std = getYear(year).standardDeduction[status]
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-fg-muted">Deductions</span>
        <Segmented
          size="sm"
          label="Deduction method"
          value={mode}
          onChange={onMode}
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'itemized', label: 'Itemized' },
          ]}
        />
      </div>
      {mode === 'standard' ? (
        <p className="text-[12.5px] text-fg-faint">
          {year} standard deduction for {FILING_STATUS_LABELS[status].toLowerCase()}: <span className="font-semibold text-fg-subtle">{formatCurrency(std)}</span>
        </p>
      ) : (
        <MoneyField label="Total itemized deductions" value={amount} onChange={onAmount} hint="After the SALT cap and AGI floors." />
      )}
    </div>
  )
}

/* ── Comparison table (A vs B with difference) ─────────────────────────── */

export interface ComparisonRow {
  label: string
  a: number
  b: number
  format?: 'currency' | 'percent'
  emphasis?: boolean
  /** When lower B is better (taxes), a negative diff is good. */
  lowerIsBetter?: boolean
}

export function ComparisonTable({ rows, aLabel, bLabel, caption }: { rows: ComparisonRow[]; aLabel: string; bLabel: string; caption: string }) {
  const fmt = (r: ComparisonRow, v: number) => (r.format === 'percent' ? formatPercent(v) : formatCurrency(v))
  return (
    <div className="-mx-1 overflow-x-auto px-1" data-lenis-prevent>
      <table className="w-full min-w-[460px] text-[13.5px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-[11.5px] uppercase tracking-[0.1em] text-fg-faint">
            <th scope="col" className="pb-3 text-left font-semibold">Line</th>
            <th scope="col" className="pb-3 text-right font-semibold">{aLabel}</th>
            <th scope="col" className="pb-3 text-right font-semibold">{bLabel}</th>
            <th scope="col" className="pb-3 text-right font-semibold">Difference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const diff = r.b - r.a
            const good = r.lowerIsBetter ? diff < -0.5 : diff > 0.5
            const bad = r.lowerIsBetter ? diff > 0.5 : diff < -0.5
            return (
              <tr key={r.label} className={cn('border-t border-line/[0.05]', r.emphasis && 'border-line/[0.12]')}>
                <th scope="row" className={cn('py-2.5 pr-3 text-left font-normal', r.emphasis ? 'font-semibold text-fg' : 'text-fg-subtle')}>
                  {r.label}
                </th>
                <td className={cn('tabular py-2.5 text-right', r.emphasis ? 'font-semibold text-fg' : 'text-fg-muted')}>{fmt(r, r.a)}</td>
                <td className={cn('tabular py-2.5 text-right', r.emphasis ? 'font-semibold text-fg' : 'text-fg-muted')}>{fmt(r, r.b)}</td>
                <td className={cn('tabular py-2.5 text-right', good ? 'text-good-soft' : bad ? 'text-serious' : 'text-fg-faint')}>
                  {r.format === 'percent' ? `${diff >= 0 ? '+' : '−'}${formatPercent(Math.abs(diff))}` : formatSignedCurrency(diff)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function TaxChangeBadge({ change }: { change: number }) {
  if (Math.abs(change) < 0.5) return <span className="tabular text-[13px] text-fg-faint">$0</span>
  const saves = change < 0
  return (
    <span className={cn('tabular inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12.5px] font-semibold', saves ? 'border-good/35 bg-good/10 text-good-soft' : 'border-serious/35 bg-serious/10 text-serious')}>
      {saves ? 'Saves ' : 'Costs '}
      {formatCurrency(Math.abs(change))}
    </span>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] leading-relaxed text-fg-faint">{children}</p>
}
