/**
 * Mutual Fund Tax Calculator.
 *
 * Measures the *incremental* federal tax a fund adds to a household by
 * computing the full return with and without the fund (so bracket stacking,
 * the 0/15/20% bands, NIIT and the §199A limit are all respected), then
 * attributing the difference to each income character in a fixed order.
 */

import { computeFederalTax, type TaxProfile, type TaxResult } from './engine'
import { getYear, type FilingStatus, type TaxYear } from './years'

export interface MutualFundInput {
  year: TaxYear
  status: FilingStatus
  fundName: string
  /** Fund value at the start of the year — enables the tax-drag metric. */
  fundValue: number
  /** Household wages and other ordinary income, excluding this fund. */
  otherIncome: number
  deductionMode: 'standard' | 'itemized'
  itemizedAmount: number
  /** 1099-DIV */
  ordinaryDividends: number
  qualifiedDividends: number
  capitalGainDistributions: number
  section199ADividends: number
  nondividendDistributions: number
  foreignTaxPaid: number
  exemptInterestDividends: number
  /** Redemptions during the year */
  sharesSold: boolean
  saleProceeds: number
  costBasis: number
  holdingPeriod: 'long' | 'short'
}

export const MUTUAL_FUND_EXAMPLE: MutualFundInput = {
  year: 2026,
  status: 'mfj',
  fundName: 'Large-Cap Growth Fund — Class A',
  fundValue: 425_000,
  otherIncome: 238_000,
  deductionMode: 'standard',
  itemizedAmount: 0,
  ordinaryDividends: 9_840,
  qualifiedDividends: 7_215,
  capitalGainDistributions: 18_620,
  section199ADividends: 410,
  nondividendDistributions: 0,
  foreignTaxPaid: 265,
  exemptInterestDividends: 0,
  sharesSold: true,
  saleProceeds: 60_000,
  costBasis: 41_750,
  holdingPeriod: 'long',
}

export interface AttributionStep {
  key: 'ordinary' | 'section199A' | 'qualified' | 'longTerm' | 'foreignCredit'
  label: string
  /** Income added in this step (0 for credit/deduction steps). */
  income: number
  /** Incremental federal tax from this step (negative = savings). */
  tax: number
  character: string
}

export interface MutualFundResult {
  saleGain: number
  totalDistributions: number
  taxableFundIncome: number
  ordinaryRateIncome: number
  qualifiedIncome: number
  longTermIncome: number
  exemptIncome: number
  returnOfCapital: number
  adjustedBasisAfterRoc: number
  steps: AttributionStep[]
  incrementalTax: number
  niitIncrement: number
  effectiveRateOnFund: number
  taxDrag: number | null
  afterTaxCashFlow: number
  ftcExceedsDeMinimis: boolean
  capitalLossCarryforward: number
  baseline: TaxResult
  withFund: TaxResult
}

function profileFor(input: MutualFundInput, parts: {
  ordinary: number
  shortTerm: number
  section199A: number
  qualified: number
  longTerm: number
  foreignTax: number
}): TaxProfile {
  return {
    year: input.year,
    status: input.status,
    otherIncome: input.otherIncome,
    deductionMode: input.deductionMode,
    itemized: { stateLocalTaxes: 0, mortgageInterest: 0, charitableCash: 0, charitableNonCash: 0, medical: 0, other: input.itemizedAmount },
    ordinaryDividends: parts.ordinary + parts.qualified,
    qualifiedDividends: parts.qualified,
    section199ADividends: parts.section199A,
    shortTermGains: parts.shortTerm,
    longTermGains: parts.longTerm,
    taxExemptInterest: input.exemptInterestDividends,
    foreignTaxPaid: parts.foreignTax,
  }
}

