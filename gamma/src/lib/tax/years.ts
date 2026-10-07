/**
 * Federal tax parameters by tax year.
 *
 * Sources: IRS Rev. Proc. 2024-40 (TY2025) as amended by P.L. 119-21
 * ("One Big Beautiful Bill Act", OBBBA), and Rev. Proc. 2025-32 (TY2026).
 * Every number the calculators use lives here so it can be reviewed in one
 * place. When the IRS publishes a new year, add an entry — no calculator
 * code changes are required.
 */

export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh'
export type TaxYear = 2025 | 2026

export const TAX_YEARS: readonly TaxYear[] = [2025, 2026]
export const DEFAULT_TAX_YEAR: TaxYear = 2026

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  mfj: 'Married filing jointly',
  mfs: 'Married filing separately',
  hoh: 'Head of household',
}

type ByStatus<T> = Record<FilingStatus, T>

export interface YearParams {
  year: TaxYear
  /** Ordinary rates and the upper bound of each bracket (last bracket open-ended). */
  rates: readonly number[]
  bracketTops: ByStatus<readonly number[]>
  standardDeduction: ByStatus<number>
  /** Additional standard deduction per taxpayer age 65+ (married vs unmarried). */
  additionalStdDeduction65: { married: number; unmarried: number }
  /** OBBBA senior deduction (2025–2028): per qualifying individual, 6% phase-out. */
  seniorDeduction: { amount: number; phaseOutStart: ByStatus<number>; rate: number }
  /** Top of the 0% and 15% long-term capital gain / qualified dividend bands. */
  capitalGainZeroTop: ByStatus<number>
  capitalGainFifteenTop: ByStatus<number>
  socialSecurityWageBase: number
  /** Threshold for 0.9% Additional Medicare Tax and 3.8% NIIT (not indexed). */
  surtaxThreshold: ByStatus<number>
  /** SALT cap with OBBBA phase-down above MAGI threshold (30% of excess, floor). */
  salt: { cap: ByStatus<number>; phaseDownStart: ByStatus<number>; floor: ByStatus<number> }
  /** OBBBA: itemized charitable deductions only above 0.5% of AGI (from 2026). */
  charitableFloorPctOfAgi: number
  /** OBBBA: cash charitable deduction for non-itemizers (from 2026). */
  nonItemizerCharitable: ByStatus<number>
  childTaxCredit: { perChild: number; refundablePerChild: number; otherDependent: number; phaseOutStart: ByStatus<number> }
  /** §199A: threshold and phase-in range (range widened by OBBBA from 2026). */
  qbi: { threshold: ByStatus<number>; phaseInRange: ByStatus<number> }
  capitalLossLimit: ByStatus<number>
  retirement: { elective401k: number; catchUp50: number; ira: number; hsaSelf: number; hsaFamily: number }
  /** Estimated tax payment due dates (ISO), Q1–Q4. */
  estimatedDueDates: readonly [string, string, string, string]
  /** De minimis foreign tax credit without Form 1116. */
  foreignTaxDeMinimis: ByStatus<number>
}

const RATES = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37] as const

const SURTAX: ByStatus<number> = { single: 200_000, mfj: 250_000, mfs: 125_000, hoh: 200_000 }

