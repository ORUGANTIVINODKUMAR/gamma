/**
 * Tapreco federal individual tax engine.
 *
 * A single, pure computation (`computeFederalTax`) shared by every tool so a
 * client's numbers are identical whichever tool produced them. Mirrors the
 * Form 1040 flow: income → AGI → deductions → QBI → tax (with the Qualified
 * Dividends & Capital Gain Tax Worksheet) → credits → other taxes.
 *
 * Deliberate simplifications (surfaced in each tool's "Assumptions" panel):
 * no AMT, no 25%/28% capital-gain rate classes, tax computed from rate
 * schedules (not the $50-step tax table), FTC limited to tax (no Form 1116
 * basket limitation), no state tax.
 */

import { getYear, isMarried, type FilingStatus, type TaxYear, type YearParams } from './years'

export interface ItemizedInput {
  /** State/local income (or sales) + property taxes paid. */
  stateLocalTaxes: number
  mortgageInterest: number
  charitableCash: number
  charitableNonCash: number
  /** Unreimbursed medical/dental, before the 7.5%-of-AGI floor. */
  medical: number
  other: number
}

export const EMPTY_ITEMIZED: ItemizedInput = {
  stateLocalTaxes: 0,
  mortgageInterest: 0,
  charitableCash: 0,
  charitableNonCash: 0,
  medical: 0,
  other: 0,
}

export type DeductionMode = 'auto' | 'standard' | 'itemized'

export interface TaxProfile {
  year: TaxYear
  status: FilingStatus
  wages?: number
  selfEmploymentIncome?: number
  /** S corporation K-1 ordinary business income (non-passive, QBI). */
  sCorpOrdinaryIncome?: number
  /** W-2 wages paid by the S corporation (for the §199A wage limitation). */
  sCorpW2Wages?: number
  taxableInterest?: number
  taxExemptInterest?: number
  /** Total ordinary dividends (1099-DIV box 1a), including qualified. */
  ordinaryDividends?: number
  /** Qualified dividends (box 1b) — a subset of ordinary dividends. */
  qualifiedDividends?: number
  /** Section 199A (REIT) dividends (box 5) — a subset of ordinary dividends. */
  section199ADividends?: number
  shortTermGains?: number
  /** Net long-term gains, including capital gain distributions. */
  longTermGains?: number
  taxableRetirement?: number
  socialSecurityBenefits?: number
  otherIncome?: number
  /** Above-the-line adjustments other than ½ SE tax (401k is excluded from wages, not here). */
  adjustments?: number
  deductionMode?: DeductionMode
  itemized?: ItemizedInput
  taxpayers65Plus?: number
  childrenUnder17?: number
  otherDependents?: number
  otherNonrefundableCredits?: number
  foreignTaxPaid?: number
  /** Specified service trade or business (affects §199A above threshold). */
  isSSTB?: boolean
}

export interface BracketPosition {
  rate: number
  floor: number
  top: number
  /** Taxable income remaining before the next bracket (Infinity in top bracket). */
  room: number
  index: number
}

export interface TaxResult {
  year: TaxYear
  status: FilingStatus
  totalIncome: number
  agi: number
  magi: number
  taxableSocialSecurity: number
  capital: {
    netShortTerm: number
    netLongTerm: number
    includedInIncome: number
    preferentialGain: number
    lossDeducted: number
    carryforward: number
  }
  halfSeTaxDeduction: number
  standardDeduction: number
  itemizedDeduction: number
  deductionType: 'standard' | 'itemized'
  deduction: number
  seniorDeduction: number
  nonItemizerCharitable: number
  qbiDeduction: number
  taxableIncome: number
  preferentialIncome: number
  ordinaryTaxableIncome: number
  regularTax: number
  preferentialTax: number
  credits: {
    foreignTax: number
    childTax: number
    otherDependent: number
    other: number
    nonrefundableTotal: number
    refundableChildTax: number
  }
  incomeTaxAfterCredits: number
  selfEmploymentTax: number
  additionalMedicareTax: number
  netInvestmentIncomeTax: number
  /** Total tax (Form 1040 line 24 equivalent). */
  totalTax: number
  /** Total tax less refundable credits — the figure payments must cover. */
  netTaxLiability: number
  effectiveRate: number
  marginal: BracketPosition
}

const n = (v: number | undefined): number => (Number.isFinite(v) ? (v as number) : 0)
const pos = (v: number): number => (v > 0 ? v : 0)

