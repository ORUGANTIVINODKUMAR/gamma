import { Eye, FileSearch, Scale, ShieldCheck, type LucideIcon } from 'lucide-react'
import { CTASection } from '@/components/marketing/CTASection'
import { PageHero } from '@/components/marketing/PageHero'
import { Badge } from '@/components/ui/primitives'
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { Highlight, SectionHeading } from '@/components/ui/SectionHeading'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const PRINCIPLES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Scale, title: 'Accuracy first', text: 'Calculations follow the statute and IRS guidance, and every tax-year parameter is documented in one reviewable place.' },
  { icon: Eye, title: 'Explainable results', text: 'No black boxes. Every number can be traced back to its inputs, and every score comes with its reasons.' },
  { icon: FileSearch, title: 'Professional judgment stays with professionals', text: 'Tapreco informs decisions; licensed practitioners make them. Assumptions are disclosed on every report.' },
  { icon: ShieldCheck, title: 'Privacy by design', text: 'We ask only for the figures a calculation needs — no Social Security numbers, no uploaded returns.' },
]

const ROADMAP: { title: string; text: string; status: 'Available' | 'In progress' | 'Planned' }[] = [
  { title: 'Five core tax tools', text: 'Mutual fund, estimated tax, audit risk, entity comparison and tax planning.', status: 'Available' },
  { title: 'Firm workspace & reports', text: 'Client records, saved analyses and print-ready reports.', status: 'Available' },
  { title: 'Cloud sync & team access', text: 'Shared client records and role-based permissions across a firm.', status: 'Planned' },
  { title: 'Document import', text: 'Populate tools directly from 1099, K-1 and prior-year return data.', status: 'Planned' },
  { title: 'AI-assisted review', text: 'Assistance that flags anomalies and drafts client-ready explanations.', status: 'Planned' },
  { title: 'State tax modeling', text: 'State income tax alongside the federal projection.', status: 'Planned' },
]

export default function AboutPage() {
  useDocumentTitle('About')
  return (
    <>
      <PageHero
        eyebrow="About Tapreco"
        title={
          <>
            Tax technology with the <Highlight>rigor your clients expect</Highlight>
          </>
        }
        description="Tapreco exists to give tax professionals one trustworthy place to analyze, plan and advise — with every number explainable and every assumption in the open."
      />

      <section aria-labelledby="mission-title" className="relative py-16 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <span className="eyebrow">Our mission</span>
            <h2 id="mission-title" className="mt-4 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-fg">
              Make sophisticated tax analysis <Highlight>fast, consistent and defensible.</Highlight>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex flex-col gap-5 text-[16px] leading-relaxed text-fg-subtle">
              <p>
                Most practices still answer planning questions with a patchwork of spreadsheets, each built by a different person
                with different assumptions. The answers disagree, the work doesn’t carry from one engagement to the next, and the
                client sees a printout rather than a plan.
              </p>
              <p>
                Tapreco replaces that patchwork with a single federal tax engine and a set of focused tools on top of it. Whether
                a team member is sizing quarterly estimates or comparing an S-corp election, the numbers come from the same
                place — and they flow into the same client record and the same report.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="relative py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Principles" title={<span id="principles-title">What we <Highlight>won’t compromise</Highlight></span>} />
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2" stagger={0.08}>
            {PRINCIPLES.map((p) => (
              <RevealItem key={p.title}>
                <div className="group accent-border-hover surface-card flex h-full gap-5 rounded-card p-7">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-accent-500/25 bg-accent-500/[0.08] text-accent-300 transition-transform duration-500 group-hover:scale-110">
                    <p.icon className="size-[22px]" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-[18px] font-semibold text-fg">{p.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-fg-subtle">{p.text}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section aria-labelledby="roadmap-title" className="relative py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Roadmap" title={<span id="roadmap-title">Where Tapreco is <Highlight>headed</Highlight></span>} />
          <div role="list" className="relative mx-auto mt-14 max-w-3xl border-l border-line/[0.08] pl-8">
            {ROADMAP.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.04}>
                <div role="listitem" className="relative pb-10">
                  <span
                    aria-hidden
                    className={`absolute -left-[37px] top-1 size-[11px] rounded-full border-2 ${r.status === 'Available' ? 'border-accent-400 bg-accent-500' : r.status === 'In progress' ? 'border-accent-400 bg-ink-950' : 'border-line/20 bg-ink-950'}`}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-[17px] font-semibold text-fg">{r.title}</h3>
                    <Badge tone={r.status === 'Available' ? 'accent' : r.status === 'In progress' ? 'info' : 'neutral'} withIcon={false}>
                      {r.status}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-fg-subtle">{r.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
