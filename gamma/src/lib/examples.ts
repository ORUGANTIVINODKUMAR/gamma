/**
 * Example scenarios run through the real calculators, computed once and
 * shared by marketing visuals — so every number on the website is a genuine
 * Tapreco output, not decoration.
 */

import { analyzeAuditRisk, AUDIT_RISK_EXAMPLE, type AuditRiskResult } from './tax/auditRisk'
import { compareEntities, ENTITY_COMPARISON_EXAMPLE, type EntityComparisonResult } from './tax/entityComparison'
import { calculateEstimatedTax, ESTIMATED_TAX_EXAMPLE, type EstimatedTaxResult } from './tax/estimatedTax'
import { calculateMutualFundTax, MUTUAL_FUND_EXAMPLE, type MutualFundResult } from './tax/mutualFund'
import { planTaxes, TAX_PLANNER_EXAMPLE, type TaxPlannerResult } from './tax/taxPlanner'

export interface ExampleResults {
  mutualFund: MutualFundResult
  estimated: EstimatedTaxResult
  audit: AuditRiskResult
  entity: EntityComparisonResult
  planner: TaxPlannerResult
}

let cache: ExampleResults | null = null

export function getExamples(): ExampleResults {
  if (!cache) {
    cache = {
      mutualFund: calculateMutualFundTax(MUTUAL_FUND_EXAMPLE),
      estimated: calculateEstimatedTax(ESTIMATED_TAX_EXAMPLE, new Date()),
      audit: analyzeAuditRisk(AUDIT_RISK_EXAMPLE),
      entity: compareEntities(ENTITY_COMPARISON_EXAMPLE),
      planner: planTaxes(TAX_PLANNER_EXAMPLE),
    }
  }
  return cache
}
