import { motion } from 'framer-motion'
import { Check, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { FilingStatusField } from '@/components/tools/shared'
import { InputGroup, ResultCard, ToolShell } from '@/components/tools/ToolShell'
import { useToolState } from '@/components/tools/useToolState'
import { Checkbox, MoneyField, PercentField, StepperField, Switch } from '@/components/ui/fields'
import { Badge, EmptyState, type Tone } from '@/components/ui/primitives'
import { TOOLS_BY_ID } from '@/config/tools'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'
import { analyzeAuditRisk, AUDIT_INDICATORS, AUDIT_RISK_EXAMPLE, type AuditRiskInput, type RiskLevel } from '@/lib/tax/auditRisk'
import { summarizeAuditRisk } from '@/services/summaries'

const BLANK: AuditRiskInput = {
  ...AUDIT_RISK_EXAMPLE,
  agi: 0,
  wages: 0,
  hasScheduleC: false,
  grossReceipts: 0,
  totalExpenses: 0,
  mealsAndTravel: 0,
  vehicleBusinessPct: 0,
  homeOffice: false,
  cashIntensive: false,
  priorLossYears: 0,
  charitableCash: 0,
  charitableNonCash: 0,
  nonCashAppraisal: false,
  rentalNetIncome: 0,
  realEstateProfessional: false,
  claimsEitc: false,
  informationReturnsReconciled: true,
  digitalAssets: false,
  digitalAssetsReported: false,
  foreignAccounts: false,
  foreignReportingFiled: false,
  sCorpShareholder: false,
  officerCompensation: 0,
  sCorpDistributions: 0,
  roundNumbers: false,
  earlyRetirementDistribution: false,
}

const LEVEL_TONE: Record<RiskLevel, Tone> = { Low: 'good', Moderate: 'warning', Elevated: 'serious', High: 'critical' }
const SEVERITY_TONE: Record<string, Tone> = { high: 'critical', medium: 'serious', low: 'warning' }

/** The four readings of the score, in words — the reading is the headline, not a dial. */
const READINGS: { level: RiskLevel; range: string }[] = [
  { level: 'Low', range: '0–19' },
  { level: 'Moderate', range: '20–39' },
  { level: 'Elevated', range: '40–64' },
  { level: 'High', range: '65–100' },
]

/** The areas of a Form 1040 the 3D scanner separates into layers, and the indicator categories that feed each. */
const SCAN_AREAS: { name: string; category: string }[] = [
  { name: 'Income', category: 'Income' },
  { name: 'Deductions', category: 'Deductions' },
  { name: 'Credits', category: 'Credits' },
  { name: 'Schedule C', category: 'Business' },
]

const ASSUMPTIONS = [
  `Analyzes ${AUDIT_INDICATORS.length} indicators drawn from publicly documented IRS examination focus areas (IRS Data Book coverage by income, AUR matching, compliance campaigns).`,
  'This is not the IRS’s confidential Discriminant Function (DIF) score and does not predict whether a return will be selected.',
  'Points are additive and capped at 100: 0–19 Low, 20–39 Moderate, 40–64 Elevated, 65+ High.',
  'A low score does not remove the need for complete substantiation of every item on the return.',
]

const AREA_NAMES = SCAN_AREAS.map((a) => a.name)

export default function AuditRiskPage() {
  const tool = TOOLS_BY_ID['audit-risk']
  const { value: v, setValue, update, loaded, reset, loadExample } = useToolState('audit-risk', AUDIT_RISK_EXAMPLE, BLANK)
  const r = useMemo(() => analyzeAuditRisk(v), [v])
  const summary = useMemo(() => summarizeAuditRisk(r), [r])
  const [done, setDone] = useState<Record<string, boolean>>({})
  const maxCat = Math.max(1, ...r.byCategory.map((c) => c.points))
  // the 3D scanner's layers lift higher the more points their area contributes
  const stageData = {
    areas: AREA_NAMES,
    emphasis: SCAN_AREAS.map((a) => (r.byCategory.find((c) => c.category === a.category)?.points ?? 0) / maxCat),
  }
  const cleared = AUDIT_INDICATORS.filter((d) => !r.triggered.some((t) => t.id === d.id))

  const inputs = (
    <>
      <InputGroup title="Return profile">
        <FilingStatusField value={v.status} onChange={(s) => update('status', s)} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="Adjusted gross income" value={v.agi} onChange={(n) => update('agi', n)} />
          <MoneyField label="W-2 wages" value={v.wages} onChange={(n) => update('wages', n)} />
        </div>
      </InputGroup>

      <InputGroup title="Business (Schedule C)">
        <Switch checked={v.hasScheduleC} onChange={(b) => update('hasScheduleC', b)} label="Return includes Schedule C" />
        {v.hasScheduleC && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <MoneyField label="Gross receipts" value={v.grossReceipts} onChange={(n) => update('grossReceipts', n)} />
              <MoneyField label="Total expenses" value={v.totalExpenses} onChange={(n) => update('totalExpenses', n)} />
              <MoneyField label="Meals & travel" value={v.mealsAndTravel} onChange={(n) => update('mealsAndTravel', n)} />
              <PercentField label="Vehicle business use" value={v.vehicleBusinessPct} onChange={(n) => update('vehicleBusinessPct', n)} />
            </div>
            <StepperField label="Loss years in the prior 5" value={v.priorLossYears} onChange={(n) => update('priorLossYears', n)} max={5} />
            <Switch checked={v.cashIntensive} onChange={(b) => update('cashIntensive', b)} label="Cash-intensive business" />
          </>
        )}
        <Switch checked={v.homeOffice} onChange={(b) => update('homeOffice', b)} label="Home office deduction claimed" />
      </InputGroup>

      <InputGroup title="Deductions & rental">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <MoneyField label="Charitable — cash" value={v.charitableCash} onChange={(n) => update('charitableCash', n)} />
          <MoneyField label="Charitable — non-cash" value={v.charitableNonCash} onChange={(n) => update('charitableNonCash', n)} />
        </div>
        {v.charitableNonCash > 5_000 && (
          <Switch checked={v.nonCashAppraisal} onChange={(b) => update('nonCashAppraisal', b)} label="Qualified appraisal obtained" description="Required for non-cash gifts over $5,000 (Form 8283 Section B)." />
        )}
        <MoneyField label="Net rental income (loss)" value={v.rentalNetIncome} onChange={(n) => update('rentalNetIncome', n)} allowNegative hint="Enter losses as negative numbers." />
        {v.rentalNetIncome < 0 && (
          <Switch checked={v.realEstateProfessional} onChange={(b) => update('realEstateProfessional', b)} label="Claims real estate professional status" />
        )}
      </InputGroup>

      <InputGroup title="Credits & compliance">
        <Switch checked={v.claimsEitc} onChange={(b) => update('claimsEitc', b)} label="Earned Income Tax Credit claimed" />
        <Switch checked={v.informationReturnsReconciled} onChange={(b) => update('informationReturnsReconciled', b)} label="All W-2s, 1099s and K-1s reconciled" />
        <Switch checked={v.digitalAssets} onChange={(b) => update('digitalAssets', b)} label="Digital asset transactions" />
        {v.digitalAssets && <Switch checked={v.digitalAssetsReported} onChange={(b) => update('digitalAssetsReported', b)} label="Fully reported on Form 8949" />}
        <Switch checked={v.foreignAccounts} onChange={(b) => update('foreignAccounts', b)} label="Foreign financial accounts" />
        {v.foreignAccounts && <Switch checked={v.foreignReportingFiled} onChange={(b) => update('foreignReportingFiled', b)} label="FBAR / Form 8938 filed" />}
        <Switch checked={v.roundNumbers} onChange={(b) => update('roundNumbers', b)} label="Several amounts are rounded estimates" />
        <Switch checked={v.earlyRetirementDistribution} onChange={(b) => update('earlyRetirementDistribution', b)} label="Pre-59½ retirement distribution" />
      </InputGroup>

      <InputGroup title="S corporation">
        <Switch checked={v.sCorpShareholder} onChange={(b) => update('sCorpShareholder', b)} label="Taxpayer is an S-corp shareholder-officer" />
        {v.sCorpShareholder && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <MoneyField label="Officer W-2 compensation" value={v.officerCompensation} onChange={(n) => update('officerCompensation', n)} />
            <MoneyField label="Distributions" value={v.sCorpDistributions} onChange={(n) => update('sCorpDistributions', n)} />
          </div>
        )}
      </InputGroup>
    </>
  )

  const results = (
    <>
      <div className="surface-card relative overflow-hidden rounded-panel p-6 sm:p-8">
        <p className="text-[13px] font-medium text-fg-subtle">Audit risk reading</p>
        <div className="mt-2 flex flex-wrap items-end gap-x-6 gap-y-1">
          <span className="t-numeral text-[clamp(3.6rem,8vw,6rem)] text-fg" aria-label={`${r.level} risk, score ${r.score} out of 100`}>
            {r.level}
          </span>
          <span className="mb-3 flex items-center gap-3 text-[14px] text-fg-faint">
            score <span className="tabular font-serif text-[2rem] leading-none text-fg">{r.score}</span> / 100
            <Badge tone={LEVEL_TONE[r.level]} withIcon={false}>
              {r.triggered.length} of {AUDIT_INDICATORS.length} flagged
            </Badge>
          </span>
        </div>
        <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-fg-subtle">
          {r.level === 'Low'
            ? 'Nothing on this return stands out against common examination criteria.'
            : r.level === 'Moderate'
              ? 'A few items warrant documentation before filing.'
              : 'Several items commonly draw examination — prioritize substantiation below.'}
        </p>
        <ol className="mt-6 grid grid-cols-2 border-t border-line/[0.1] pt-4 sm:grid-cols-4" aria-label="How the score is read">
          {READINGS.map((b) => {
            const on = b.level === r.level
            return (
              <li key={b.level} aria-current={on ? 'true' : undefined} className={cn('py-1 pr-3 text-[12.5px]', on ? 'font-semibold text-accent-300' : 'text-fg-faint')}>
                <span className={cn('block font-serif text-[1.35rem] leading-tight', on ? 'text-fg' : 'text-fg-faint')}>{b.level}</span>
                <span className="tabular">{b.range}</span>
              </li>
            )
          })}
        </ol>
      </div>

      <ResultCard title="Flagged indicators" description="Ranked by contribution to the score, with the documentation that mitigates each.">
        {r.triggered.length === 0 ? (
          <EmptyState icon={<ShieldCheck className="size-5" />} title="No indicators flagged" description="Based on the information entered, no common examination triggers apply." />
        ) : (
          <ul className="flex flex-col gap-3">
            {r.triggered.map((t, i) => (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03, ease: EASE_PREMIUM }}
                className="rounded-2xl border border-line/[0.06] bg-line/[0.02] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[14.5px] font-semibold text-fg">{t.title}</h3>
                    <span className="text-[11.5px] text-fg-faint">{t.category}</span>
                  </div>
                  <Badge tone={SEVERITY_TONE[t.severity]}>+{t.points} pts</Badge>
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-fg-subtle">{t.detail}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
                  <span className="font-semibold text-accent-300">Mitigation · </span>
                  {t.mitigation}
                </p>
              </motion.li>
            ))}
          </ul>
        )}
      </ResultCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ResultCard title="Points by category">
          <ol className="flex flex-col">
            {[...r.byCategory]
              .sort((a, b) => b.points - a.points)
              .map((c) => (
                <li key={c.category} className="flex items-baseline justify-between gap-4 border-b border-line/[0.07] py-3 last:border-0">
                  <span className="text-[13.5px] text-fg-muted">
                    {c.category}
                    <span className="ml-2 text-[11.5px] text-fg-faint">{c.count} flagged</span>
                  </span>
                  <span className="tabular font-serif text-[1.5rem] leading-none text-fg">{c.points}</span>
                </li>
              ))}
          </ol>
        </ResultCard>

        <ResultCard title="Documentation checklist" description="Check items off as you gather support.">
          {r.checklist.length === 0 ? (
            <p className="text-[13.5px] text-fg-faint">No additional documentation suggested.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {r.checklist.map((item) => (
                <li key={item} className={cn('transition-opacity', done[item] && 'opacity-55')}>
                  <Checkbox checked={!!done[item]} onChange={(b) => setDone((d) => ({ ...d, [item]: b }))}>
                    <span className={cn(done[item] && 'line-through')}>{item}</span>
                  </Checkbox>
                </li>
              ))}
            </ul>
          )}
        </ResultCard>
      </div>

      <ResultCard title={`Cleared indicators (${cleared.length})`} description="Tested and not triggered by the information entered.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {cleared.map((d) => (
            <li key={d.id} className="flex items-start gap-2 text-[13px] text-fg-subtle">
              <Check className="mt-0.5 size-4 shrink-0 text-good-soft" aria-hidden />
              <span>
                {d.title}
                <span className="block text-[11.5px] text-fg-faint">{d.tests}</span>
              </span>
            </li>
          ))}
        </ul>
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
      stageData={stageData}
    />
  )
}
