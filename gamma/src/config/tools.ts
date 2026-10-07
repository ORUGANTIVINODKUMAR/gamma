import { CalendarDays, Landmark, ClipboardList, Scale, ShieldCheck, type LucideIcon } from 'lucide-react'

export type ToolId = 'mutual-fund' | 'estimated-tax' | 'audit-risk' | 'entity-comparison' | 'tax-planner'

export interface ToolMeta {
  id: ToolId
  name: string
  shortName: string
  path: string
  icon: LucideIcon
  /** One line for menus. */
  tagline: string
  /** Two lines for cards. */
  description: string
  /** What the tool produces — used on the tools overview and tool headers. */
  outputs: string[]
  /** IRS forms the tool reads from or models. */
  forms: string[]
}

export const TOOLS: readonly ToolMeta[] = [
  {
    id: 'mutual-fund',
    name: 'Mutual Fund Tax Calculator',
    shortName: 'Mutual Fund',
    path: '/app/tools/mutual-fund',
    icon: Landmark,
    tagline: 'Distributions, dividends and gains — taxed with precision.',
    description:
      'Analyze mutual fund distributions, dividends, capital gains, and tax implications with greater clarity.',
    outputs: ['Incremental federal tax by income character', 'Effective rate & tax drag', 'NIIT and §199A impact'],
    forms: ['1099-DIV', '1099-B', 'Schedule D', 'Form 8960'],
  },
  {
    id: 'estimated-tax',
    name: 'Estimated Tax Calculator',
    shortName: 'Estimated Tax',
    path: '/app/tools/estimated-tax',
    icon: CalendarDays,
    tagline: 'Safe-harbor quarterly payments, scheduled and tracked.',
    description:
      'Calculate estimated federal tax payments and help clients plan quarterly obligations accurately.',
    outputs: ['Required annual payment (safe harbor)', 'Quarterly schedule with due dates', 'Balance due projection'],
    forms: ['1040-ES', 'Form 2210', 'Schedule SE'],
  },
  {
    id: 'audit-risk',
    name: 'Audit Risk Analyzer',
    shortName: 'Audit Risk',
    path: '/app/tools/audit-risk',
    icon: ShieldCheck,
    tagline: 'Surface audit-risk indicators before you file.',
    description:
      'Analyze tax return data and identify potential audit-risk indicators before filing.',
    outputs: ['Explainable 0–100 risk score', 'Ranked indicators with mitigation', 'Documentation checklist'],
    forms: ['Form 1040', 'Schedule C', 'Form 8283', 'FinCEN 114'],
  },
  {
    id: 'entity-comparison',
    name: 'Entity Comparison Tool',
    shortName: 'Entity Comparison',
    path: '/app/tools/entity-comparison',
    icon: Scale,
    tagline: 'Schedule C vs S-Corp, side by side.',
    description:
      'Compare Schedule C and S-Corporation tax scenarios to identify potentially more efficient entity structures.',
    outputs: ['Total tax & cost by structure', 'Salary sensitivity curve', 'Break-even profit'],
    forms: ['Schedule C', 'Schedule SE', 'Form 1120-S', 'Form 8995'],
  },
  {
    id: 'tax-planner',
    name: 'Tax Planner',
    shortName: 'Tax Planner',
    path: '/app/tools/tax-planner',
    icon: ClipboardList,
    tagline: 'Income, deductions, credits and strategy in one plan.',
    description:
      'Bring income, deductions, credits, and tax strategies together into a powerful tax planning experience.',
    outputs: ['Full-year federal projection', 'Strategy-by-strategy savings', 'Bracket headroom & refund outlook'],
    forms: ['Form 1040', 'Schedule A', 'Schedule D', 'Schedule 8812'],
  },
]

export const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t])) as Record<ToolId, ToolMeta>
