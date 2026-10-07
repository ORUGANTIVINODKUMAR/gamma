import { useId, useMemo } from 'react'
import { Ledger, LayerList } from '@/components/tools/ledger'
import { ComparisonTable, DeductionFields, FilingStatusField } from '@/components/tools/shared'
import { HeroResult, InputGroup, ResultCard, StatTile, ToolShell } from '@/components/tools/ToolShell'
import { useToolState } from '@/components/tools/useToolState'
import { Field, MoneyField, Segmented, Switch, TextInput } from '@/components/ui/fields'
import { Callout } from '@/components/ui/primitives'
import { TOOLS_BY_ID } from '@/config/tools'
import { formatCompactCurrency, formatCurrency, formatPercent, formatSignedCurrency } from '@/lib/format'
import { calculateMutualFundTax, MUTUAL_FUND_EXAMPLE, type MutualFundInput } from '@/lib/tax/mutualFund'
import { summarizeMutualFund } from '@/services/summaries'

const BLANK: MutualFundInput = {
  ...MUTUAL_FUND_EXAMPLE,
  fundName: '',
  fundValue: 0,
  otherIncome: 0,
  itemizedAmount: 0,
  ordinaryDividends: 0,
  qualifiedDividends: 0,
  capitalGainDistributions: 0,
  section199ADividends: 0,
  nondividendDistributions: 0,
  foreignTaxPaid: 0,
  exemptInterestDividends: 0,
  sharesSold: false,
  saleProceeds: 0,
  costBasis: 0,
  holdingPeriod: 'long',
}

const ASSUMPTIONS = [
  'Incremental tax is measured by computing the full federal return with and without the fund, then attributing the difference in a fixed order (ordinary → §199A → qualified → long-term → credit).',
  'Other household income is treated as ordinary, non-wage income; no AMT or state tax.',
  'Section 199A dividends receive the 20% deduction subject to the taxable-income limitation.',
  'Foreign tax credit is allowed up to regular tax; amounts above the de minimis threshold may require Form 1116 and could be limited.',
  'Unrecaptured §1250 and collectibles gains (25% / 28%) are not separated from long-term gains.',
]

