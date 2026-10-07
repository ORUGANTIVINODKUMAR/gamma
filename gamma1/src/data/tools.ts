import { Compass, Landmark, Calculator, ScanSearch, GitCompareArrows, Sprout } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Tool {
  id: string
  number: string
  name: string
  short: string
  description: string
  icon: LucideIcon
  primary?: boolean
}

export const TOOLS: Tool[] = [
  {
    id: 'tax-planner',
    number: '01',
    name: 'Tax Planner',
    short: 'Tax Planner',
    description:
      'A comprehensive tax planning workspace designed to help professionals evaluate tax situations, identify opportunities, and develop informed tax strategies.',
    icon: Compass,
    primary: true,
  },
  {
    id: 'mutual-fund-tax-calculator',
    number: '02',
    name: 'Mutual Fund Tax Calculator',
    short: 'Mutual Fund',
    description:
      'Evaluate mutual fund tax implications and understand distributions, gains, and tax-related impacts.',
    icon: Landmark,
  },
  {
    id: 'estimated-tax-calculator',
    number: '03',
    name: 'Estimated Tax Calculator',
    short: 'Estimated Tax',
    description:
      'Calculate and plan estimated tax obligations using income, withholding, credits, and applicable tax information.',
    icon: Calculator,
  },
  {
    id: 'audit-risk-analyzer',
    number: '04',
    name: 'Audit Risk Analyzer',
    short: 'Audit Risk',
    description:
      'Analyze tax return information and identify areas that may present increased audit risk or require additional review.',
    icon: ScanSearch,
  },
  {
    id: 'entity-comparison-tool',
    number: '05',
    name: 'Entity Comparison Tool',
    short: 'Entity Comparison',
    description:
      'Compare tax implications between entity structures and support smarter business tax decisions.',
    icon: GitCompareArrows,
  },
  {
    id: 'roth-strategy-analyzer',
    number: '06',
    name: 'Roth Strategy Analyzer',
    short: 'Roth Strategy',
    description:
      'Evaluate Roth-related tax strategies and understand potential long-term tax implications.',
    icon: Sprout,
  },
]

export const CAPABILITIES = ['Planning', 'Analysis', 'Calculation', 'Risk', 'Strategy'] as const

export const BENEFITS = [
  { title: 'Unified Tax Platform', text: 'Planning, calculation and review live in one workspace instead of six disconnected files.' },
  { title: 'Purpose-Built Tax Tools', text: 'Every tool is designed around a single tax question and answers it with precision.' },
  { title: 'Professional Tax Analysis', text: 'Structured, defensible analysis that holds up in a client conversation.' },
  { title: 'Secure Architecture', text: 'Built with the care that sensitive taxpayer information demands.' },
  { title: 'Consistent Client Experience', text: 'One language, one rhythm and one standard across every engagement.' },
  { title: 'Designed for Tax Professionals', text: 'Shaped around how practitioners actually think, review and advise.' },
]

export const EASE = [0.16, 1, 0.3, 1] as const
