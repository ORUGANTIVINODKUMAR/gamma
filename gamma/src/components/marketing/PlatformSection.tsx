import { ArrowLeftRight, Calculator, FileText, LayoutDashboard, ListChecks, LockKeyhole, ScanSearch, UsersRound, type LucideIcon } from 'lucide-react'
import { lazy } from 'react'
import { DocumentPoster, SceneBoundary } from '@/components/three/core/SceneBoundary'

const PlatformStackScene = lazy(() => import('@/components/three/scenes/PlatformStackScene'))

export const PLATFORM_BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: UsersRound, title: 'Client Management', text: 'Every client, entity and filing status in one organized record.' },
  { icon: Calculator, title: 'Tax Analysis', text: 'Bracket-aware federal calculations with full line-item breakdowns.' },
  { icon: ListChecks, title: 'Tax Planning', text: 'Model strategies and see exactly what each one saves.' },
  { icon: ScanSearch, title: 'Risk Analysis', text: 'Explainable audit-risk indicators surfaced before you file.' },
  { icon: ArrowLeftRight, title: 'Scenario Comparison', text: 'Schedule C vs S-corp and baseline vs planned, side by side.' },
  { icon: LockKeyhole, title: 'Secure Firm Access', text: 'One sign-in for every tool, with sessions that persist safely.' },
  { icon: FileText, title: 'Reports', text: 'Print-ready client reports generated from any saved analysis.' },
  { icon: LayoutDashboard, title: 'Centralized Dashboard', text: 'Deadlines, analyses and risk across your whole book.' },
]

/**
 * The platform's three layers — client data, the tax engine, insights and
 * reports — as a 3D stack on a shared spine. Hover pulls the layers apart.
 */
export function PlatformStack({ className }: { className?: string }) {
  return (
    <SceneBoundary className={className} fallback={<DocumentPoster />}>
      <PlatformStackScene className="absolute inset-0" />
    </SceneBoundary>
  )
}
