import { Calculator, Landmark, Layers, Scale, ShieldCheck, type LucideIcon } from 'lucide-react'

export interface Tool {
  slug: string
  name: string
  short: string
  description: string
  route: string
  icon: LucideIcon
  flagship?: boolean
}

/** Tool routes live in one place so the homepage links match the app's routes. */
export const TOOLS: Tool[] = [
  {
    slug: 'tax-planner',
    name: 'Tax Planner',
    short: 'Tax Planner',
    description:
      'Plan client tax scenarios and identify potential planning opportunities from one structured workspace.',
    route: '/tools/tax-planner',
    icon: Layers,
    flagship: true,
  },
  {
    slug: 'mutual-fund-tax-calculator',
    name: 'Mutual Fund Tax Calculator',
    short: 'Mutual Fund',
    description: 'Analyze mutual fund-related tax information and distributions.',
    route: '/tools/mutual-fund-tax-calculator',
    icon: Landmark,
  },
  {
    slug: 'estimated-tax-calculator',
    name: 'Estimated Tax Calculator',
    short: 'Estimated Tax',
    description: 'Estimate federal tax payments and withholding needs.',
    route: '/tools/estimated-tax-calculator',
    icon: Calculator,
  },
  {
    slug: 'audit-risk-analyzer',
    name: 'Audit Risk Analyzer',
    short: 'Audit Risk',
    description: 'Review return information and identify areas that may require additional attention.',
    route: '/tools/audit-risk-analyzer',
    icon: ShieldCheck,
  },
  {
    slug: 'entity-comparison',
    name: 'Entity Comparison',
    short: 'Entity Comparison',
    description: 'Compare Schedule C and S Corporation tax scenarios.',
    route: '/tools/entity-comparison',
    icon: Scale,
  },
]

export const toolBySlug = (slug?: string) => TOOLS.find((t) => t.slug === slug)
