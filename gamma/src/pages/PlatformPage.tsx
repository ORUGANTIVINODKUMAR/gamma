import { Check, Minus, Cpu, Database, FileText, KeyRound, LockKeyhole, Server, ShieldCheck, Hourglass } from 'lucide-react'
import { CTASection } from '@/components/marketing/CTASection'
import { PageHero } from '@/components/marketing/PageHero'
import { PLATFORM_BENEFITS, PlatformStack } from '@/components/marketing/PlatformSection'
import { WorkflowSection } from '@/components/marketing/WorkflowSection'
import { WorkspaceSection } from '@/components/marketing/WorkspaceSection'
import { Button } from '@/components/ui/Button'
import { RevealGroup, RevealItem } from '@/components/ui/Reveal'
import { Highlight, SectionHeading } from '@/components/ui/SectionHeading'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatCurrency } from '@/lib/format'
import { YEARS } from '@/lib/tax/years'

const LAYERS = [
  {
    icon: Database,
    title: 'Client data',
    text: 'Clients, entities and filing status live in one workspace. Every analysis is stored with the inputs that produced it, so results are reproducible.',
  },
  {
    icon: Cpu,
    title: 'Tapreco tax engine',
    text: 'A single federal engine implements the Form 1040 flow — brackets, the capital-gain worksheet, §199A, SE tax, NIIT and credits — shared by every tool.',
  },
  {
    icon: FileText,
    title: 'Insights & reports',
    text: 'Tools translate engine output into savings, risk and deadlines, then into print-ready client reports with assumptions disclosed.',
  },
]

const y25 = YEARS[2025]
const y26 = YEARS[2026]

const COVERAGE_ROWS: { item: string; y2025: string; y2026: string }[] = [
  { item: 'Standard deduction (MFJ)', y2025: formatCurrency(y25.standardDeduction.mfj), y2026: formatCurrency(y26.standardDeduction.mfj) },
  { item: 'Top of 12% bracket (MFJ)', y2025: formatCurrency(y25.bracketTops.mfj[1]!), y2026: formatCurrency(y26.bracketTops.mfj[1]!) },
  { item: '0% capital gains band (MFJ)', y2025: formatCurrency(y25.capitalGainZeroTop.mfj), y2026: formatCurrency(y26.capitalGainZeroTop.mfj) },
  { item: 'Social Security wage base', y2025: formatCurrency(y25.socialSecurityWageBase), y2026: formatCurrency(y26.socialSecurityWageBase) },
  { item: 'SALT deduction cap', y2025: formatCurrency(y25.salt.cap.mfj), y2026: formatCurrency(y26.salt.cap.mfj) },
  { item: 'Child Tax Credit (per child)', y2025: formatCurrency(y25.childTaxCredit.perChild), y2026: formatCurrency(y26.childTaxCredit.perChild) },
  { item: '401(k) elective deferral', y2025: formatCurrency(y25.retirement.elective401k), y2026: formatCurrency(y26.retirement.elective401k) },
]

const MODELED = [
  'Ordinary brackets and the qualified dividend / capital gain worksheet',
  'Standard, additional 65+ and OBBBA senior deductions',
  'Itemized deductions with the OBBBA SALT cap and phase-down',
  '§199A QBI deduction with W-2 wage limit and SSTB phase-in',
  'Self-employment tax, Additional Medicare Tax and NIIT',
  'Child Tax Credit, credit for other dependents and refundable ACTC',
  'Taxation of Social Security benefits',
  'Estimated tax safe harbors (90% / 100% / 110%)',
]

const NOT_MODELED = [
  'Alternative minimum tax',
  'State and local income taxes (entity-level rate optional)',
  '25% / 28% capital gain rate classes',
  'Form 1116 foreign tax credit limitation',
  'Tips and overtime deductions',
]

const SECURITY = [
  { icon: KeyRound, title: 'One secure sign-in', text: 'Sign in once and reach every tool. Sessions persist for 30 days with “Keep me signed in”, or end with the browser session.' },
  { icon: Hourglass, title: 'Session controls', text: 'Expired or revoked sessions sign out cleanly across every open tab, and any 401 from the API returns the user to sign-in.' },
  { icon: LockKeyhole, title: 'Token-based API access', text: 'The web app authenticates to the Tapreco API with expiring bearer tokens; passwords are only ever sent at sign-in.' },
  { icon: Server, title: 'Calculation at the edge', text: 'Tax calculations run in the browser, so results are instant and figures are never sent to a server just to compute them.' },
  { icon: ShieldCheck, title: 'Least-data design', text: 'Tools ask only for the figures the computation needs — no SSNs, bank details or uploaded returns.' },
]

