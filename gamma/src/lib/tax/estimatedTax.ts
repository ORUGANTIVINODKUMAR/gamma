/**
 * Estimated Tax Calculator (Form 1040-ES / §6654 safe harbors).
 *
 * Projects the current-year liability with the shared engine, then sizes the
 * required annual payment as the lesser of 90% of current-year tax and
 * 100% (110% above $150K AGI) of prior-year tax. Withholding is treated as
 * paid evenly through the year, as §6654(g) provides by default.
 */

import { computeFederalTax, type TaxResult } from './engine'
import { getYear, type FilingStatus, type TaxYear } from './years'

export interface EstimatedTaxInput {
  year: TaxYear
  status: FilingStatus
  wages: number
  withholding: number
  selfEmploymentIncome: number
  interestAndOrdinaryDividends: number
  qualifiedDividends: number
  netCapitalGains: number
  otherIncome: number
  adjustments: number
  deductionMode: 'standard' | 'itemized'
  itemizedAmount: number
  childrenUnder17: number
  priorYearTax: number
  priorYearAgi: number
  priorYearFullYear: boolean
  payments: [number, number, number, number]
}

export const ESTIMATED_TAX_EXAMPLE: EstimatedTaxInput = {
  year: 2026,
  status: 'mfj',
  wages: 96_000,
  withholding: 9_800,
  selfEmploymentIncome: 148_000,
  interestAndOrdinaryDividends: 6_400,
  qualifiedDividends: 4_100,
  netCapitalGains: 12_500,
  otherIncome: 0,
  adjustments: 7_000,
  deductionMode: 'standard',
  itemizedAmount: 0,
  childrenUnder17: 2,
  priorYearTax: 51_250,
  priorYearAgi: 241_300,
  priorYearFullYear: true,
  payments: [6_600, 6_600, 6_600, 0],
}

export type QuarterStatus = 'paid' | 'short' | 'overdue' | 'due-soon' | 'upcoming'

export interface QuarterRow {
  quarter: 1 | 2 | 3 | 4
  dueDate: string
  required: number
  paid: number
  cumulativeRequired: number
  cumulativePaid: number
  status: QuarterStatus
}

export interface EstimatedTaxResult {
  tax: TaxResult
  projectedTax: number
  currentYearSafeHarbor: number
  priorYearSafeHarbor: number | null
  priorYearPct: number
  requiredAnnualPayment: number
  safeHarborBasis: 'current' | 'prior'
  withholding: number
  requiredEstimates: number
  perQuarter: number
  /** Payment per quarter that would leave ~$0 due at filing. */
  fullPayPerQuarter: number
  paymentsMade: number
  balanceDueIfOnPlan: number
  belowThousandRule: boolean
  schedule: QuarterRow[]
  nextDue: QuarterRow | null
}

const DAY = 86_400_000

export function calculateEstimatedTax(input: EstimatedTaxInput, today: Date = new Date()): EstimatedTaxResult {
  const p = getYear(input.year)
  const tax = computeFederalTax({
    year: input.year,
    status: input.status,
    wages: input.wages,
    selfEmploymentIncome: input.selfEmploymentIncome,
    ordinaryDividends: input.interestAndOrdinaryDividends,
    qualifiedDividends: input.qualifiedDividends,
    longTermGains: input.netCapitalGains,
    otherIncome: input.otherIncome,
    adjustments: input.adjustments,
    deductionMode: input.deductionMode,
    itemized: { stateLocalTaxes: 0, mortgageInterest: 0, charitableCash: 0, charitableNonCash: 0, medical: 0, other: input.itemizedAmount },
    childrenUnder17: input.childrenUnder17,
  })

  const projectedTax = Math.max(0, tax.netTaxLiability)
  const currentYearSafeHarbor = projectedTax * 0.9
  const highIncomeLimit = input.status === 'mfs' ? 75_000 : 150_000
  const priorYearPct = input.priorYearAgi > highIncomeLimit ? 1.1 : 1.0
  const priorYearSafeHarbor = input.priorYearFullYear ? Math.max(0, input.priorYearTax) * priorYearPct : null

  const requiredAnnualPayment =
    priorYearSafeHarbor === null ? currentYearSafeHarbor : Math.min(currentYearSafeHarbor, priorYearSafeHarbor)
  const safeHarborBasis: 'current' | 'prior' =
    priorYearSafeHarbor !== null && priorYearSafeHarbor <= currentYearSafeHarbor ? 'prior' : 'current'

  const withholding = Math.max(0, input.withholding)
  const belowThousandRule = projectedTax - withholding < 1_000
  const requiredEstimates = belowThousandRule ? 0 : Math.max(0, requiredAnnualPayment - withholding)
  const perQuarter = requiredEstimates / 4
  const fullPayPerQuarter = Math.max(0, projectedTax - withholding) / 4

  let cumReq = 0
  let cumPaid = 0
  const schedule: QuarterRow[] = p.estimatedDueDates.map((iso, i) => {
    const paid = Math.max(0, input.payments[i] ?? 0)
    cumReq += perQuarter
    cumPaid += paid
    const due = new Date(`${iso}T23:59:59`)
    const daysUntil = (due.getTime() - today.getTime()) / DAY
    let status: QuarterStatus
    if (cumPaid >= cumReq - 0.5) status = 'paid'
    else if (daysUntil < 0) status = 'overdue'
    else if (paid > 0) status = 'short'
    else if (daysUntil <= 45) status = 'due-soon'
    else status = 'upcoming'
    return {
      quarter: (i + 1) as 1 | 2 | 3 | 4,
      dueDate: iso,
      required: perQuarter,
      paid,
      cumulativeRequired: cumReq,
      cumulativePaid: cumPaid,
      status,
    }
  })

  const paymentsMade = schedule.reduce((s, q) => s + q.paid, 0)
  const nextDue = schedule.find((q) => new Date(`${q.dueDate}T23:59:59`) >= today) ?? null

  return {
    tax,
    projectedTax,
    currentYearSafeHarbor,
    priorYearSafeHarbor,
    priorYearPct,
    requiredAnnualPayment,
    safeHarborBasis,
    withholding,
    requiredEstimates,
    perQuarter,
    fullPayPerQuarter,
    paymentsMade,
    balanceDueIfOnPlan: projectedTax - withholding - Math.max(paymentsMade, requiredEstimates),
    belowThousandRule,
    schedule,
    nextDue,
  }
}
