import { CalendarDays, Check } from 'lucide-react'
import { useMemo } from 'react'
import { QuarterSlips } from '@/components/tools/ledger'
import { DeductionFields, FilingStatusField } from '@/components/tools/shared'
import { BreakdownTable, HeroResult, InputGroup, ResultCard, StatTile, ToolShell } from '@/components/tools/ToolShell'
import { useToolState } from '@/components/tools/useToolState'
import { MoneyField, StepperField, Switch } from '@/components/ui/fields'
import { Badge, Callout, type Tone } from '@/components/ui/primitives'
import { TOOLS_BY_ID } from '@/config/tools'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import { calculateEstimatedTax, ESTIMATED_TAX_EXAMPLE, type EstimatedTaxInput, type QuarterStatus } from '@/lib/tax/estimatedTax'
import { getYear } from '@/lib/tax/years'
import { summarizeEstimatedTax } from '@/services/summaries'

const BLANK: EstimatedTaxInput = {
  ...ESTIMATED_TAX_EXAMPLE,
  wages: 0,
  withholding: 0,
  selfEmploymentIncome: 0,
  interestAndOrdinaryDividends: 0,
  qualifiedDividends: 0,
  netCapitalGains: 0,
  otherIncome: 0,
  adjustments: 0,
  itemizedAmount: 0,
  childrenUnder17: 0,
  priorYearTax: 0,
  priorYearAgi: 0,
  priorYearFullYear: true,
  payments: [0, 0, 0, 0],
}

const STATUS: Record<QuarterStatus, { label: string; tone: Tone }> = {
  paid: { label: 'On track', tone: 'good' },
  short: { label: 'Short', tone: 'warning' },
  overdue: { label: 'Underpaid', tone: 'critical' },
  'due-soon': { label: 'Due soon', tone: 'warning' },
  upcoming: { label: 'Upcoming', tone: 'neutral' },
}

const ASSUMPTIONS = [
  'Required annual payment is the lesser of 90% of projected current-year tax or 100% of prior-year tax (110% when prior-year AGI exceeded $150,000, or $75,000 if married filing separately).',
  'Withholding is treated as paid evenly through the year; estimated payments are credited on the dates entered.',
  'Projected tax includes income tax, self-employment tax, Additional Medicare Tax and NIIT, less refundable credits.',
  'The annualized income installment method (Form 2210 Schedule AI) is not modeled.',
  'Self-employment income is treated as qualified business income from a non-specified service business.',
]

