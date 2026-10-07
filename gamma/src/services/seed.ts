/**
 * Sample workspace for first sign-in. Every analysis is produced by the real
 * calculators (not hard-coded numbers) so the dashboard is internally
 * consistent. Sample records are flagged and removable in Settings.
 */

import { AUDIT_RISK_EXAMPLE, analyzeAuditRisk, type AuditRiskInput } from '@/lib/tax/auditRisk'
import { compareEntities, ENTITY_COMPARISON_EXAMPLE, type EntityComparisonInput } from '@/lib/tax/entityComparison'
import { calculateEstimatedTax, ESTIMATED_TAX_EXAMPLE, type EstimatedTaxInput } from '@/lib/tax/estimatedTax'
import { calculateMutualFundTax, MUTUAL_FUND_EXAMPLE, type MutualFundInput } from '@/lib/tax/mutualFund'
import { planTaxes, TAX_PLANNER_EXAMPLE } from '@/lib/tax/taxPlanner'
import { uid } from './storage'
import {
  summarizeAuditRisk,
  summarizeEntityComparison,
  summarizeEstimatedTax,
  summarizeMutualFund,
  summarizeTaxPlanner,
} from './summaries'
import type { Analysis, Client, WorkspaceState } from './workspace'

const HOUR = 3_600_000