/** Tax on ordinary taxable income from the rate schedule. */
export function bracketTax(taxable: number, status: FilingStatus, p: YearParams): number {
  const tops = p.bracketTops[status]
  let tax = 0
  let lower = 0
  for (let i = 0; i < p.rates.length; i++) {
    const upper = i < tops.length ? tops[i]! : Infinity
    if (taxable <= lower) break
    tax += (Math.min(taxable, upper) - lower) * p.rates[i]!
    lower = upper
  }
  return tax
}

export function marginalBracket(taxable: number, status: FilingStatus, p: YearParams): BracketPosition {
  const tops = p.bracketTops[status]
  let index = tops.findIndex((top) => taxable < top)
  if (index === -1) index = tops.length
  const floor = index === 0 ? 0 : tops[index - 1]!
  const top = index < tops.length ? tops[index]! : Infinity
  return { rate: p.rates[index]!, floor, top, room: top - taxable, index }
}

function overlap(a0: number, a1: number, b0: number, b1: number): number {
  return pos(Math.min(a1, b1) - Math.max(a0, b0))
}

/**
 * Qualified Dividends and Capital Gain Tax Worksheet.
 * Preferential income stacks on top of ordinary income.
 */
export function taxWithPreferential(
  taxable: number,
  preferential: number,
  status: FilingStatus,
  p: YearParams,
): { ordinary: number; preferential: number; total: number; bands: { zero: number; fifteen: number; twenty: number } } {
  const t = pos(taxable)
  const pref = Math.min(pos(preferential), t)
  const ord = t - pref
  const ordinaryTax = bracketTax(ord, status, p)
  const zeroTop = p.capitalGainZeroTop[status]
  const fifteenTop = p.capitalGainFifteenTop[status]
  const zero = overlap(ord, t, 0, zeroTop)
  const fifteen = overlap(ord, t, zeroTop, fifteenTop)
  const twenty = overlap(ord, t, fifteenTop, Infinity)
  const prefTax = fifteen * 0.15 + twenty * 0.2
  const total = Math.min(ordinaryTax + prefTax, bracketTax(t, status, p))
  return { ordinary: ordinaryTax, preferential: total - ordinaryTax, total, bands: { zero, fifteen, twenty } }
}

/** Schedule SE. `wages` are FICA wages already subject to Social Security. */
export function selfEmploymentTax(netEarnings: number, wages: number, p: YearParams) {
  const base = netEarnings * 0.9235
  if (base < 400) return { base: 0, socialSecurity: 0, medicare: 0, total: 0, deductibleHalf: 0 }
  const ssRoom = pos(p.socialSecurityWageBase - wages)
  const socialSecurity = Math.min(base, ssRoom) * 0.124
  const medicare = base * 0.029
  const total = socialSecurity + medicare
  return { base, socialSecurity, medicare, total, deductibleHalf: total / 2 }
}

/** One side (employee OR employer) of FICA on W-2 wages. */
export function ficaOneSide(wages: number, p: YearParams): number {
  return Math.min(pos(wages), p.socialSecurityWageBase) * 0.062 + pos(wages) * 0.0145
}

export function additionalMedicareTax(wages: number, seBase: number, status: FilingStatus, p: YearParams): number {
  const thr = p.surtaxThreshold[status]
  const onWages = pos(wages - thr) * 0.009
  const onSe = pos(seBase - pos(thr - wages)) * 0.009
  return onWages + onSe
}

/** §199A deduction (non-SSTB/SSTB, W-2 wage limit; UBIA alternative not modeled). */
export function qbiDeduction(args: {
  qbi: number
  w2Wages: number
  reitDividends: number
  taxableBeforeQbi: number
  netCapitalGain: number
  isSSTB: boolean
  status: FilingStatus
  p: YearParams
}): number {
  const { qbi, w2Wages, reitDividends, taxableBeforeQbi, netCapitalGain, isSSTB, status, p } = args
  const threshold = p.qbi.threshold[status]
  const range = p.qbi.phaseInRange[status]
  const excess = pos(taxableBeforeQbi - threshold)
  let component = 0

  if (qbi > 0) {
    let q = qbi
    let w = w2Wages
    if (isSSTB && excess > 0) {
      const applicable = pos(1 - excess / range)
      q *= applicable
      w *= applicable
    }
    const tentative = q * 0.2
    const wageLimit = w * 0.5
    if (excess <= 0) {
      component = tentative
    } else if (excess >= range) {
      component = Math.min(tentative, wageLimit)
    } else {
      const reduction = pos(tentative - wageLimit) * (excess / range)
      component = tentative - reduction
    }
  }

  const reit = pos(reitDividends) * 0.2
  const incomeLimit = pos(taxableBeforeQbi - netCapitalGain) * 0.2
  return Math.min(component + reit, incomeLimit)
}