export default function EstimatedTaxPage() {
  const tool = TOOLS_BY_ID['estimated-tax']
  const { value: v, setValue, update, loaded, reset, loadExample } = useToolState('estimated-tax', ESTIMATED_TAX_EXAMPLE, BLANK)
  const r = useMemo(() => calculateEstimatedTax(v), [v])
  const summary = useMemo(() => summarizeEstimatedTax(r), [r])
  const dueDates = getYear(v.year).estimatedDueDates
  const t = r.tax

  const setPayment = (i: number, n: number) => {
    const next = [...v.payments] as EstimatedTaxInput['payments']
    next[i] = n
    update('payments', next)
  }

  const inputs = (
    <>
      <InputGroup title="Taxpayer">
        <FilingStatusField value={v.status} onChange={(s) => update('status', s)} />
        <StepperField label="Qualifying children under 17" value={v.childrenUnder17} onChange={(n) => update('childrenUnder17', n)} />
      </InputGroup>

      <InputGroup title={`${v.year} income projection`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="W-2 wages" value={v.wages} onChange={(n) => update('wages', n)} />
          <MoneyField label="Federal withholding" value={v.withholding} onChange={(n) => update('withholding', n)} info="Total federal income tax expected to be withheld for the year." />
          <MoneyField label="Net self-employment income" value={v.selfEmploymentIncome} onChange={(n) => update('selfEmploymentIncome', n)} />
          <MoneyField label="Interest & ordinary dividends" value={v.interestAndOrdinaryDividends} onChange={(n) => update('interestAndOrdinaryDividends', n)} />
          <MoneyField label="…of which qualified dividends" value={v.qualifiedDividends} onChange={(n) => update('qualifiedDividends', n)} />
          <MoneyField label="Net long-term capital gains" value={v.netCapitalGains} onChange={(n) => update('netCapitalGains', n)} allowNegative />
          <MoneyField label="Other income" value={v.otherIncome} onChange={(n) => update('otherIncome', n)} />
          <MoneyField label="Adjustments to income" value={v.adjustments} onChange={(n) => update('adjustments', n)} info="IRA, HSA, SE health insurance and other above-the-line items. ½ of SE tax is computed automatically." />
        </div>
        <DeductionFields year={v.year} status={v.status} mode={v.deductionMode} amount={v.itemizedAmount} onMode={(m) => update('deductionMode', m)} onAmount={(n) => update('itemizedAmount', n)} />
      </InputGroup>

      <InputGroup title={`${v.year - 1} return`} description="Drives the prior-year safe harbor.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="Total tax (Form 1040 line 24)" value={v.priorYearTax} onChange={(n) => update('priorYearTax', n)} />
          <MoneyField label="Adjusted gross income" value={v.priorYearAgi} onChange={(n) => update('priorYearAgi', n)} />
        </div>
        <Switch checked={v.priorYearFullYear} onChange={(b) => update('priorYearFullYear', b)} label="Prior-year return covered 12 months" description="If not, only the 90% current-year safe harbor applies." />
      </InputGroup>

      <InputGroup title="Payments made" description="Estimated payments already sent for this tax year.">
        <div className="grid grid-cols-2 gap-4">
          {dueDates.map((d, i) => (
            <MoneyField key={d} label={`Q${i + 1} · ${formatDate(d, 'monthDay')}`} value={v.payments[i] ?? 0} onChange={(n) => setPayment(i, n)} />
          ))}
        </div>
      </InputGroup>
    </>
  )

  const results = (
    <>
      <HeroResult
        label="Required estimated payment per quarter"
        value={r.perQuarter}
        format={formatCurrency}
        sub={
          r.belowThousandRule ? (
            'Projected balance after withholding is under $1,000 — no estimated payments required.'
          ) : (
            <>
              {formatCurrency(r.requiredEstimates)} for the year under the{' '}
              <span className="font-semibold text-fg">{r.safeHarborBasis === 'prior' ? `${Math.round(r.priorYearPct * 100)}% prior-year` : '90% current-year'}</span> safe harbor
            </>
          )
        }
        aside={
          r.nextDue && (
            <div className="flex items-center gap-3 rounded-2xl border border-accent-500/25 bg-accent-500/[0.06] px-4 py-3">
              <CalendarDays className="size-5 text-accent-300" aria-hidden />
              <div>
                <p className="text-[11.5px] text-fg-faint">Next due · Q{r.nextDue.quarter}</p>
                <p className="text-[15px] font-semibold text-fg">{formatDate(r.nextDue.dueDate, 'long')}</p>
              </div>
            </div>
          )
        }
      />

      {r.belowThousandRule && (
        <Callout tone="good" title="No estimated tax penalty expected">
          Withholding covers all but {formatCurrency(Math.max(0, r.projectedTax - r.withholding))} of projected tax.
        </Callout>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Projected total tax" value={formatCurrency(r.projectedTax)} sub={`${formatPercent(t.effectiveRate)} effective rate`} />
        <StatTile label="Withholding" value={formatCurrency(r.withholding)} sub="Treated as paid evenly" />
        <StatTile label="Required annual payment" value={formatCurrency(r.requiredAnnualPayment)} sub="Withholding + estimates" />
        <StatTile
          label="Balance due at filing"
          value={formatCurrency(Math.max(0, r.balanceDueIfOnPlan))}
          sub={r.balanceDueIfOnPlan > 0 ? `Pay ${formatCurrency(r.fullPayPerQuarter)}/qtr to owe $0` : 'Refund or $0 expected'}
          tone={r.balanceDueIfOnPlan > 0 ? 'warning' : 'good'}
        />
      </div>

      <ResultCard title="Safe harbor options" description="The lower option is the minimum that avoids an underpayment penalty.">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { key: 'current', label: '90% of current-year tax', value: r.currentYearSafeHarbor, available: true },
            {
              key: 'prior',
              label: `${Math.round(r.priorYearPct * 100)}% of prior-year tax`,
              value: r.priorYearSafeHarbor ?? 0,
              available: r.priorYearSafeHarbor !== null,
            },
          ].map((o) => {
            const selected = o.available && r.safeHarborBasis === o.key
            return (
              <div key={o.key} className={cn('rounded-2xl border p-4', selected ? 'border-accent-500/40 bg-accent-500/[0.06]' : 'border-line/[0.07] bg-line/[0.02]')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] text-fg-subtle">{o.label}</p>
                  {selected && (
                    <Badge tone="accent" withIcon={false}>
                      <Check className="size-3" aria-hidden /> Applies
                    </Badge>
                  )}
                </div>
                <p className="mt-2 font-display text-2xl font-semibold text-fg">{o.available ? formatCurrency(o.value) : 'Not available'}</p>
              </div>
            )
          })}
        </div>
      </ResultCard>

      <ResultCard title="Quarterly schedule" description="Four payment sheets, one per due date. A sheet rises in the 3D header as its quarter is covered.">
        <QuarterSlips slips={r.schedule.map((q) => ({ quarter: q.quarter, dueDate: q.dueDate, required: q.required, paid: q.paid, status: STATUS[q.status] }))} />
      </ResultCard>

      <ResultCard title="Projection detail" description="Federal projection from the shared Tapreco engine.">
        <BreakdownTable
          caption="Projected federal tax detail"
          rows={[
            { label: 'Total income', value: formatCurrency(t.totalIncome) },
            { label: 'Adjustments incl. ½ SE tax', value: `−${formatCurrency(t.totalIncome - t.agi)}` },
            { label: 'Adjusted gross income', value: formatCurrency(t.agi), kind: 'subtotal' },
            { label: `${t.deductionType === 'itemized' ? 'Itemized' : 'Standard'} deduction`, value: `−${formatCurrency(t.deduction)}` },
            { label: 'QBI deduction (§199A)', value: `−${formatCurrency(t.qbiDeduction)}` },
            { label: 'Taxable income', value: formatCurrency(t.taxableIncome), kind: 'subtotal' },
            { label: 'Regular income tax', value: formatCurrency(t.regularTax), hint: `${formatPercent(t.marginal.rate, 0)} bracket` },
            { label: 'Nonrefundable credits', value: `−${formatCurrency(t.credits.nonrefundableTotal)}`, kind: 'credit' },
            { label: 'Self-employment tax', value: formatCurrency(t.selfEmploymentTax) },
            { label: 'Additional Medicare Tax', value: formatCurrency(t.additionalMedicareTax), kind: 'muted' },
            { label: 'Net investment income tax', value: formatCurrency(t.netInvestmentIncomeTax), kind: 'muted' },
            { label: 'Refundable credits', value: `−${formatCurrency(t.credits.refundableChildTax)}`, kind: 'credit' },
            { label: 'Projected tax to cover', value: formatCurrency(r.projectedTax), kind: 'total' },
          ]}
        />
      </ResultCard>
    </>
  )

  return (
    <ToolShell
      tool={tool}
      year={v.year}
      onYearChange={(y) => setValue((p) => ({ ...p, year: y }))}
      inputs={inputs}
      results={results}
      summary={summary}
      input={v}
      onLoadExample={loadExample}
      onReset={reset}
      assumptions={ASSUMPTIONS}
      loaded={loaded}
      stageData={{ lift: r.schedule.map((q) => (q.required > 0 ? Math.min(1, q.paid / q.required) : 0)) }}
    />
  )
}