export default function MutualFundPage() {
  const tool = TOOLS_BY_ID['mutual-fund']
  const { value: v, setValue, update, loaded, reset, loadExample } = useToolState('mutual-fund', MUTUAL_FUND_EXAMPLE, BLANK)
  const r = useMemo(() => calculateMutualFundTax(v), [v])
  const summary = useMemo(() => summarizeMutualFund(r), [r])
  const fundNameId = useId()

  const composition = [
    { label: 'Long-term gains', value: r.longTermIncome },
    { label: 'Qualified dividends', value: r.qualifiedIncome },
    { label: 'Ordinary-rate income', value: Math.max(0, r.ordinaryRateIncome) },
    { label: 'Tax-exempt dividends', value: r.exemptIncome },
  ]

  const inputs = (
    <>
      <InputGroup title="Taxpayer">
        <FilingStatusField value={v.status} onChange={(s) => update('status', s)} />
        <MoneyField
          label="Other household income"
          value={v.otherIncome}
          onChange={(n) => update('otherIncome', n)}
          info="Wages, business and other income excluding this fund. Determines the brackets the fund income stacks on."
        />
        <DeductionFields
          year={v.year}
          status={v.status}
          mode={v.deductionMode}
          amount={v.itemizedAmount}
          onMode={(m) => update('deductionMode', m)}
          onAmount={(n) => update('itemizedAmount', n)}
        />
      </InputGroup>

      <InputGroup title="Fund">
        <Field label="Fund name" htmlFor={fundNameId} optional>
          <TextInput id={fundNameId} value={v.fundName} onChange={(e) => update('fundName', e.target.value)} placeholder="e.g. Large-Cap Growth Fund" />
        </Field>
        <MoneyField label="Fund value at start of year" value={v.fundValue} onChange={(n) => update('fundValue', n)} hint="Optional — enables the tax-drag metric." />
      </InputGroup>

      <InputGroup title="Form 1099-DIV" description="Enter amounts exactly as reported by the fund.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="1a · Total ordinary dividends" value={v.ordinaryDividends} onChange={(n) => update('ordinaryDividends', n)} />
          <MoneyField label="1b · Qualified dividends" value={v.qualifiedDividends} onChange={(n) => update('qualifiedDividends', n)} />
          <MoneyField label="2a · Capital gain distributions" value={v.capitalGainDistributions} onChange={(n) => update('capitalGainDistributions', n)} />
          <MoneyField label="3 · Nondividend distributions" value={v.nondividendDistributions} onChange={(n) => update('nondividendDistributions', n)} info="Return of capital — not taxed now, but reduces cost basis." />
          <MoneyField label="5 · Section 199A dividends" value={v.section199ADividends} onChange={(n) => update('section199ADividends', n)} />
          <MoneyField label="7 · Foreign tax paid" value={v.foreignTaxPaid} onChange={(n) => update('foreignTaxPaid', n)} />
          <MoneyField label="12 · Exempt-interest dividends" value={v.exemptInterestDividends} onChange={(n) => update('exemptInterestDividends', n)} />
        </div>
        {v.qualifiedDividends > v.ordinaryDividends && (
          <Callout tone="warning">Qualified dividends (1b) can’t exceed total ordinary dividends (1a); the excess is ignored.</Callout>
        )}
      </InputGroup>

      <InputGroup title="Shares redeemed">
        <Switch checked={v.sharesSold} onChange={(b) => update('sharesSold', b)} label="Shares were sold this year" description="Include gains or losses from redemptions (Form 1099-B)." />
        {v.sharesSold && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <MoneyField label="Sale proceeds" value={v.saleProceeds} onChange={(n) => update('saleProceeds', n)} />
              <MoneyField label="Cost basis" value={v.costBasis} onChange={(n) => update('costBasis', n)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-fg-muted">Holding period</span>
              <Segmented
                size="sm"
                label="Holding period"
                value={v.holdingPeriod}
                onChange={(h) => update('holdingPeriod', h)}
                options={[
                  { value: 'long', label: 'Long-term' },
                  { value: 'short', label: 'Short-term' },
                ]}
              />
            </div>
          </>
        )}
      </InputGroup>
    </>
  )

  const results = (
    <>
      <HeroResult
        label={`Incremental federal tax${v.fundName ? ` · ${v.fundName}` : ''}`}
        value={r.incrementalTax}
        format={formatCurrency}
        sub={
          <>
            {formatPercent(r.effectiveRateOnFund)} effective rate on {formatCurrency(r.taxableFundIncome)} of taxable fund income
          </>
        }
        aside={
          <div className="grid grid-cols-2 gap-3 md:w-64">
            <div className="rounded-xl border border-line/[0.07] bg-line/[0.02] p-3">
              <p className="text-[11.5px] text-fg-faint">Tax drag</p>
              <p className="mt-0.5 text-[17px] font-semibold text-fg">{r.taxDrag === null ? '—' : formatPercent(r.taxDrag, 1)}</p>
            </div>
            <div className="rounded-xl border border-line/[0.07] bg-line/[0.02] p-3">
              <p className="text-[11.5px] text-fg-faint">After-tax cash</p>
              <p className="mt-0.5 text-[17px] font-semibold text-fg">{formatCompactCurrency(r.afterTaxCashFlow)}</p>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile label="Total distributions" value={formatCurrency(r.totalDistributions)} sub="1a + 2a + 3 + 12" />
        <StatTile label="Sale gain / (loss)" value={formatSignedCurrency(r.saleGain)} sub={v.sharesSold ? (v.holdingPeriod === 'long' ? 'Long-term' : 'Short-term') : 'No redemptions'} />
        <StatTile label="NIIT from this fund" value={formatCurrency(r.niitIncrement)} sub={r.niitIncrement > 0 ? '3.8% net investment income tax' : 'Below NIIT threshold'} tone={r.niitIncrement > 0 ? 'warning' : undefined} />
        <StatTile label="Marginal bracket" value={formatPercent(r.withFund.marginal.rate, 0)} sub={`was ${formatPercent(r.baseline.marginal.rate, 0)} without fund`} />
      </div>

      <ResultCard title="Where the tax comes from" description="Incremental federal tax attributed to each income character. Negative values reduce tax.">
        <Ledger
          caption="Incremental federal tax by income character"
          rows={r.steps.map((s) => ({
            label: s.label,
            note: `${s.character}${s.income > 0 ? ` · on ${formatCurrency(s.income)}` : ''}`,
            value: formatSignedCurrency(s.tax),
            tone: s.tax < 0 ? 'credit' : undefined,
          }))}
          totalLabel="Total incremental tax"
          total={formatCurrency(r.incrementalTax)}
        />
      </ResultCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <ResultCard title="Income by tax character" description={`${formatCompactCurrency(composition.reduce((s, c) => s + c.value, 0))} of fund income, in layers.`}>
          <LayerList items={composition} caption="Fund income by tax character" />
        </ResultCard>
        <ResultCard title="Household return impact">
          <ComparisonTable
            caption="Household federal return with and without the fund"
            aLabel="Without fund"
            bLabel="With fund"
            rows={[
              { label: 'Adjusted gross income', a: r.baseline.agi, b: r.withFund.agi },
              { label: 'Taxable income', a: r.baseline.taxableIncome, b: r.withFund.taxableIncome },
              { label: 'Regular income tax', a: r.baseline.regularTax, b: r.withFund.regularTax, lowerIsBetter: true },
              { label: 'Net investment income tax', a: r.baseline.netInvestmentIncomeTax, b: r.withFund.netInvestmentIncomeTax, lowerIsBetter: true },
              { label: 'Total federal tax', a: r.baseline.totalTax, b: r.withFund.totalTax, emphasis: true, lowerIsBetter: true },
            ]}
          />
        </ResultCard>
      </div>

      {(r.returnOfCapital > 0 || r.ftcExceedsDeMinimis || r.capitalLossCarryforward > 0) && (
        <div className="flex flex-col gap-3">
          {r.returnOfCapital > 0 && (
            <Callout tone="accent" title="Return of capital">
              {formatCurrency(r.returnOfCapital)} of nondividend distributions reduce cost basis{v.sharesSold ? ` to ${formatCurrency(r.adjustedBasisAfterRoc)}` : ''}. Track the adjusted basis for future sales.
            </Callout>
          )}
          {r.ftcExceedsDeMinimis && (
            <Callout tone="warning" title="Form 1116 may be required">
              Foreign tax paid exceeds the {formatCurrency(v.status === 'mfj' ? 600 : 300)} de minimis election threshold. The credit may be limited by foreign-source income.
            </Callout>
          )}
          {r.capitalLossCarryforward > 0 && (
            <Callout tone="neutral" title="Capital loss carryforward">
              {formatCurrency(r.capitalLossCarryforward)} of net capital loss carries forward to next year.
            </Callout>
          )}
        </div>
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
    />
  )
}
