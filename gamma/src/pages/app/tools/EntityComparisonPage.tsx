import { Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { useId, useMemo } from 'react'
import { SensitivityTable, StructureLedger } from '@/components/tools/ledger'
import { ComparisonTable, DeductionFields, FilingStatusField } from '@/components/tools/shared'
import { HeroResult, InputGroup, ResultCard, StatTile, ToolShell } from '@/components/tools/ToolShell'
import { useToolState } from '@/components/tools/useToolState'
import { MoneyField, PercentField, Switch } from '@/components/ui/fields'
import { Callout } from '@/components/ui/primitives'
import { TOOLS_BY_ID } from '@/config/tools'
import { formatCurrency, formatPercent } from '@/lib/format'
import { compareEntities, ENTITY_COMPARISON_EXAMPLE, type EntityComparisonInput } from '@/lib/tax/entityComparison'
import { summarizeEntityComparison } from '@/services/summaries'

const BLANK: EntityComparisonInput = {
  ...ENTITY_COMPARISON_EXAMPLE,
  netProfit: 0,
  officerSalary: 0,
  otherIncome: 0,
  itemizedAmount: 0,
  isSSTB: false,
}

const ASSUMPTIONS = [
  'Net profit is business income before any owner compensation; the same profit is used for both structures.',
  'S corporation: employer and employee FICA on officer salary, payroll/admin costs, unemployment taxes and any entity-level state tax are deducted before the K-1.',
  '§199A is computed for both structures, including the W-2 wage limitation that officer salary can unlock above the threshold.',
  'Does not model state income tax, retirement plan contributions, health insurance, or built-in gains on conversion.',
  'Reasonable compensation is a facts-and-circumstances determination — the salary entered should be supportable.',
]

export default function EntityComparisonPage() {
  const tool = TOOLS_BY_ID['entity-comparison']
  const { value: v, setValue, update, loaded, reset, loadExample } = useToolState('entity-comparison', ENTITY_COMPARISON_EXAMPLE, BLANK)
  const r = useMemo(() => compareEntities(v), [v])
  const summary = useMemo(() => summarizeEntityComparison(r), [r])
  const sliderId = useId()
  const salaryPct = v.netProfit > 0 ? Math.round((v.officerSalary / v.netProfit) * 100) : 0

  const inputs = (
    <>
      <InputGroup title="Taxpayer">
        <FilingStatusField value={v.status} onChange={(s) => update('status', s)} />
        <MoneyField label="Other household income" value={v.otherIncome} onChange={(n) => update('otherIncome', n)} info="Spouse wages, investment and other income — affects brackets and the §199A threshold." />
        <DeductionFields year={v.year} status={v.status} mode={v.deductionMode} amount={v.itemizedAmount} onMode={(m) => update('deductionMode', m)} onAmount={(n) => update('itemizedAmount', n)} />
      </InputGroup>

      <InputGroup title="Business">
        <MoneyField label="Net business profit" value={v.netProfit} onChange={(n) => update('netProfit', n)} hint="Before any owner salary." />
        <MoneyField label="S-corp officer salary" value={v.officerSalary} onChange={(n) => update('officerSalary', n)} />
        <div>
          <div className="flex items-center justify-between text-[12.5px]">
            <label htmlFor={sliderId} className="text-fg-faint">
              Salary as share of profit
            </label>
            <span className="tabular font-semibold text-fg">{salaryPct}%</span>
          </div>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            step={1}
            value={salaryPct}
            disabled={v.netProfit <= 0}
            onChange={(e) => update('officerSalary', Math.round((Number(e.target.value) / 100) * v.netProfit))}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-line/10 accent-accent-500 disabled:opacity-40"
            style={{ background: `linear-gradient(to right, #2563eb ${salaryPct}%, rgba(15,23,42,0.1) ${salaryPct}%)` }}
          />
        </div>
        <Switch
          checked={v.isSSTB}
          onChange={(b) => update('isSSTB', b)}
          label="Specified service trade or business"
          description="Health, law, accounting, consulting, financial services, etc. — §199A phases out above the threshold."
        />
      </InputGroup>

      <InputGroup title="S corporation costs">
        <MoneyField label="Payroll & compliance costs" value={v.adminCosts} onChange={(n) => update('adminCosts', n)} info="Payroll service, Form 1120-S preparation, registered agent and similar annual costs." />
        <MoneyField label="Unemployment taxes (FUTA + SUTA)" value={v.unemploymentTaxes} onChange={(n) => update('unemploymentTaxes', n)} />
        <PercentField label="State entity-level tax rate" value={Number((v.stateEntityTaxRate * 100).toFixed(2))} onChange={(n) => update('stateEntityTaxRate', n / 100)} hint="e.g. 1.5% California S-corp franchise tax." />
      </InputGroup>
    </>
  )

  const favorable = r.savings >= 0
  const results = (
    <>
      <HeroResult
        label={favorable ? 'Estimated annual savings with an S corporation' : 'Estimated additional annual cost of an S corporation'}
        value={Math.abs(r.savings)}
        format={formatCurrency}
        sub={
          r.recommendation === 's-corp'
            ? 'An S-corp election appears favorable at this profit and salary level.'
            : r.recommendation === 'schedule-c'
              ? 'Remaining a sole proprietorship (Schedule C) costs less at this level.'
              : 'The two structures are roughly equivalent — non-tax factors should decide.'
        }
        aside={
          <div className="flex items-center gap-3 rounded-2xl border border-line/[0.08] bg-line/[0.02] px-4 py-3">
            {favorable ? <TrendingDown className="size-5 text-good-soft" aria-hidden /> : <TrendingUp className="size-5 text-serious" aria-hidden />}
            <div>
              <p className="text-[11.5px] text-fg-faint">Break-even profit</p>
              <p className="text-[15px] font-semibold text-fg">{r.breakevenProfit ? formatCurrency(r.breakevenProfit) : 'Not reached'}</p>
            </div>
          </div>
        }
      />

      {r.reasonableCompWarning && (
        <Callout tone="warning" title="Reasonable compensation">
          {r.reasonableCompWarning}
        </Callout>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Schedule C total" value={formatCurrency(r.scheduleC.total)} sub={`${formatPercent(r.scheduleC.effectiveRate)} of income`} />
        <StatTile label="S corporation total" value={formatCurrency(r.sCorp.total)} sub={`${formatPercent(r.sCorp.effectiveRate)} of income`} />
        <StatTile label="K-1 distributive share" value={formatCurrency(r.sCorp.k1Income)} sub="After salary & costs" />
        <StatTile label="QBI deduction" value={formatCurrency(r.sCorp.qbiDeduction)} sub={`vs ${formatCurrency(r.scheduleC.qbiDeduction)} Schedule C`} />
      </div>

      <ResultCard title="Total cost by structure" description="Each structure carries its own tax components — the same ones that stack as slabs in the 3D header.">
        <StructureLedger
          winner={r.recommendation === 's-corp' ? 'right' : r.recommendation === 'schedule-c' ? 'left' : null}
          left={{
            title: 'Schedule C',
            subtitle: 'Sole proprietor',
            rows: [
              { label: 'Federal income tax', value: r.scheduleC.incomeTax },
              { label: 'Self-employment tax', value: r.scheduleC.employmentTax },
            ],
            total: r.scheduleC.total,
            rate: r.scheduleC.effectiveRate,
          }}
          right={{
            title: 'S corporation',
            subtitle: 'Salary plus distributions',
            rows: [
              { label: 'Federal income tax', value: r.sCorp.incomeTax },
              { label: 'Payroll taxes', value: r.sCorp.employmentTax },
              { label: 'Entity & admin costs', value: r.sCorp.entityCosts },
            ],
            total: r.sCorp.total,
            rate: r.sCorp.effectiveRate,
          }}
        />
      </ResultCard>

      <ResultCard title="Side-by-side detail">
        <ComparisonTable
          caption="Schedule C versus S corporation line detail"
          aLabel="Schedule C"
          bLabel="S corp"
          rows={[
            { label: 'Adjusted gross income', a: r.scheduleC.agi, b: r.sCorp.agi },
            { label: 'QBI deduction', a: r.scheduleC.qbiDeduction, b: r.sCorp.qbiDeduction },
            { label: 'Taxable income', a: r.scheduleC.taxableIncome, b: r.sCorp.taxableIncome },
            { label: 'Federal income tax', a: r.scheduleC.incomeTax, b: r.sCorp.incomeTax, lowerIsBetter: true },
            { label: 'Self-employment tax', a: r.scheduleC.tax.selfEmploymentTax, b: 0, lowerIsBetter: true },
            { label: 'FICA — employee + employer', a: 0, b: r.sCorp.employeeFica + r.sCorp.employerFica, lowerIsBetter: true },
            { label: 'Additional Medicare Tax', a: r.scheduleC.tax.additionalMedicareTax, b: r.sCorp.tax.additionalMedicareTax, lowerIsBetter: true },
            { label: 'Unemployment taxes', a: 0, b: r.sCorp.employmentTax - r.sCorp.employeeFica - r.sCorp.employerFica - r.sCorp.tax.additionalMedicareTax, lowerIsBetter: true },
            { label: 'Admin & entity-level tax', a: 0, b: r.sCorp.entityCosts, lowerIsBetter: true },
            { label: 'Total annual cost', a: r.scheduleC.total, b: r.sCorp.total, emphasis: true, lowerIsBetter: true },
          ]}
        />
      </ResultCard>

      {r.sensitivity.length > 1 && (
        <ResultCard
          title="Savings by officer salary"
          description="How S-corp savings change as salary moves from 20% to 80% of profit. The highlighted row is the salary entered."
          action={<Scale className="size-5 text-accent-300" aria-hidden />}
        >
          <SensitivityTable points={r.sensitivity.map((p) => ({ salary: p.salary, savings: p.savings }))} current={v.officerSalary} />
        </ResultCard>
      )}
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
      stageData={{ schedC: [r.scheduleC.incomeTax, r.scheduleC.employmentTax], sCorp: [r.sCorp.employmentTax, r.sCorp.incomeTax, r.sCorp.entityCosts] }}
    />
  )
}