export function calculateMutualFundTax(input: MutualFundInput): MutualFundResult {
  const p = getYear(input.year)
  const ordinaryDiv = Math.max(0, input.ordinaryDividends)
  const qualified = Math.min(Math.max(0, input.qualifiedDividends), ordinaryDiv)
  const nonQualified = ordinaryDiv - qualified
  const section199A = Math.min(Math.max(0, input.section199ADividends), nonQualified)
  const saleGain = input.sharesSold ? input.saleProceeds - input.costBasis : 0
  const shortTerm = input.holdingPeriod === 'short' ? saleGain : 0
  const longTermSale = input.holdingPeriod === 'long' ? saleGain : 0
  const longTerm = Math.max(0, input.capitalGainDistributions) + longTermSale

  const zero = { ordinary: 0, shortTerm: 0, section199A: 0, qualified: 0, longTerm: 0, foreignTax: 0 }
  const s0 = computeFederalTax(profileFor(input, zero))
  const s1 = computeFederalTax(profileFor(input, { ...zero, ordinary: nonQualified, shortTerm }))
  const s2 = computeFederalTax(profileFor(input, { ...zero, ordinary: nonQualified, shortTerm, section199A }))
  const s3 = computeFederalTax(profileFor(input, { ...zero, ordinary: nonQualified, shortTerm, section199A, qualified }))
  const s4 = computeFederalTax(profileFor(input, { ordinary: nonQualified, shortTerm, section199A, qualified, longTerm, foreignTax: 0 }))
  const s5 = computeFederalTax(
    profileFor(input, { ordinary: nonQualified, shortTerm, section199A, qualified, longTerm, foreignTax: input.foreignTaxPaid }),
  )

  const steps: AttributionStep[] = [
    {
      key: 'ordinary',
      label: input.holdingPeriod === 'short' && input.sharesSold ? 'Non-qualified dividends & short-term gain' : 'Non-qualified dividends',
      income: nonQualified + shortTerm,
      tax: s1.totalTax - s0.totalTax,
      character: 'Ordinary rates',
    },
    {
      key: 'section199A',
      label: 'Section 199A dividend deduction',
      income: 0,
      tax: s2.totalTax - s1.totalTax,
      character: '20% deduction',
    },
    {
      key: 'qualified',
      label: 'Qualified dividends',
      income: qualified,
      tax: s3.totalTax - s2.totalTax,
      character: '0 / 15 / 20%',
    },
    {
      key: 'longTerm',
      label: input.sharesSold && input.holdingPeriod === 'long' ? 'Capital gain distributions & sale' : 'Capital gain distributions',
      income: longTerm,
      tax: s4.totalTax - s3.totalTax,
      character: '0 / 15 / 20%',
    },
    {
      key: 'foreignCredit',
      label: 'Foreign tax credit',
      income: 0,
      tax: s5.totalTax - s4.totalTax,
      character: 'Credit',
    },
  ]

  const incrementalTax = s5.totalTax - s0.totalTax
  const totalDistributions =
    ordinaryDiv + Math.max(0, input.capitalGainDistributions) + Math.max(0, input.exemptInterestDividends) + Math.max(0, input.nondividendDistributions)
  const taxableFundIncome = nonQualified + shortTerm + qualified + longTerm

  return {
    saleGain,
    totalDistributions,
    taxableFundIncome,
    ordinaryRateIncome: nonQualified + shortTerm,
    qualifiedIncome: qualified,
    longTermIncome: longTerm,
    exemptIncome: Math.max(0, input.exemptInterestDividends),
    returnOfCapital: Math.max(0, input.nondividendDistributions),
    adjustedBasisAfterRoc: Math.max(0, input.costBasis - Math.max(0, input.nondividendDistributions)),
    steps,
    incrementalTax,
    niitIncrement: s5.netInvestmentIncomeTax - s0.netInvestmentIncomeTax,
    effectiveRateOnFund: taxableFundIncome > 0 ? incrementalTax / taxableFundIncome : 0,
    taxDrag: input.fundValue > 0 ? incrementalTax / input.fundValue : null,
    afterTaxCashFlow: totalDistributions - incrementalTax,
    ftcExceedsDeMinimis: input.foreignTaxPaid > p.foreignTaxDeMinimis[input.status],
    capitalLossCarryforward: Math.abs(s5.capital.carryforward),
    baseline: s0,
    withFund: s5,
  }
}