export default function PlatformPage() {
  useDocumentTitle('Platform')
  return (
    <>
      <PageHero
        eyebrow="The Tapreco platform"
        title={
          <>
            One engine. Five tools. <Highlight>Every client.</Highlight>
          </>
        }
        description="Tapreco connects client data, a rigorous federal tax engine and professional reporting into a single platform built for tax practices."
        actions={
          <>
            <Button to="/signup" size="lg" withArrow>
              Get Started
            </Button>
            <Button to="/tools" size="lg" variant="secondary">
              Explore Tax Tools
            </Button>
          </>
        }
      />

      {/* Architecture */}
      <section aria-labelledby="architecture-title" className="relative py-20 sm:py-28">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <PlatformStack className="relative h-[380px] sm:h-[480px]" />
          <div>
            <SectionHeading
              align="left"
              eyebrow="Architecture"
              title={<span id="architecture-title">Three layers, <Highlight>one source of truth</Highlight></span>}
            />
            <RevealGroup className="mt-10 flex flex-col divide-y divide-line/[0.09] border-y border-line/[0.09]" stagger={0.08}>
              {LAYERS.map((l, i) => (
                <RevealItem key={l.title}>
                  <div className="flex gap-5 py-6">
                    <span className="t-numeral w-9 shrink-0 text-[2rem] text-accent-400/80">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="flex items-center gap-2 font-serif text-[1.6rem] leading-none tracking-[-0.02em] text-fg">
                        <l.icon className="size-5 text-accent-400" aria-hidden />
                        {l.title}
                      </h3>
                      <p className="mt-2.5 text-[14px] leading-relaxed text-fg-subtle">{l.text}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section aria-labelledby="capabilities-title" className="relative py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading eyebrow="Capabilities" title={<span id="capabilities-title">Everything your practice needs</span>} />
          <RevealGroup className="mt-14 grid gap-x-12 border-t border-line/[0.09] md:grid-cols-2" stagger={0.05}>
            {PLATFORM_BENEFITS.map((b) => (
              <RevealItem key={b.title}>
                <div className="group flex gap-4 border-b border-line/[0.09] py-6">
                  <b.icon className="mt-1 size-5 shrink-0 text-accent-400 transition-transform duration-300 ease-premium group-hover:-translate-y-0.5" aria-hidden />
                  <div>
                    <h3 className="font-serif text-[1.45rem] leading-none tracking-[-0.02em] text-fg">{b.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-fg-subtle">{b.text}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <WorkspaceSection id="dashboard" />
      <WorkflowSection id="workflow" />

      {/* Coverage */}
      <section id="coverage" aria-labelledby="coverage-title" className="relative scroll-mt-24 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Tax year coverage"
            title={<span id="coverage-title">Current law, <Highlight>transparently modeled</Highlight></span>}
            description="Tapreco models tax years 2025 and 2026, including changes enacted by P.L. 119-21. Every parameter lives in one reviewable table."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="surface-card overflow-hidden rounded-card">
              <table className="w-full text-left text-[14px]">
                <caption className="sr-only">Selected federal parameters by tax year</caption>
                <thead>
                  <tr className="border-b border-line/[0.07] text-[12px] uppercase tracking-[0.12em] text-fg-faint">
                    <th scope="col" className="px-5 py-4 font-semibold">Parameter</th>
                    <th scope="col" className="px-5 py-4 text-right font-semibold">2025</th>
                    <th scope="col" className="px-5 py-4 text-right font-semibold text-accent-300">2026</th>
                  </tr>
                </thead>
                <tbody>
                  {COVERAGE_ROWS.map((r) => (
                    <tr key={r.item} className="border-b border-line/[0.04] last:border-0">
                      <th scope="row" className="px-5 py-3.5 font-normal text-fg-muted">{r.item}</th>
                      <td className="tabular px-5 py-3.5 text-right text-fg-subtle">{r.y2025}</td>
                      <td className="tabular px-5 py-3.5 text-right font-semibold text-fg">{r.y2026}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-6">
              <div className="surface-card rounded-card p-6">
                <h3 className="font-display text-[16px] font-semibold text-fg">Modeled</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {MODELED.map((m) => (
                    <li key={m} className="flex items-start gap-2.5 text-[13.5px] text-fg-subtle">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="surface-card rounded-card p-6">
                <h3 className="font-display text-[16px] font-semibold text-fg">Not yet modeled</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {NOT_MODELED.map((m) => (
                    <li key={m} className="flex items-start gap-2.5 text-[13.5px] text-fg-faint">
                      <Minus className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" aria-labelledby="security-title" className="relative scroll-mt-24 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Security"
            title={<span id="security-title">Secure by <Highlight>architecture</Highlight></span>}
            description="Built so a user signs in once, every tool respects that session, and sensitive data is never collected that a calculation doesn’t need."
          />
          <RevealGroup className="mt-14 grid gap-x-12 border-t border-line/[0.09] md:grid-cols-2" stagger={0.06}>
            {SECURITY.map((s) => (
              <RevealItem key={s.title}>
                <div className="flex gap-4 border-b border-line/[0.09] py-6">
                  <s.icon className="mt-1 size-5 shrink-0 text-accent-400" aria-hidden />
                  <div>
                    <h3 className="font-serif text-[1.45rem] leading-none tracking-[-0.02em] text-fg">{s.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-fg-subtle">{s.text}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CTASection />
    </>
  )
}
