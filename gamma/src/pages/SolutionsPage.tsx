import { ArrowRight, Briefcase, Building2, CalendarDays, Landmark, UserRound, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CTASection } from '@/components/marketing/CTASection'
import { PageHero } from '@/components/marketing/PageHero'
import { Button } from '@/components/ui/Button'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { Highlight, SectionHeading } from '@/components/ui/SectionHeading'
import { TOOLS_BY_ID, type ToolId } from '@/config/tools'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const SEGMENTS: { icon: LucideIcon; title: string; challenge: string; outcome: string; tools: ToolId[] }[] = [
  {
    icon: UserRound,
    title: 'Solo practitioners & EAs',
    challenge: 'Every hour spent rebuilding spreadsheets is an hour not spent advising clients.',
    outcome: 'Run professional-grade estimates, entity reviews and plans in minutes — and hand clients a polished report.',
    tools: ['estimated-tax', 'entity-comparison', 'tax-planner'],
  },
  {
    icon: Building2,
    title: 'Growing CPA firms',
    challenge: 'As staff grows, so does inconsistency between preparers, templates and assumptions.',
    outcome: 'One engine and one workflow mean every team member produces the same answer the same way.',
    tools: ['tax-planner', 'audit-risk', 'estimated-tax'],
  },
  {
    icon: Landmark,
    title: 'Multi-office & enterprise firms',
    challenge: 'Partners need visibility into risk and opportunity across thousands of returns.',
    outcome: 'A centralized dashboard surfaces audit exposure, planning cases and deadlines across the whole book.',
    tools: ['audit-risk', 'tax-planner', 'mutual-fund'],
  },
  {
    icon: Briefcase,
    title: 'Wealth & financial advisors',
    challenge: 'Investment decisions are made without a clear view of their after-tax effect.',
    outcome: 'Quantify fund tax drag, harvest losses deliberately and coordinate with the client’s CPA.',
    tools: ['mutual-fund', 'tax-planner'],
  },
]

const SEASONS = [
  { when: 'January – April', title: 'Filing season', text: 'Pre-filing audit reviews and first-quarter estimate planning.', tools: ['audit-risk', 'estimated-tax'] as ToolId[] },
  { when: 'May – September', title: 'Mid-year check-ins', text: 'Re-forecast estimates and review entity structures as profits firm up.', tools: ['estimated-tax', 'entity-comparison'] as ToolId[] },
  { when: 'October – December', title: 'Year-end planning', text: 'Model retirement, charitable and loss-harvesting strategies before December 31.', tools: ['tax-planner', 'mutual-fund'] as ToolId[] },
]

function ToolChips({ ids }: { ids: ToolId[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => {
        const t = TOOLS_BY_ID[id]
        return (
          <Link
            key={id}
            to={t.path}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/25 bg-accent-500/[0.06] px-3 py-1 text-[12px] font-medium text-accent-200 transition-colors hover:border-accent-400/60 hover:bg-accent-500/10"
          >
            <t.icon className="size-3.5" aria-hidden />
            {t.shortName}
          </Link>
        )
      })}
    </div>
  )
}

export default function SolutionsPage() {
  useDocumentTitle('Solutions')
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title={
          <>
            Built for every kind of <Highlight>tax practice</Highlight>
          </>
        }
        description="From a single enrolled agent to a multi-office CPA firm, Tapreco adapts to how your practice delivers tax advice."
        actions={
          <>
            <Button to="/signup" size="lg" withArrow>
              Get Started
            </Button>
            <Button to="/contact" size="lg" variant="secondary">
              Talk to our team
            </Button>
          </>
        }
      />

      <section aria-labelledby="segments-title" className="relative py-16 sm:py-24">
        <div className="container-page">
          <h2 id="segments-title" className="sr-only">Solutions by practice type</h2>
          <RevealGroup className="grid gap-5 md:grid-cols-2" stagger={0.08}>
            {SEGMENTS.map((s) => (
              <RevealItem key={s.title}>
                <article className="group accent-border-hover surface-card flex h-full flex-col rounded-panel p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-9">
                  <span className="grid size-12 place-items-center rounded-2xl border border-accent-500/25 bg-accent-500/[0.08] text-accent-300 transition-transform duration-500 group-hover:scale-110">
                    <s.icon className="size-[22px]" aria-hidden />
                  </span>
                  <h3 className="mt-6 font-display text-[22px] font-semibold tracking-[-0.02em] text-fg">{s.title}</h3>
                  <dl className="mt-5 flex flex-1 flex-col gap-4">
                    <div>
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-fg-faint">The challenge</dt>
                      <dd className="mt-1.5 text-[14.5px] leading-relaxed text-fg-subtle">{s.challenge}</dd>
                    </div>
                    <div>
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-400">With Tapreco</dt>
                      <dd className="mt-1.5 text-[14.5px] leading-relaxed text-fg-muted">{s.outcome}</dd>
                    </div>
                  </dl>
                  <div className="mt-6">
                    <ToolChips ids={s.tools} />
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section aria-labelledby="seasons-title" className="relative py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Year-round"
            title={<span id="seasons-title">A tool for <Highlight>every season</Highlight></span>}
            description="Tax advisory isn’t a once-a-year event. Tapreco supports the full calendar."
          />
          <RevealGroup className="relative mt-14 grid gap-5 lg:grid-cols-3" stagger={0.1}>
            {SEASONS.map((s) => (
              <RevealItem key={s.title}>
                <div className="surface-card relative h-full overflow-hidden rounded-card p-7">
                  <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-accent-300">
                    <CalendarDays className="size-4" aria-hidden /> {s.when}
                  </span>
                  <h3 className="mt-4 font-display text-[19px] font-semibold text-fg">{s.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-fg-subtle">{s.text}</p>
                  <div className="mt-5">
                    <ToolChips ids={s.tools} />
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <div className="mt-12 text-center">
            <Link to="/tools" className="group inline-flex items-center gap-2 text-[14.5px] font-semibold text-accent-300 hover:text-accent-200">
              Compare all five tools
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
