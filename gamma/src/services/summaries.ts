/**
 * Turns a calculator result into the compact summary stored with a saved
 * analysis (dashboard, reports, recent activity). One builder per tool so
 * tool pages and seed data always describe results identically.
 */

import type { ToolId } from '@/config/tools'
import { formatCurrency, formatDate, formatPercent } from '@/lib/format'
import type { AuditRiskResult } from '@/lib/tax/auditRisk'
import type { EntityComparisonResult } from '@/lib/tax/entityComparison'
import type { EstimatedTaxResult } from '@/lib/tax/estimatedTax'
import type { MutualFundResult } from '@/lib/tax/mutualFund'
import type { TaxPlannerResult } from '@/lib/tax/taxPlanner'

export interface AnalysisSummary {
  headline: { label: string; value: string }
  details: { label: string; value: string }[]
  /** Numeric facts the dashboard aggregates (risk score, savings…). */
  metrics: Record<string, number>
}

export function summarizeMutualFund(r: MutualFundResult): AnalysisSummary {
  return {
    headline: { label: 'Incremental federal tax', value: formatCurrency(r.incrementalTax) },
    details: [
      { label: 'Taxable fund income', value: formatCurrency(r.taxableFundIncome) },
      { label: 'Effective rate', value: formatPercent(r.effectiveRateOnFund) },
      { label: 'Tax drag', value: r.taxDrag === null ? '—' : formatPercent(r.taxDrag) },
    ],
    metrics: { tax: r.incrementalTax },
  }
}

export function summarizeEstimatedTax(r: EstimatedTaxResult): AnalysisSummary {
  return {
    headline: { label: 'Required per quarter', value: formatCurrency(r.perQuarter) },
    details: [
      { label: 'Projected tax', value: formatCurrency(r.projectedTax) },
      { label: 'Safe harbor', value: r.safeHarborBasis === 'prior' ? `${Math.round(r.priorYearPct * 100)}% prior year` : '90% current year' },
      { label: 'Next due', value: r.nextDue ? formatDate(r.nextDue.dueDate) : '—' },
    ],
    metrics: {
      perQuarter: r.perQuarter,
      nextDueAmount: r.nextDue ? Math.max(0, r.nextDue.cumulativeRequired - r.nextDue.cumulativePaid) : 0,
      nextDueTime: r.nextDue ? new Date(`${r.nextDue.dueDate}T00:00:00`).getTime() : 0,
    },
  }
}

export function summarizeAuditRisk(r: AuditRiskResult): AnalysisSummary {
  return {
    headline: { label: 'Risk score', value: `${r.score} · ${r.level}` },
    details: [
      { label: 'Indicators flagged', value: String(r.triggered.length) },
      { label: 'Top indicator', value: r.triggered[0]?.title ?? 'None' },
    ],
    metrics: { score: r.score },
  }
}

export function summarizeEntityComparison(r: EntityComparisonResult): AnalysisSummary {
  const label = r.savings >= 0 ? 'Annual S-corp savings' : 'Annual S-corp extra cost'
  return {
    headline: { label, value: formatCurrency(Math.abs(r.savings)) },
    details: [
      { label: 'Schedule C total', value: formatCurrency(r.scheduleC.total) },
      { label: 'S corporation total', value: formatCurrency(r.sCorp.total) },
      { label: 'Break-even profit', value: r.breakevenProfit ? formatCurrency(r.breakevenProfit) : '—' },
    ],
    metrics: { savings: r.savings },
  }
}

export function summarizeTaxPlanner(r: TaxPlannerResult): AnalysisSummary {
  return {
    headline: { label: 'Planned tax savings', value: formatCurrency(Math.max(0, -r.combinedChange)) },
    details: [
      { label: 'Baseline tax', value: formatCurrency(r.baseline.totalTax) },
      { label: 'With strategies', value: formatCurrency(r.planned.totalTax) },
      { label: 'Marginal rate', value: formatPercent(r.planned.marginal.rate, 0) },
    ],
    metrics: { savings: -r.combinedChange, totalTax: r.planned.totalTax },
  }
}

export const TOOL_SUMMARY_LABEL: Record<ToolId, string> = {
  'mutual-fund': 'Fund tax analysis',
  'estimated-tax': 'Estimated tax plan',
  'audit-risk': 'Audit risk review',
  'entity-comparison': 'Entity comparison',
  'tax-planner': 'Tax plan',
}
