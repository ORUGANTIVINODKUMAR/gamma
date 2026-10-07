/**
 * Audit Risk Analyzer.
 *
 * Rule-based indicator analysis built on publicly documented IRS examination
 * focus areas (IRS Data Book coverage by income, AUR matching, Schedule C
 * compliance campaigns, §183 hobby-loss presumption, §469 passive losses,
 * FBAR/8938, digital-asset reporting, S corporation reasonable compensation).
 * It is NOT the IRS's confidential DIF score — every point is explainable.
 */

import type { FilingStatus, TaxYear } from './years'

export interface AuditRiskInput {
  year: TaxYear
  status: FilingStatus
  agi: number
  wages: number
  hasScheduleC: boolean
  grossReceipts: number
  totalExpenses: number
  mealsAndTravel: number
  vehicleBusinessPct: number
  homeOffice: boolean
  cashIntensive: boolean
  priorLossYears: number
  charitableCash: number
  charitableNonCash: number
  nonCashAppraisal: boolean
  rentalNetIncome: number
  realEstateProfessional: boolean
  claimsEitc: boolean
  informationReturnsReconciled: boolean
  digitalAssets: boolean
  digitalAssetsReported: boolean
  foreignAccounts: boolean
  foreignReportingFiled: boolean
  sCorpShareholder: boolean
  officerCompensation: number
  sCorpDistributions: number
  roundNumbers: boolean
  earlyRetirementDistribution: boolean
}

export const AUDIT_RISK_EXAMPLE: AuditRiskInput = {
  year: 2026,
  status: 'mfj',
  agi: 612_000,
  wages: 0,
  hasScheduleC: true,
  grossReceipts: 486_000,
  totalExpenses: 401_500,
  mealsAndTravel: 58_200,
  vehicleBusinessPct: 100,
  homeOffice: true,
  cashIntensive: false,
  priorLossYears: 1,
  charitableCash: 24_000,
  charitableNonCash: 9_800,
  nonCashAppraisal: false,
  rentalNetIncome: -18_400,
  realEstateProfessional: false,
  claimsEitc: false,
  informationReturnsReconciled: true,
  digitalAssets: true,
  digitalAssetsReported: true,
  foreignAccounts: false,
  foreignReportingFiled: false,
  sCorpShareholder: false,
  officerCompensation: 0,
  sCorpDistributions: 0,
  roundNumbers: false,
  earlyRetirementDistribution: false,
}

export type IndicatorCategory = 'Income' | 'Business' | 'Deductions' | 'Credits' | 'Compliance'
export type Severity = 'low' | 'medium' | 'high'
export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High'

export interface IndicatorDefinition {
  id: string
  title: string
  category: IndicatorCategory
  /** Short description of what is tested (shown even when not triggered). */
  tests: string
  evaluate: (i: AuditRiskInput) => { points: number; detail: string } | null
  mitigation: string
}

export interface TriggeredIndicator {
  id: string
  title: string
  category: IndicatorCategory
  points: number
  severity: Severity
  detail: string
  mitigation: string
}