function taxableSocialSecurity(benefits: number, otherIncome: number, taxExempt: number, status: FilingStatus): number {
  if (benefits <= 0) return 0
  const provisional = otherIncome + taxExempt + benefits * 0.5
  if (status === 'mfs') return Math.min(benefits * 0.85, pos(provisional) * 0.85)
  const base1 = status === 'mfj' ? 32_000 : 25_000
  const base2 = status === 'mfj' ? 44_000 : 34_000
  if (provisional <= base1) return 0
  if (provisional <= base2) return Math.min(benefits * 0.5, (provisional - base1) * 0.5)
  return Math.min(benefits * 0.85, (provisional - base2) * 0.85 + Math.min(benefits * 0.5, (base2 - base1) * 0.5))
}

export function computeItemized(it: ItemizedInput, agi: number, magi: number, status: FilingStatus, p: YearParams) {
  const capReduced = Math.max(p.salt.floor[status], p.salt.cap[status] - pos(magi - p.salt.phaseDownStart[status]) * 0.3)
  const salt = Math.min(pos(it.stateLocalTaxes), capReduced)
  const medical = pos(pos(it.medical) - pos(agi) * 0.075)
  const charitableGross = pos(it.charitableCash) + pos(it.charitableNonCash)
  const charitable = Math.min(pos(charitableGross - pos(agi) * p.charitableFloorPctOfAgi), pos(agi) * 0.6)
  const total = salt + medical + charitable + pos(it.mortgageInterest) + pos(it.other)
  return { salt, saltCap: capReduced, medical, charitable, total }
}

