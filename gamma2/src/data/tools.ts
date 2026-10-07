import { ScanLine, Calculator, Files, ShieldCheck, Building2 } from 'lucide-react'

export const tools = [
  { slug: 'tax-planner', name: 'Tax Planner', short: 'Tax Planner', icon: ScanLine, description: 'See the whole tax picture. Explore scenarios, uncover planning opportunities, and turn insight into a thoughtful strategy.', category: 'PLAN WITH PERSPECTIVE', features: ['Tax scenario planning', 'Planning opportunities', 'Client-level analysis', 'Professional tax workflow'] },
  { slug: 'mutual-fund-tax-calculator', name: 'Mutual Fund Tax Calculator', short: 'Mutual Funds', icon: Files, description: 'Bring clarity to the tax impact of dividends, distributions, and capital gains.', category: 'INVESTMENT CLARITY', features: ['Distribution review', 'Dividend analysis', 'Capital gains review'] },
  { slug: 'estimated-tax-calculator', name: 'Estimated Tax Calculator', short: 'Estimated Tax', icon: Calculator, description: 'Plan federal estimated payments and withholding with a clearer view of what’s ahead.', category: 'PLAN AHEAD', features: ['Federal tax estimates', 'Quarterly payment planning', 'Withholding review'] },
  { slug: 'audit-risk-analyzer', name: 'Audit Risk Analyzer', short: 'Audit Risk', icon: ShieldCheck, description: 'Identify areas that may warrant a closer look before a return is filed.', category: 'REVIEW WITH CONFIDENCE', features: ['Return information review', 'Potential risk indicators', 'Professional review workflow'] },
  { slug: 'entity-comparison', name: 'Entity Comparison', short: 'Entity Comparison', icon: Building2, description: 'Compare Schedule C and S Corporation structures to inform the next business decision.', category: 'STRUCTURE WITH INTENT', features: ['Schedule C comparison', 'S Corporation comparison', 'Business structure analysis'] },
] as const

export const toolPath = (slug: string) => `/tools/${slug}`