const usd = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`
const pct = (v: number) => `${Math.round(v * 100)}%`

export const AUDIT_INDICATORS: readonly IndicatorDefinition[] = [
  {
    id: 'high-income',
    title: 'High-income return',
    category: 'Income',
    tests: 'IRS examination coverage rises sharply with total positive income.',
    evaluate: ({ agi }) => {
      if (agi >= 10_000_000) return { points: 24, detail: `AGI of ${usd(agi)} is in the highest IRS examination-coverage tier ($10M+).` }
      if (agi >= 5_000_000) return { points: 20, detail: `AGI of ${usd(agi)} falls in the $5M–$10M tier, which sees materially higher coverage.` }
      if (agi >= 1_000_000) return { points: 16, detail: `AGI of ${usd(agi)} exceeds $1M, a stated IRS enforcement priority.` }
      if (agi >= 500_000) return { points: 9, detail: `AGI of ${usd(agi)} is above $500K, where coverage is above average.` }
      if (agi >= 200_000) return { points: 4, detail: `AGI of ${usd(agi)} is above $200K.` }
      return null
    },
    mitigation: 'Keep complete support for every material item; high-income returns are reviewed more often regardless of content.',
  },
  {
    id: 'schedule-c-loss',
    title: 'Schedule C net loss',
    category: 'Business',
    tests: 'Business expenses exceeding gross receipts, especially offsetting other income.',
    evaluate: (i) => {
      if (!i.hasScheduleC || i.totalExpenses <= i.grossReceipts) return null
      const loss = i.totalExpenses - i.grossReceipts
      const offsets = i.wages > 0 && loss > i.wages * 0.25
      return {
        points: offsets ? 16 : 12,
        detail: `Schedule C shows a ${usd(loss)} loss${offsets ? ', offsetting a significant share of W-2 wages' : ''}.`,
      }
    },
    mitigation: 'Document profit motive (business plan, separate accounts, time records) and substantiate the largest expense lines.',
  },
  {
    id: 'recurring-losses',
    title: 'Recurring business losses (§183)',
    category: 'Business',
    tests: 'Losses in multiple recent years can trigger hobby-loss scrutiny.',
    evaluate: ({ hasScheduleC, priorLossYears }) => {
      if (!hasScheduleC) return null
      if (priorLossYears >= 3) return { points: 14, detail: `Losses in ${priorLossYears} of the prior 5 years — the §183(d) profit presumption (3 of 5 years) is not met.` }
      if (priorLossYears === 2) return { points: 6, detail: 'Losses in 2 of the prior 5 years; one more loss year removes the profit presumption.' }
      return null
    },
    mitigation: 'Assemble evidence for the nine §183 factors: businesslike operation, expertise, time invested, and expectation of asset appreciation.',
  },
  {
    id: 'expense-ratio',
    title: 'High expense-to-revenue ratio',
    category: 'Business',
    tests: 'Expenses above ~80% of receipts compared with industry norms.',
    evaluate: ({ hasScheduleC, grossReceipts, totalExpenses }) => {
      if (!hasScheduleC || grossReceipts <= 0 || totalExpenses > grossReceipts) return null
      const ratio = totalExpenses / grossReceipts
      if (ratio >= 0.8) return { points: 6, detail: `Expenses equal ${pct(ratio)} of gross receipts.` }
      return null
    },
    mitigation: 'Benchmark against industry margins and keep receipts for the largest expense categories.',
  },
  {
    id: 'cash-intensive',
    title: 'Cash-intensive business',
    category: 'Business',
    tests: 'Businesses that receive substantial cash are a long-standing IRS focus.',
    evaluate: ({ hasScheduleC, cashIntensive }) =>
      hasScheduleC && cashIntensive ? { points: 8, detail: 'Business is flagged as cash-intensive (restaurants, salons, car washes, etc.).' } : null,
    mitigation: 'Reconcile deposits to reported receipts and maintain daily sales records (Z-tapes, POS exports).',
  },
  {
    id: 'meals-travel',
    title: 'Large meals & travel deductions',
    category: 'Deductions',
    tests: 'Meals and travel relative to gross receipts.',
    evaluate: ({ hasScheduleC, grossReceipts, mealsAndTravel }) => {
      if (!hasScheduleC || grossReceipts <= 0 || mealsAndTravel <= 0) return null
      const ratio = mealsAndTravel / grossReceipts
      if (ratio >= 0.2) return { points: 10, detail: `Meals & travel are ${pct(ratio)} of receipts (${usd(mealsAndTravel)}).` }
      if (ratio >= 0.1) return { points: 7, detail: `Meals & travel are ${pct(ratio)} of receipts (${usd(mealsAndTravel)}).` }
      return null
    },
    mitigation: 'Keep §274(d) substantiation: amount, date, place, business purpose and attendees for each expense.',
  },
  {
    id: 'vehicle-100',
    title: 'Vehicle claimed at 100% business use',
    category: 'Deductions',
    tests: 'Full business use of a vehicle is rarely supportable.',
    evaluate: ({ vehicleBusinessPct }) => {
      if (vehicleBusinessPct >= 100) return { points: 7, detail: 'A vehicle is claimed at 100% business use.' }
      if (vehicleBusinessPct >= 90) return { points: 3, detail: `A vehicle is claimed at ${Math.round(vehicleBusinessPct)}% business use.` }
      return null
    },
    mitigation: 'Maintain a contemporaneous mileage log and confirm a separate personal vehicle is available.',
  },
  {
    id: 'home-office',
    title: 'Home office deduction',
    category: 'Deductions',
    tests: 'Exclusive and regular use requirements; employees cannot claim it.',
    evaluate: ({ homeOffice, hasScheduleC }) => {
      if (!homeOffice) return null
      if (!hasScheduleC)
        return { points: 10, detail: 'Home office claimed without self-employment income — unreimbursed employee expenses are not deductible.' }
      return { points: 3, detail: 'Home office claimed on Schedule C (Form 8829 or simplified method).' }
    },
    mitigation: 'Photograph and measure the space; document exclusive, regular business use.',
  },
  {
    id: 'charitable-ratio',
    title: 'Charitable giving high relative to income',
    category: 'Deductions',
    tests: 'Contributions compared with typical giving at the same AGI.',
    evaluate: ({ agi, charitableCash, charitableNonCash }) => {
      const total = charitableCash + charitableNonCash
      if (agi <= 0 || total <= 0) return null
      const ratio = total / agi
      if (ratio >= 0.3) return { points: 12, detail: `Contributions of ${usd(total)} equal ${pct(ratio)} of AGI.` }
      if (ratio >= 0.1) return { points: 6, detail: `Contributions of ${usd(total)} equal ${pct(ratio)} of AGI.` }
      return null
    },
    mitigation: 'Secure contemporaneous written acknowledgments for every gift of $250 or more.',
  },
  {
    id: 'noncash-appraisal',
    title: 'Non-cash gifts without qualified appraisal',
    category: 'Deductions',
    tests: 'Non-cash gifts over $5,000 need a qualified appraisal (Form 8283 Section B).',
    evaluate: ({ charitableNonCash, nonCashAppraisal }) => {
      if (charitableNonCash > 5_000 && !nonCashAppraisal)
        return { points: 12, detail: `${usd(charitableNonCash)} of non-cash gifts reported without a qualified appraisal.` }
      if (charitableNonCash > 500) return { points: 2, detail: 'Non-cash gifts over $500 require Form 8283.' }
      return null
    },
    mitigation: 'Obtain a qualified appraisal and complete Form 8283 Section B before filing.',
  },
  {
    id: 'rental-losses',
    title: 'Rental losses at high income (§469)',
    category: 'Income',
    tests: 'Passive rental losses are generally disallowed above $150K MAGI.',
    evaluate: ({ rentalNetIncome, agi, realEstateProfessional }) => {
      if (rentalNetIncome >= 0 || agi <= 100_000) return null
      if (realEstateProfessional)
        return { points: 8, detail: `Rental loss of ${usd(-rentalNetIncome)} relies on real-estate-professional status — a frequent exam issue.` }
      if (agi > 150_000) return { points: 9, detail: `Rental loss of ${usd(-rentalNetIncome)} with AGI above $150K, where the $25K allowance is fully phased out.` }
      return { points: 4, detail: `Rental loss of ${usd(-rentalNetIncome)} within the $100K–$150K allowance phase-out.` }
    },
    mitigation: 'Confirm passive-loss limits on Form 8582; if claiming REP status, keep hour logs (750+ hours).',
  },
  {
    id: 'eitc',
    title: 'Earned Income Tax Credit claimed',
    category: 'Credits',
    tests: 'EITC claims — especially with self-employment income — have high exam rates.',
    evaluate: ({ claimsEitc, hasScheduleC }) => {
      if (!claimsEitc) return null
      return hasScheduleC
        ? { points: 12, detail: 'EITC is claimed with Schedule C income, a primary IRS correspondence-exam focus.' }
        : { points: 6, detail: 'EITC is claimed.' }
    },
    mitigation: 'Complete Form 8867 due diligence and retain residency and relationship documentation for each child.',
  },
  {
    id: 'info-mismatch',
    title: 'Unreconciled information returns',
    category: 'Compliance',
    tests: 'The Automated Underreporter program matches every W-2/1099 to the return.',
    evaluate: ({ informationReturnsReconciled }) =>
      informationReturnsReconciled ? null : { points: 16, detail: 'Not all W-2, 1099 and K-1 forms have been reconciled to the return.' },
    mitigation: 'Pull an IRS wage & income transcript and reconcile every information return before filing.',
  },
  {
    id: 'digital-assets',
    title: 'Digital asset activity',
    category: 'Compliance',
    tests: 'Form 1040 digital-asset question and broker reporting on Form 1099-DA.',
    evaluate: ({ digitalAssets, digitalAssetsReported }) => {
      if (!digitalAssets) return null
      return digitalAssetsReported
        ? { points: 3, detail: 'Digital-asset transactions are reported; 1099-DA matching applies.' }
        : { points: 14, detail: 'Digital-asset transactions exist but are not fully reported.' }
    },
    mitigation: 'Answer the digital-asset question accurately and reconcile Form 8949 to exchange and 1099-DA records.',
  },
  {
    id: 'foreign-accounts',
    title: 'Foreign financial accounts',
    category: 'Compliance',
    tests: 'FBAR (FinCEN 114) and Form 8938 obligations.',
    evaluate: ({ foreignAccounts, foreignReportingFiled }) => {
      if (!foreignAccounts) return null
      return foreignReportingFiled
        ? { points: 3, detail: 'Foreign accounts are disclosed on FBAR / Form 8938.' }
        : { points: 18, detail: 'Foreign accounts exist without FBAR or Form 8938 filings — penalties can be severe.' }
    },
    mitigation: 'File FinCEN 114 and Form 8938 where thresholds are met; consider streamlined procedures for past years.',
  },
  {
    id: 'reasonable-comp',
    title: 'S corporation reasonable compensation',
    category: 'Business',
    tests: 'Low officer wages relative to distributions avoid payroll tax.',
    evaluate: ({ sCorpShareholder, officerCompensation, sCorpDistributions }) => {
      if (!sCorpShareholder || sCorpDistributions <= 0) return null
      if (officerCompensation <= 0)
        return { points: 16, detail: `Distributions of ${usd(sCorpDistributions)} with no officer W-2 compensation.` }
      const share = officerCompensation / (officerCompensation + sCorpDistributions)
      if (share < 0.3)
        return { points: 12, detail: `Officer wages are only ${pct(share)} of total wages plus distributions.` }
      return null
    },
    mitigation: 'Support officer pay with a reasonable-compensation study (duties, hours, comparable salaries).',
  },
  {
    id: 'round-numbers',
    title: 'Rounded or estimated amounts',
    category: 'Compliance',
    tests: 'Many entries ending in 00 suggest estimates rather than records.',
    evaluate: ({ roundNumbers }) =>
      roundNumbers ? { points: 5, detail: 'Several reported amounts appear rounded or estimated.' } : null,
    mitigation: 'Report amounts from source documents and ledgers rather than estimates.',
  },
  {
    id: 'early-distribution',
    title: 'Early retirement distribution',
    category: 'Income',
    tests: '10% additional tax under §72(t) and its exceptions.',
    evaluate: ({ earlyRetirementDistribution }) =>
      earlyRetirementDistribution ? { points: 4, detail: 'A pre-59½ retirement distribution is reported.' } : null,
    mitigation: 'Confirm the distribution code on Form 1099-R and document any exception claimed on Form 5329.',
  },
]

export interface AuditRiskResult {
  score: number
  level: RiskLevel
  triggered: TriggeredIndicator[]
  passedCount: number
  byCategory: { category: IndicatorCategory; points: number; count: number }[]
  checklist: string[]
}

export function riskLevel(score: number): RiskLevel {
  if (score >= 65) return 'High'
  if (score >= 40) return 'Elevated'
  if (score >= 20) return 'Moderate'
  return 'Low'
}

function severity(points: number): Severity {
  return points >= 12 ? 'high' : points >= 7 ? 'medium' : 'low'
}

const CATEGORIES: IndicatorCategory[] = ['Income', 'Business', 'Deductions', 'Credits', 'Compliance']

export function analyzeAuditRisk(input: AuditRiskInput): AuditRiskResult {
  const triggered: TriggeredIndicator[] = []
  for (const def of AUDIT_INDICATORS) {
    const hit = def.evaluate(input)
    if (hit && hit.points > 0) {
      triggered.push({
        id: def.id,
        title: def.title,
        category: def.category,
        points: hit.points,
        severity: severity(hit.points),
        detail: hit.detail,
        mitigation: def.mitigation,
      })
    }
  }
  triggered.sort((a, b) => b.points - a.points)
  const raw = triggered.reduce((s, t) => s + t.points, 0)
  const score = Math.min(100, raw)

  const byCategory = CATEGORIES.map((category) => {
    const items = triggered.filter((t) => t.category === category)
    return { category, points: items.reduce((s, t) => s + t.points, 0), count: items.length }
  })

  return {
    score,
    level: riskLevel(score),
    triggered,
    passedCount: AUDIT_INDICATORS.length - triggered.length,
    byCategory,
    checklist: triggered.filter((t) => t.severity !== 'low').map((t) => t.mitigation),
  }
}