export function computeFederalTax(profile: TaxProfile): TaxResult {
  const p = getYear(profile.year)
  const status = profile.status

  const wages = n(profile.wages)
  const se = n(profile.selfEmploymentIncome)
  const sCorp = n(profile.sCorpOrdinaryIncome)
  const interest = n(profile.taxableInterest)
  const ordDiv = pos(n(profile.ordinaryDividends))
  const qualDiv = Math.min(pos(n(profile.qualifiedDividends)), ordDiv)
  const reitDiv = Math.min(pos(n(profile.section199ADividends)), ordDiv)
  const retirement = n(profile.taxableRetirement)
  const other = n(profile.otherIncome)

  // Capital gain netting (Schedule D)
  const st = n(profile.shortTermGains)
  const lt = n(profile.longTermGains)
  const net = st + lt
  const lossLimit = p.capitalLossLimit[status]
  const capitalIncluded = net >= 0 ? net : Math.max(net, -lossLimit)
  const preferentialGain = net > 0 && lt > 0 ? Math.min(lt, net) : 0

  // Schedule SE
  const seTax = selfEmploymentTax(se, wages, p)

  const incomeExSS = wages + se + sCorp + interest + ordDiv + capitalIncluded + retirement + other
  const adjustments = n(profile.adjustments) + seTax.deductibleHalf
  const agiExSS = incomeExSS - adjustments
  const ssTaxable = taxableSocialSecurity(n(profile.socialSecurityBenefits), agiExSS, n(profile.taxExemptInterest), status)
  const totalIncome = incomeExSS + ssTaxable
  const agi = agiExSS + ssTaxable
  const magi = agi

  // Deductions
  const seniors = Math.min(Math.max(Math.round(n(profile.taxpayers65Plus)), 0), status === 'mfj' ? 2 : 1)
  const standard =
    p.standardDeduction[status] +
    seniors * (isMarried(status) ? p.additionalStdDeduction65.married : p.additionalStdDeduction65.unmarried)
  const itemizedInput = profile.itemized ?? EMPTY_ITEMIZED
  const itemized = computeItemized(itemizedInput, agi, magi, status, p).total
  const mode = profile.deductionMode ?? 'auto'
  const deductionType: 'standard' | 'itemized' =
    mode === 'standard' ? 'standard' : mode === 'itemized' ? 'itemized' : itemized > standard ? 'itemized' : 'standard'
  const deduction = deductionType === 'itemized' ? itemized : standard

  const seniorDeduction =
    status === 'mfs'
      ? 0
      : seniors * pos(p.seniorDeduction.amount - pos(magi - p.seniorDeduction.phaseOutStart[status]) * p.seniorDeduction.rate)

  const nonItemizerCharitable =
    deductionType === 'standard' ? Math.min(pos(itemizedInput.charitableCash), p.nonItemizerCharitable[status]) : 0

  const taxableBeforeQbi = pos(agi - deduction - seniorDeduction - nonItemizerCharitable)
  const netCapitalGainForLimit = preferentialGain + qualDiv
  const qbi = qbiDeduction({
    qbi: (se > 0 ? se - seTax.deductibleHalf : se) + sCorp,
    w2Wages: n(profile.sCorpW2Wages),
    reitDividends: reitDiv,
    taxableBeforeQbi,
    netCapitalGain: netCapitalGainForLimit,
    isSSTB: !!profile.isSSTB,
    status,
    p,
  })

  const taxableIncome = pos(taxableBeforeQbi - qbi)
  const preferentialIncome = Math.min(preferentialGain + qualDiv, taxableIncome)
  const tax = taxWithPreferential(taxableIncome, preferentialIncome, status, p)
  const regularTax = tax.total

  // Credits (FTC first, then CTC/ODC, then other nonrefundable)
  let remaining = regularTax
  const foreignTax = Math.min(pos(n(profile.foreignTaxPaid)), remaining)
  remaining -= foreignTax

  const children = Math.max(0, Math.round(n(profile.childrenUnder17)))
  const otherDeps = Math.max(0, Math.round(n(profile.otherDependents)))
  const ctc = p.childTaxCredit
  const potentialChild = children * ctc.perChild
  const potentialOther = otherDeps * ctc.otherDependent
  const phaseOut = Math.ceil(pos(magi - ctc.phaseOutStart[status]) / 1000) * 50
  const allowedTotal = pos(potentialChild + potentialOther - phaseOut)
  const allowedChild = Math.min(potentialChild, allowedTotal)
  const allowedOther = allowedTotal - allowedChild

  const childTax = Math.min(allowedChild, remaining)
  remaining -= childTax
  const otherDependent = Math.min(allowedOther, remaining)
  remaining -= otherDependent
  const otherCredits = Math.min(pos(n(profile.otherNonrefundableCredits)), remaining)
  remaining -= otherCredits

  const earned = wages + pos(se - seTax.deductibleHalf)
  const refundableChildTax = Math.min(
    pos(allowedChild - childTax),
    children * ctc.refundablePerChild,
    pos(earned - 2_500) * 0.15,
  )

  const nonrefundableTotal = foreignTax + childTax + otherDependent + otherCredits
  const incomeTaxAfterCredits = regularTax - nonrefundableTotal

  const addlMedicare = additionalMedicareTax(wages, seTax.base, status, p)
  const nii = interest + ordDiv + pos(capitalIncluded)
  const niit = Math.min(nii, pos(magi - p.surtaxThreshold[status])) * 0.038

  const totalTax = incomeTaxAfterCredits + seTax.total + addlMedicare + niit
  const marginal = marginalBracket(taxableIncome, status, p)

  return {
    year: profile.year,
    status,
    totalIncome,
    agi,
    magi,
    taxableSocialSecurity: ssTaxable,
    capital: {
      netShortTerm: st,
      netLongTerm: lt,
      includedInIncome: capitalIncluded,
      preferentialGain,
      lossDeducted: capitalIncluded < 0 ? -capitalIncluded : 0,
      carryforward: net < 0 ? net - capitalIncluded : 0,
    },
    halfSeTaxDeduction: seTax.deductibleHalf,
    standardDeduction: standard,
    itemizedDeduction: itemized,
    deductionType,
    deduction,
    seniorDeduction,
    nonItemizerCharitable,
    qbiDeduction: qbi,
    taxableIncome,
    preferentialIncome,
    ordinaryTaxableIncome: taxableIncome - preferentialIncome,
    regularTax,
    preferentialTax: tax.preferential,
    credits: {
      foreignTax,
      childTax,
      otherDependent,
      other: otherCredits,
      nonrefundableTotal,
      refundableChildTax,
    },
    incomeTaxAfterCredits,
    selfEmploymentTax: seTax.total,
    additionalMedicareTax: addlMedicare,
    netInvestmentIncomeTax: niit,
    totalTax,
    netTaxLiability: totalTax - refundableChildTax,
    effectiveRate: totalIncome > 0 ? totalTax / totalIncome : 0,
    marginal,
  }
}
