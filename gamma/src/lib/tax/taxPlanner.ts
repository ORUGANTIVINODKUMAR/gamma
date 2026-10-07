/**
 * Tax Planner — full-year federal projection with strategy modeling.
 *
 * Builds a baseline projection, then measures each strategy on its own and in
 * combination against that baseline so the advisor sees both the marginal
 * value of every move and the realistic combined outcome.
 */

import { computeFederalTax, type ItemizedInput, type TaxProfile, type TaxResult } from './engine'
import { getYear, type FilingStatus, type TaxYear } from './years'

export interface TaxPlannerInput {
  year: TaxYear
  status: FilingStatus
  taxpayers65Plus: number
  age50Plus: boolean
  childrenUnder17: number
  otherDependents: number
  wages: number
  current401k: number
  selfEmploymentIncome: number
  taxableInterest: number
  ordinaryDividends: number
  qualifiedDividends: number
  shortTermGains: number
  longTermGains: number
  retirementDistributions: number
  socialSecurityBenefits: number
  otherIncome: number
  hsaCoverage: 'none' | 'self' | 'family'
  currentHsa: number
  otherAdjustments: number
  itemized: ItemizedInput
  otherCredits: number
  withholding: number
  estimatedPayments: number
  strategies: {
    max401k: boolean
    maxHsa: boolean
    charitableBunching: boolean
    charitableBunchingAmount: number
    lossHarvesting: boolean
    lossHarvestingAmount: number
    rothConversion: boolean
    rothConversionAmount: number
  }
}

export const TAX_PLANNER_EXAMPLE: TaxPlannerInput = {
  year: 2026,
  status: 'mfj',
  taxpayers65Plus: 0,
  age50Plus: true,
  childrenUnder17: 1,
  otherDependents: 0,
  wages: 312_000,
  current401k: 12_000,
  selfEmploymentIncome: 38_500,
  taxableInterest: 4_200,
  ordinaryDividends: 11_600,
  qualifiedDividends: 9_300,
  shortTermGains: 3_400,
  longTermGains: 26_800,
  retirementDistributions: 0,
  socialSecurityBenefits: 0,
  otherIncome: 0,
  hsaCoverage: 'family',
  currentHsa: 3_000,
  otherAdjustments: 0,
  itemized: {
    stateLocalTaxes: 31_800,
    mortgageInterest: 18_900,
    charitableCash: 9_500,
    charitableNonCash: 1_200,
    medical: 0,
    other: 0,
  },
  otherCredits: 0,
  withholding: 52_000,
  estimatedPayments: 8_000,
  strategies: {
    max401k: true,
    maxHsa: true,
    charitableBunching: true,
    charitableBunchingAmount: 20_000,
    lossHarvesting: true,
    lossHarvestingAmount: 15_000,
    rothConversion: false,
    rothConversionAmount: 25_000,
  },
}

export type StrategyKey = 'max401k' | 'maxHsa' | 'charitableBunching' | 'lossHarvesting' | 'rothConversion'

export interface StrategyImpact {
  key: StrategyKey
  label: string
  description: string
  amount: number
  /** Change in total tax (negative = savings). */
  taxChange: number
  enabled: boolean
}

export interface TaxPlannerResult {
  baseline: TaxResult
  planned: TaxResult
  strategies: StrategyImpact[]
  combinedChange: number
  payments: number
  baselineRefund: number
  plannedRefund: number
  limits: { elective401k: number; hsa: number }
  /** Ordinary income that fits before the next bracket starts (baseline). */
  bracketRoom: number
}

function baseProfile(i: TaxPlannerInput): TaxProfile {
  return {
    year: i.year,
    status: i.status,
    wages: Math.max(0, i.wages),
    selfEmploymentIncome: i.selfEmploymentIncome,
    taxableInterest: i.taxableInterest,
    ordinaryDividends: i.ordinaryDividends,
    qualifiedDividends: i.qualifiedDividends,
    shortTermGains: i.shortTermGains,
    longTermGains: i.longTermGains,
    taxableRetirement: i.retirementDistributions,
    socialSecurityBenefits: i.socialSecurityBenefits,
    otherIncome: i.otherIncome,
    adjustments: i.currentHsa + i.otherAdjustments,
    deductionMode: 'auto',
    itemized: i.itemized,
    taxpayers65Plus: i.taxpayers65Plus,
    childrenUnder17: i.childrenUnder17,
    otherDependents: i.otherDependents,
    otherNonrefundableCredits: i.otherCredits,
  }
}