export function buildSeedWorkspace(now: number = Date.now()): WorkspaceState {
  const ago = (hours: number) => new Date(now - hours * HOUR).toISOString()

  const c = (
    name: string,
    type: Client['type'],
    entity: Client['entity'],
    state: string,
    createdHoursAgo: number,
    filingStatus?: Client['filingStatus'],
  ): Client => ({ id: uid(), name, type, entity, state, filingStatus, createdAt: ago(createdHoursAgo), sample: true })

  const clients = {
    ortiz: c('Michael & Dana Ortiz', 'Individual', 'Individual', 'CA', 2_100, 'mfj'),
    summit: c('Summit Ridge Consulting', 'Business', 'Sole proprietor', 'CO', 1_900, 'single'),
    raman: c('Priya Raman', 'Individual', 'Individual', 'NY', 1_650, 'single'),
    northgate: c('Northgate Landscaping LLC', 'Business', 'Sole proprietor', 'OH', 1_400, 'mfj'),
    bell: c('Marcus Bell', 'Individual', 'Individual', 'GA', 1_200, 'single'),
    bluewater: c('Bluewater Marine Supply, Inc.', 'Business', 'S corporation', 'WA', 980, 'mfj'),
    kovacs: c('Elena Kovacs', 'Individual', 'Individual', 'IL', 760, 'hoh'),
    whitfield: c('Grace & Thomas Whitfield', 'Individual', 'Individual', 'FL', 520, 'mfj'),
    harper: c('Harper & Lane Dental, PLLC', 'Business', 'S corporation', 'TX', 300, 'mfj'),
    cedar: c('Cedar & Stone Architects LLP', 'Business', 'Partnership', 'MA', 140, 'mfj'),
  }

  const analyses: Analysis[] = []
  const add = (a: Omit<Analysis, 'id' | 'sample'>) => analyses.push({ ...a, id: uid(), sample: true })

  // Tax Planner — Ortiz
  add({
    toolId: 'tax-planner',
    title: '2026 year-end tax plan',
    clientId: clients.ortiz.id,
    createdAt: ago(2),
    input: TAX_PLANNER_EXAMPLE,
    ...summarizeTaxPlanner(planTaxes(TAX_PLANNER_EXAMPLE)),
  })

  // Audit Risk — Summit Ridge (elevated)
  add({
    toolId: 'audit-risk',
    title: 'Pre-filing audit review',
    clientId: clients.summit.id,
    createdAt: ago(19),
    input: AUDIT_RISK_EXAMPLE,
    ...summarizeAuditRisk(analyzeAuditRisk(AUDIT_RISK_EXAMPLE)),
  })

  // Entity Comparison — Northgate
  add({
    toolId: 'entity-comparison',
    title: 'S-corp election analysis',
    clientId: clients.northgate.id,
    createdAt: ago(28),
    input: ENTITY_COMPARISON_EXAMPLE,
    ...summarizeEntityComparison(compareEntities(ENTITY_COMPARISON_EXAMPLE)),
  })

  // Estimated Tax — Northgate owner household
  add({
    toolId: 'estimated-tax',
    title: '2026 quarterly estimates',
    clientId: clients.northgate.id,
    createdAt: ago(52),
    input: ESTIMATED_TAX_EXAMPLE,
    ...summarizeEstimatedTax(calculateEstimatedTax(ESTIMATED_TAX_EXAMPLE, new Date(now))),
  })

  // Mutual Fund — Raman
  const ramanFund: MutualFundInput = {
    ...MUTUAL_FUND_EXAMPLE,
    status: 'single',
    fundName: 'Total International Index Fund',
    fundValue: 186_000,
    otherIncome: 164_000,
    ordinaryDividends: 5_480,
    qualifiedDividends: 4_105,
    capitalGainDistributions: 2_240,
    section199ADividends: 0,
    foreignTaxPaid: 412,
    sharesSold: false,
  }
  add({
    toolId: 'mutual-fund',
    title: 'International fund distribution review',
    clientId: clients.raman.id,
    createdAt: ago(97),
    input: ramanFund,
    ...summarizeMutualFund(calculateMutualFundTax(ramanFund)),
  })

  // Audit Risk — Bluewater (reasonable compensation)
  const bluewaterRisk: AuditRiskInput = {
    ...AUDIT_RISK_EXAMPLE,
    agi: 1_340_000,
    hasScheduleC: false,
    grossReceipts: 0,
    totalExpenses: 0,
    mealsAndTravel: 0,
    vehicleBusinessPct: 60,
    homeOffice: false,
    charitableCash: 18_000,
    charitableNonCash: 0,
    rentalNetIncome: 0,
    digitalAssets: false,
    digitalAssetsReported: false,
    sCorpShareholder: true,
    officerCompensation: 120_000,
    sCorpDistributions: 640_000,
  }
  add({
    toolId: 'audit-risk',
    title: 'Shareholder compensation review',
    clientId: clients.bluewater.id,
    createdAt: ago(146),
    input: bluewaterRisk,
    ...summarizeAuditRisk(analyzeAuditRisk(bluewaterRisk)),
  })

  // Estimated Tax — Kovacs
  const kovacsEst: EstimatedTaxInput = {
    ...ESTIMATED_TAX_EXAMPLE,
    status: 'hoh',
    wages: 0,
    withholding: 0,
    selfEmploymentIncome: 112_000,
    interestAndOrdinaryDividends: 1_850,
    qualifiedDividends: 900,
    netCapitalGains: 0,
    adjustments: 4_000,
    childrenUnder17: 1,
    priorYearTax: 21_400,
    priorYearAgi: 104_800,
    payments: [5_350, 5_350, 5_350, 0],
  }
  add({
    toolId: 'estimated-tax',
    title: '2026 quarterly estimates',
    clientId: clients.kovacs.id,
    createdAt: ago(210),
    input: kovacsEst,
    ...summarizeEstimatedTax(calculateEstimatedTax(kovacsEst, new Date(now))),
  })

  // Audit Risk — Bell (low)
  const bellRisk: AuditRiskInput = {
    ...AUDIT_RISK_EXAMPLE,
    status: 'single',
    agi: 118_000,
    wages: 118_000,
    hasScheduleC: false,
    grossReceipts: 0,
    totalExpenses: 0,
    mealsAndTravel: 0,
    vehicleBusinessPct: 0,
    homeOffice: false,
    charitableCash: 2_400,
    charitableNonCash: 300,
    rentalNetIncome: 0,
    digitalAssets: true,
    digitalAssetsReported: true,
  }
  add({
    toolId: 'audit-risk',
    title: 'Return review',
    clientId: clients.bell.id,
    createdAt: ago(320),
    input: bellRisk,
    ...summarizeAuditRisk(analyzeAuditRisk(bellRisk)),
  })

  // Entity Comparison — Harper & Lane (higher profit)
  const harperEntity: EntityComparisonInput = {
    ...ENTITY_COMPARISON_EXAMPLE,
    netProfit: 342_000,
    officerSalary: 150_000,
    otherIncome: 0,
    isSSTB: true,
    adminCosts: 3_600,
  }
  add({
    toolId: 'entity-comparison',
    title: 'Entity structure check-in',
    clientId: clients.harper.id,
    createdAt: ago(470),
    input: harperEntity,
    ...summarizeEntityComparison(compareEntities(harperEntity)),
  })

  // Mutual Fund — Whitfield
  add({
    toolId: 'mutual-fund',
    title: 'Growth fund year-end distributions',
    clientId: clients.whitfield.id,
    createdAt: ago(530),
    input: MUTUAL_FUND_EXAMPLE,
    ...summarizeMutualFund(calculateMutualFundTax(MUTUAL_FUND_EXAMPLE)),
  })

  return {
    clients: Object.values(clients).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    analyses,
    readNotifications: [],
  }
}
