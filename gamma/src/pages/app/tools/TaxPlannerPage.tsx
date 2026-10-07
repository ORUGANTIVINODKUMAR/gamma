import { useMemo } from 'react'
import { BracketLadder, Bridge } from '@/components/tools/ledger'
import { ComparisonTable, FilingStatusField, TaxChangeBadge } from '@/components/tools/shared'
import { HeroResult, InputGroup, ResultCard, StatTile, ToolShell } from '@/components/tools/ToolShell'
import { useToolState } from '@/components/tools/useToolState'
import { MoneyField, SelectField, StepperField, Switch } from '@/components/ui/fields'
import { TOOLS_BY_ID } from '@/config/tools'
import { cn } from '@/lib/cn'
import { formatCurrency, formatPercent } from '@/lib/format'
import { EMPTY_ITEMIZED, type ItemizedInput } from '@/lib/tax/engine'
import { planTaxes, TAX_PLANNER_EXAMPLE, type StrategyKey, type TaxPlannerInput } from '@/lib/tax/taxPlanner'
import { summarizeTaxPlanner } from '@/services/summaries'

const BLANK: TaxPlannerInput = {
  ...TAX_PLANNER_EXAMPLE,
  taxpayers65Plus: 0,
  age50Plus: false,
  childrenUnder17: 0,
  otherDependents: 0,
  wages: 0,
  current401k: 0,
  selfEmploymentIncome: 0,
  taxableInterest: 0,
  ordinaryDividends: 0,
  qualifiedDividends: 0,
  shortTermGains: 0,
  longTermGains: 0,
  retirementDistributions: 0,
  socialSecurityBenefits: 0,
  otherIncome: 0,
  hsaCoverage: 'none',
  currentHsa: 0,
  otherAdjustments: 0,
  itemized: EMPTY_ITEMIZED,
  otherCredits: 0,
  withholding: 0,
  estimatedPayments: 0,
  strategies: {
    max401k: false,
    maxHsa: false,
    charitableBunching: false,
    charitableBunchingAmount: 0,
    lossHarvesting: false,
    lossHarvestingAmount: 0,
    rothConversion: false,
    rothConversionAmount: 0,
  },
}

const AMOUNT_KEY: Partial<Record<StrategyKey, 'charitableBunchingAmount' | 'lossHarvestingAmount' | 'rothConversionAmount'>> = {
  charitableBunching: 'charitableBunchingAmount',
  lossHarvesting: 'lossHarvestingAmount',
  rothConversion: 'rothConversionAmount',
}

const SHORT: Record<StrategyKey, string> = {
  max401k: '401(k)',
  maxHsa: 'HSA',
  charitableBunching: 'Gifts',
  lossHarvesting: 'Losses',
  rothConversion: 'Roth',
}

const ASSUMPTIONS = [
  'Wages are W-2 box 1 (already net of current pre-tax deferrals). Additional 401(k) deferrals reduce box 1 wages.',
  'Deduction is the larger of standard (including 65+ and OBBBA senior deductions) and itemized; SALT reflects the OBBBA cap and phase-down.',
  'Each strategy’s impact is measured alone against the baseline; the projection applies all enabled strategies together, so the combined total can differ from the sum.',
  'HSA contributions assume eligibility (HDHP coverage). Loss harvesting assumes the losses are short-term and not wash sales.',
  'AMT, state tax and the 2026 limitation on itemized deductions for the 37% bracket are not modeled.',
]

