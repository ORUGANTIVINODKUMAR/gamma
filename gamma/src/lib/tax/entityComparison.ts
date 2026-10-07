/**
 * Entity Comparison — Schedule C sole proprietorship vs S corporation.
 *
 * Both scenarios run through the shared federal engine so §199A (including the
 * W-2 wage limitation that S-corp officer salary unlocks), Additional Medicare
 * Tax and bracket effects are captured, then layered with payroll taxes and
 * the incremental cost of operating an S corporation.
 */

import { computeFederalTax, ficaOneSide, type TaxResult } from './engine'
import { getYear, type FilingStatus, type TaxYear } from './years'

export interface EntityComparisonInput {
  year: TaxYear
  status: FilingStatus
  netProfit: number
  officerSalary: number
  otherIncome: number
  deductionMode: 'standard' | 'itemized'
  itemizedAmount: number
  isSSTB: boolean
  /** Payroll service, Form 1120-S preparation, registered agent, etc. */
  adminCosts: number
  /** FUTA + state unemployment on officer wages. */
  unemploymentTaxes: number
  /** Entity-level state tax on S corporation income (e.g. CA 1.5%). */
  stateEntityTaxRate: number
}

export const ENTITY_COMPARISON_EXAMPLE: EntityComparisonInput = {
  year: 2026,
  status: 'mfj',
  netProfit: 185_000,
  officerSalary: 78_000,
  otherIncome: 42_000,
  deductionMode: 'standard',
  itemizedAmount: 0,
  isSSTB: false,
  adminCosts: 2_800,
  unemploymentTaxes: 520,
  stateEntityTaxRate: 0,
}

export interface ScenarioBreakdown {
  incomeTax: number
  employmentTax: number
  entityCosts: number
  total: number
  qbiDeduction: number
  agi: number
  taxableIncome: number
  effectiveRate: number
  marginalRate: number
  tax: TaxResult
}

export interface EntityComparisonResult {
  scheduleC: ScenarioBreakdown
  sCorp: ScenarioBreakdown & { employerFica: number; employeeFica: number; k1Income: number; entityTax: number }
  savings: number
  recommendation: 's-corp' | 'schedule-c' | 'neutral'
  salaryShare: number
  sensitivity: { salary: number; savings: number }[]
  breakevenProfit: number | null
  reasonableCompWarning: string | null
}

function scheduleCScenario(input: EntityComparisonInput, profit: number): ScenarioBreakdown {
  const tax = computeFederalTax({
    year: input.year,
    status: input.status,
    otherIncome: input.otherIncome,
    selfEmploymentIncome: profit,
    deductionMode: input.deductionMode,
    itemized: { stateLocalTaxes: 0, mortgageInterest: 0, charitableCash: 0, charitableNonCash: 0, medical: 0, other: input.itemizedAmount },
    isSSTB: input.isSSTB,
  })
  const incomeTax = tax.incomeTaxAfterCredits + tax.netInvestmentIncomeTax
  const employmentTax = tax.selfEmploymentTax + tax.additionalMedicareTax
  return {
    incomeTax,
    employmentTax,
    entityCosts: 0,
    total: incomeTax + employmentTax,
    qbiDeduction: tax.qbiDeduction,
    agi: tax.agi,
    taxableIncome: tax.taxableIncome,
    effectiveRate: profit > 0 ? (incomeTax + employmentTax) / (profit + input.otherIncome) : 0,
    marginalRate: tax.marginal.rate,
    tax,
  }
}

function sCorpScenario(input: EntityComparisonInput, profit: number, salary: number) {
  const p = getYear(input.year)
  const s = Math.max(0, Math.min(salary, profit))
  const employerFica = ficaOneSide(s, p)
  const employeeFica = ficaOneSide(s, p)
  const unemployment = s > 0 ? input.unemploymentTaxes : 0
  const preEntity = profit - s - employerFica - input.adminCosts - unemployment
  const entityTax = Math.max(0, preEntity) * Math.max(0, input.stateEntityTaxRate)
  const k1Income = preEntity - entityTax

  const tax = computeFederalTax({
    year: input.year,
    status: input.status,
    otherIncome: input.otherIncome,
    wages: s,
    sCorpOrdinaryIncome: k1Income,
    sCorpW2Wages: s,
    deductionMode: input.deductionMode,
    itemized: { stateLocalTaxes: 0, mortgageInterest: 0, charitableCash: 0, charitableNonCash: 0, medical: 0, other: input.itemizedAmount },
    isSSTB: input.isSSTB,
  })
  const incomeTax = tax.incomeTaxAfterCredits + tax.netInvestmentIncomeTax
  const employmentTax = employerFica + employeeFica + tax.additionalMedicareTax + unemployment
  const entityCosts = input.adminCosts + entityTax
  const total = incomeTax + employmentTax + entityCosts
  return {
    incomeTax,
    employmentTax,
    entityCosts,
    total,
    qbiDeduction: tax.qbiDeduction,
    agi: tax.agi,
    taxableIncome: tax.taxableIncome,
    effectiveRate: profit > 0 ? total / (profit + input.otherIncome) : 0,
    marginalRate: tax.marginal.rate,
    tax,
    employerFica,
    employeeFica,
    k1Income,
    entityTax,
  }
}

export function compareEntities(input: EntityComparisonInput): EntityComparisonResult {
  const profit = Math.max(0, input.netProfit)
  const salary = Math.max(0, Math.min(input.officerSalary, profit))
  const scheduleC = scheduleCScenario(input, profit)
  const sCorp = sCorpScenario(input, profit, salary)
  const savings = scheduleC.total - sCorp.total
  const salaryShare = profit > 0 ? salary / profit : 0

  const sensitivity: { salary: number; savings: number }[] = []
  if (profit > 0) {
    for (let pct = 0.2; pct <= 0.8001; pct += 0.05) {
      const s = Math.round(profit * pct)
      sensitivity.push({ salary: s, savings: scheduleC.total - sCorpScenario(input, profit, s).total })
    }
  }

  // Breakeven: lowest profit (same salary share) at which the S corp saves money.
  let breakevenProfit: number | null = null
  const share = salaryShare || 0.4
  for (let pr = 10_000; pr <= 1_000_000; pr += 2_500) {
    const sc = scheduleCScenario(input, pr).total
    const s = sCorpScenario(input, pr, pr * share).total
    if (sc - s > 0) {
      breakevenProfit = pr
      break
    }
  }

  let reasonableCompWarning: string | null = null
  if (profit > 0 && salary === 0) {
    reasonableCompWarning = 'An S corporation officer who performs services must receive reasonable W-2 compensation before taking distributions.'
  } else if (profit > 0 && salaryShare < 0.3) {
    reasonableCompWarning = `Officer salary is ${Math.round(salaryShare * 100)}% of profit. Low salaries relative to distributions are a recurring IRS exam issue — support the figure with a compensation study.`
  }

  const threshold = Math.max(1_000, profit * 0.01)
  return {
    scheduleC,
    sCorp,
    savings,
    recommendation: savings > threshold ? 's-corp' : savings < -threshold ? 'schedule-c' : 'neutral',
    salaryShare,
    sensitivity,
    breakevenProfit,
    reasonableCompWarning,
  }
}