type Modifier = (p: TaxProfile) => TaxProfile

export function planTaxes(input: TaxPlannerInput): TaxPlannerResult {
  const yp = getYear(input.year)
  const limit401k = yp.retirement.elective401k + (input.age50Plus ? yp.retirement.catchUp50 : 0)
  const hsaLimit =
    input.hsaCoverage === 'family' ? yp.retirement.hsaFamily : input.hsaCoverage === 'self' ? yp.retirement.hsaSelf : 0
  const add401k = Math.min(Math.max(0, limit401k - input.current401k), Math.max(0, input.wages))
  const addHsa = Math.max(0, hsaLimit - input.currentHsa)
  const s = input.strategies

  const mods: Record<StrategyKey, { mod: Modifier; amount: number; label: string; description: string }> = {
    max401k: {
      amount: add401k,
      label: 'Maximize 401(k) deferrals',
      description: `Defer an additional amount to reach the ${input.year} limit of $${limit401k.toLocaleString('en-US')}${input.age50Plus ? ' (incl. catch-up)' : ''}.`,
      mod: (p) => ({ ...p, wages: (p.wages ?? 0) - add401k }),
    },
    maxHsa: {
      amount: addHsa,
      label: 'Fully fund the HSA',
      description:
        input.hsaCoverage === 'none'
          ? 'Requires HDHP coverage — not eligible as entered.'
          : `Contribute up to the ${input.hsaCoverage} coverage limit of $${hsaLimit.toLocaleString('en-US')}.`,
      mod: (p) => ({ ...p, adjustments: (p.adjustments ?? 0) + addHsa }),
    },
    charitableBunching: {
      amount: Math.max(0, s.charitableBunchingAmount),
      label: 'Bunch charitable gifts',
      description: 'Accelerate future giving into this year (e.g. via a donor-advised fund) to clear the standard deduction.',
      mod: (p) => ({
        ...p,
        itemized: { ...(p.itemized ?? input.itemized), charitableCash: (p.itemized ?? input.itemized).charitableCash + Math.max(0, s.charitableBunchingAmount) },
      }),
    },
    lossHarvesting: {
      amount: Math.max(0, s.lossHarvestingAmount),
      label: 'Harvest capital losses',
      description: 'Realize unrealized losses to offset gains, plus up to $3,000 of ordinary income.',
      mod: (p) => ({ ...p, shortTermGains: (p.shortTermGains ?? 0) - Math.max(0, s.lossHarvestingAmount) }),
    },
    rothConversion: {
      amount: Math.max(0, s.rothConversionAmount),
      label: 'Roth conversion',
      description: 'Convert pre-tax IRA dollars to Roth now; adds taxable income this year for tax-free growth later.',
      mod: (p) => ({ ...p, taxableRetirement: (p.taxableRetirement ?? 0) + Math.max(0, s.rothConversionAmount) }),
    },
  }

  const base = baseProfile(input)
  const baseline = computeFederalTax(base)
  const keys = Object.keys(mods) as StrategyKey[]

  const strategies: StrategyImpact[] = keys.map((key) => {
    const m = mods[key]
    const solo = computeFederalTax(m.mod(base))
    return {
      key,
      label: m.label,
      description: m.description,
      amount: m.amount,
      taxChange: solo.totalTax - baseline.totalTax,
      enabled: s[key],
    }
  })

  const plannedProfile = keys.filter((k) => s[k]).reduce((p, k) => mods[k].mod(p), base)
  const planned = computeFederalTax(plannedProfile)
  const payments = Math.max(0, input.withholding) + Math.max(0, input.estimatedPayments)

  return {
    baseline,
    planned,
    strategies,
    combinedChange: planned.totalTax - baseline.totalTax,
    payments,
    baselineRefund: payments - baseline.netTaxLiability,
    plannedRefund: payments - planned.netTaxLiability,
    limits: { elective401k: limit401k, hsa: hsaLimit },
    bracketRoom: baseline.marginal.room,
  }
}