export default function TaxPlannerPage() {
  const tool = TOOLS_BY_ID['tax-planner']
  const { value: v, setValue, update, loaded, reset, loadExample } = useToolState('tax-planner', TAX_PLANNER_EXAMPLE, BLANK)
  const r = useMemo(() => planTaxes(v), [v])
  const summary = useMemo(() => summarizeTaxPlanner(r), [r])
  const it = v.itemized

  const setItemized = <K extends keyof ItemizedInput>(k: K, n: number) => update('itemized', { ...it, [k]: n })
  const setStrategy = (k: keyof TaxPlannerInput['strategies'], val: boolean | number) => update('strategies', { ...v.strategies, [k]: val })

  const inputs = (
    <>
      <InputGroup title="Household">
        <FilingStatusField value={v.status} onChange={(s) => update('status', s)} />
        <div className="grid grid-cols-2 gap-4">
          <StepperField label="Children under 17" value={v.childrenUnder17} onChange={(n) => update('childrenUnder17', n)} />
          <StepperField label="Other dependents" value={v.otherDependents} onChange={(n) => update('otherDependents', n)} />
          <StepperField label="Taxpayers 65+" value={v.taxpayers65Plus} onChange={(n) => update('taxpayers65Plus', n)} max={v.status === 'mfj' ? 2 : 1} />
        </div>
        <Switch checked={v.age50Plus} onChange={(b) => update('age50Plus', b)} label="Age 50 or older" description="Enables 401(k) catch-up contributions." />
      </InputGroup>

      <InputGroup title="Income">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="W-2 wages (box 1)" value={v.wages} onChange={(n) => update('wages', n)} />
          <MoneyField label="401(k) deferrals so far" value={v.current401k} onChange={(n) => update('current401k', n)} />
          <MoneyField label="Self-employment income" value={v.selfEmploymentIncome} onChange={(n) => update('selfEmploymentIncome', n)} />
          <MoneyField label="Taxable interest" value={v.taxableInterest} onChange={(n) => update('taxableInterest', n)} />
          <MoneyField label="Ordinary dividends" value={v.ordinaryDividends} onChange={(n) => update('ordinaryDividends', n)} />
          <MoneyField label="…of which qualified" value={v.qualifiedDividends} onChange={(n) => update('qualifiedDividends', n)} />
          <MoneyField label="Net short-term gains" value={v.shortTermGains} onChange={(n) => update('shortTermGains', n)} allowNegative />
          <MoneyField label="Net long-term gains" value={v.longTermGains} onChange={(n) => update('longTermGains', n)} allowNegative />
          <MoneyField label="Taxable retirement income" value={v.retirementDistributions} onChange={(n) => update('retirementDistributions', n)} />
          <MoneyField label="Social Security benefits" value={v.socialSecurityBenefits} onChange={(n) => update('socialSecurityBenefits', n)} />
          <MoneyField label="Other income" value={v.otherIncome} onChange={(n) => update('otherIncome', n)} />
        </div>
      </InputGroup>

      <InputGroup title="Adjustments">
        <SelectField
          label="HSA coverage"
          value={v.hsaCoverage}
          onChange={(c) => update('hsaCoverage', c)}
          options={[
            { value: 'none', label: 'Not HSA-eligible' },
            { value: 'self', label: 'Self-only HDHP' },
            { value: 'family', label: 'Family HDHP' },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="HSA contributions so far" value={v.currentHsa} onChange={(n) => update('currentHsa', n)} />
          <MoneyField label="Other adjustments" value={v.otherAdjustments} onChange={(n) => update('otherAdjustments', n)} />
        </div>
      </InputGroup>

      <InputGroup title="Itemized deductions" description="Used when larger than the standard deduction.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="State & local taxes" value={it.stateLocalTaxes} onChange={(n) => setItemized('stateLocalTaxes', n)} info="Income (or sales) plus property taxes, before the SALT cap." />
          <MoneyField label="Mortgage interest" value={it.mortgageInterest} onChange={(n) => setItemized('mortgageInterest', n)} />
          <MoneyField label="Charitable — cash" value={it.charitableCash} onChange={(n) => setItemized('charitableCash', n)} />
          <MoneyField label="Charitable — non-cash" value={it.charitableNonCash} onChange={(n) => setItemized('charitableNonCash', n)} />
          <MoneyField label="Medical expenses" value={it.medical} onChange={(n) => setItemized('medical', n)} info="Before the 7.5% of AGI floor." />
          <MoneyField label="Other itemized" value={it.other} onChange={(n) => setItemized('other', n)} />
        </div>
      </InputGroup>

      <InputGroup title="Credits & payments">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="Other nonrefundable credits" value={v.otherCredits} onChange={(n) => update('otherCredits', n)} />
          <MoneyField label="Federal withholding" value={v.withholding} onChange={(n) => update('withholding', n)} />
          <MoneyField label="Estimated payments" value={v.estimatedPayments} onChange={(n) => update('estimatedPayments', n)} />
        </div>
      </InputGroup>
    </>
  )

  const saved = Math.max(0, -r.combinedChange)
  const refund = r.plannedRefund
  const enabled = r.strategies.filter((s) => s.enabled)

  const results = (
    <>
      <HeroResult
        label="Projected federal tax with strategies"
        value={r.planned.totalTax}
        format={formatCurrency}
        tone="neutral"
        sub={
          r.combinedChange < -0.5 ? (
            <>
              Down from {formatCurrency(r.baseline.totalTax)} —{' '}
              <span className="font-semibold text-accent-200">{formatCurrency(saved)} saved</span> by {enabled.length} strateg{enabled.length === 1 ? 'y' : 'ies'}
            </>
          ) : r.combinedChange > 0.5 ? (
            <>Up {formatCurrency(r.combinedChange)} from baseline — enabled strategies add tax this year</>
          ) : (
            'Enable strategies below to model savings.'
          )
        }
        aside={
          <div className={cn('rounded-2xl border px-4 py-3', refund >= 0 ? 'border-good/30 bg-good/[0.06]' : 'border-warning/30 bg-warning/[0.06]')}>
            <p className="text-[11.5px] text-fg-faint">{refund >= 0 ? 'Projected refund' : 'Projected balance due'}</p>
            <p className="text-[19px] font-semibold text-fg">{formatCurrency(Math.abs(refund))}</p>
            <p className="text-[11px] text-fg-faint">on {formatCurrency(r.payments)} of payments</p>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Effective rate" value={formatPercent(r.planned.effectiveRate)} sub={`was ${formatPercent(r.baseline.effectiveRate)}`} />
        <StatTile label="Marginal bracket" value={formatPercent(r.planned.marginal.rate, 0)} sub="Ordinary income" />
        <StatTile label={`${r.planned.deductionType === 'itemized' ? 'Itemized' : 'Standard'} deduction`} value={formatCurrency(r.planned.deduction)} sub={r.planned.deductionType === 'itemized' ? `vs ${formatCurrency(r.planned.standardDeduction)} standard` : `vs ${formatCurrency(r.planned.itemizedDeduction)} itemized`} />
        <StatTile label="Adjusted gross income" value={formatCurrency(r.planned.agi)} sub={`was ${formatCurrency(r.baseline.agi)}`} />
      </div>

      <ResultCard title="Strategies" description="Toggle strategies to build the plan. Each badge shows that strategy’s impact on its own.">
        <ul className="flex flex-col gap-3">
          {r.strategies.map((s) => {
            const amountKey = AMOUNT_KEY[s.key]
            return (
              <li key={s.key} className={cn('rounded-2xl border p-4 transition-colors duration-300', s.enabled ? 'border-accent-500/30 bg-accent-500/[0.045]' : 'border-line/[0.06] bg-line/[0.015]')}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <Switch
                    className="flex-1"
                    checked={s.enabled}
                    onChange={(b) => setStrategy(s.key, b)}
                    label={<span className="text-[14px] font-semibold text-fg">{s.label}</span>}
                    description={s.description}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pl-0 sm:pl-0">
                  {amountKey ? (
                    <div className="w-full max-w-[220px]">
                      <MoneyField label="Amount" value={v.strategies[amountKey]} onChange={(n) => setStrategy(amountKey, n)} />
                    </div>
                  ) : (
                    <span className="text-[12.5px] text-fg-faint">
                      Additional contribution: <span className="tabular font-semibold text-fg-subtle">{formatCurrency(s.amount)}</span>
                    </span>
                  )}
                  <TaxChangeBadge change={s.taxChange} />
                </div>
              </li>
            )
          })}
        </ul>
      </ResultCard>

      {enabled.length > 0 && (
        <ResultCard title="Baseline to plan" description="How each enabled strategy moves total federal tax.">
          <Bridge start={{ label: 'Baseline', value: r.baseline.totalTax }} steps={enabled.map((s) => ({ label: SHORT[s.key], delta: s.taxChange }))} endLabel="Plan" />
          {Math.abs(enabled.reduce((a, s) => a + s.taxChange, 0) - r.combinedChange) > 1 && (
            <p className="mt-3 text-[12px] text-fg-faint">
              Strategies interact, so the combined plan ({formatCurrency(r.planned.totalTax)}) differs slightly from the sum of individual impacts.
            </p>
          )}
        </ResultCard>
      )}

      <ResultCard title="Bracket position" description="Where planned taxable income sits in the ordinary brackets — useful for sizing Roth conversions.">
        <BracketLadder year={v.year} status={v.status} taxable={r.planned.taxableIncome} />
      </ResultCard>

      <ResultCard title="Projection detail">
        <ComparisonTable
          caption="Baseline versus planned federal projection"
          aLabel="Baseline"
          bLabel="Plan"
          rows={[
            { label: 'Total income', a: r.baseline.totalIncome, b: r.planned.totalIncome },
            { label: 'Adjusted gross income', a: r.baseline.agi, b: r.planned.agi },
            { label: 'Deduction', a: r.baseline.deduction + r.baseline.seniorDeduction + r.baseline.nonItemizerCharitable, b: r.planned.deduction + r.planned.seniorDeduction + r.planned.nonItemizerCharitable },
            { label: 'QBI deduction', a: r.baseline.qbiDeduction, b: r.planned.qbiDeduction },
            { label: 'Taxable income', a: r.baseline.taxableIncome, b: r.planned.taxableIncome },
            { label: 'Regular income tax', a: r.baseline.regularTax, b: r.planned.regularTax, lowerIsBetter: true },
            { label: 'Credits', a: r.baseline.credits.nonrefundableTotal, b: r.planned.credits.nonrefundableTotal },
            { label: 'SE + Medicare + NIIT', a: r.baseline.selfEmploymentTax + r.baseline.additionalMedicareTax + r.baseline.netInvestmentIncomeTax, b: r.planned.selfEmploymentTax + r.planned.additionalMedicareTax + r.planned.netInvestmentIncomeTax, lowerIsBetter: true },
            { label: 'Total federal tax', a: r.baseline.totalTax, b: r.planned.totalTax, emphasis: true, lowerIsBetter: true },
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
    />
  )
}