export const YEARS: Record<TaxYear, YearParams> = {
  2025: {
    year: 2025,
    rates: RATES,
    bracketTops: {
      single: [11_925, 48_475, 103_350, 197_300, 250_525, 626_350],
      mfj: [23_850, 96_950, 206_700, 394_600, 501_050, 751_600],
      mfs: [11_925, 48_475, 103_350, 197_300, 250_525, 375_800],
      hoh: [17_000, 64_850, 103_350, 197_300, 250_500, 626_350],
    },
    standardDeduction: { single: 15_750, mfj: 31_500, mfs: 15_750, hoh: 23_625 },
    additionalStdDeduction65: { married: 1_600, unmarried: 2_000 },
    seniorDeduction: {
      amount: 6_000,
      phaseOutStart: { single: 75_000, mfj: 150_000, mfs: 0, hoh: 75_000 },
      rate: 0.06,
    },
    capitalGainZeroTop: { single: 48_350, mfj: 96_700, mfs: 48_350, hoh: 64_750 },
    capitalGainFifteenTop: { single: 533_400, mfj: 600_050, mfs: 300_000, hoh: 566_700 },
    socialSecurityWageBase: 176_100,
    surtaxThreshold: SURTAX,
    salt: {
      cap: { single: 40_000, mfj: 40_000, mfs: 20_000, hoh: 40_000 },
      phaseDownStart: { single: 500_000, mfj: 500_000, mfs: 250_000, hoh: 500_000 },
      floor: { single: 10_000, mfj: 10_000, mfs: 5_000, hoh: 10_000 },
    },
    charitableFloorPctOfAgi: 0,
    nonItemizerCharitable: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    childTaxCredit: {
      perChild: 2_200,
      refundablePerChild: 1_700,
      otherDependent: 500,
      phaseOutStart: { single: 200_000, mfj: 400_000, mfs: 200_000, hoh: 200_000 },
    },
    qbi: {
      threshold: { single: 197_300, mfj: 394_600, mfs: 197_300, hoh: 197_300 },
      phaseInRange: { single: 50_000, mfj: 100_000, mfs: 50_000, hoh: 50_000 },
    },
    capitalLossLimit: { single: 3_000, mfj: 3_000, mfs: 1_500, hoh: 3_000 },
    retirement: { elective401k: 23_500, catchUp50: 7_500, ira: 7_000, hsaSelf: 4_300, hsaFamily: 8_550 },
    estimatedDueDates: ['2025-04-15', '2025-06-16', '2025-09-15', '2026-01-15'],
    foreignTaxDeMinimis: { single: 300, mfj: 600, mfs: 300, hoh: 300 },
  },
  2026: {
    year: 2026,
    rates: RATES,
    bracketTops: {
      single: [12_400, 50_400, 105_700, 201_775, 256_225, 640_600],
      mfj: [24_800, 100_800, 211_400, 403_550, 512_450, 768_700],
      mfs: [12_400, 50_400, 105_700, 201_775, 256_225, 384_350],
      hoh: [17_700, 67_450, 105_700, 201_750, 256_200, 640_600],
    },
    standardDeduction: { single: 16_100, mfj: 32_200, mfs: 16_100, hoh: 24_150 },
    additionalStdDeduction65: { married: 1_650, unmarried: 2_050 },
    seniorDeduction: {
      amount: 6_000,
      phaseOutStart: { single: 75_000, mfj: 150_000, mfs: 0, hoh: 75_000 },
      rate: 0.06,
    },
    capitalGainZeroTop: { single: 49_450, mfj: 98_900, mfs: 49_450, hoh: 66_200 },
    capitalGainFifteenTop: { single: 545_500, mfj: 613_700, mfs: 306_850, hoh: 579_600 },
    socialSecurityWageBase: 184_500,
    surtaxThreshold: SURTAX,
    salt: {
      cap: { single: 40_400, mfj: 40_400, mfs: 20_200, hoh: 40_400 },
      phaseDownStart: { single: 505_000, mfj: 505_000, mfs: 252_500, hoh: 505_000 },
      floor: { single: 10_000, mfj: 10_000, mfs: 5_000, hoh: 10_000 },
    },
    charitableFloorPctOfAgi: 0.005,
    nonItemizerCharitable: { single: 1_000, mfj: 2_000, mfs: 1_000, hoh: 1_000 },
    childTaxCredit: {
      perChild: 2_200,
      refundablePerChild: 1_700,
      otherDependent: 500,
      phaseOutStart: { single: 200_000, mfj: 400_000, mfs: 200_000, hoh: 200_000 },
    },
    qbi: {
      threshold: { single: 201_775, mfj: 403_550, mfs: 201_775, hoh: 201_775 },
      phaseInRange: { single: 75_000, mfj: 150_000, mfs: 75_000, hoh: 75_000 },
    },
    capitalLossLimit: { single: 3_000, mfj: 3_000, mfs: 1_500, hoh: 3_000 },
    retirement: { elective401k: 24_500, catchUp50: 8_000, ira: 7_500, hsaSelf: 4_400, hsaFamily: 8_750 },
    estimatedDueDates: ['2026-04-15', '2026-06-15', '2026-09-15', '2027-01-15'],
    foreignTaxDeMinimis: { single: 300, mfj: 600, mfs: 300, hoh: 300 },
  },
}

export function getYear(year: TaxYear): YearParams {
  return YEARS[year]
}

export function isMarried(status: FilingStatus): boolean {
  return status === 'mfj' || status === 'mfs'
}
