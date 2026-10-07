import { ArrowRight, Check, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CTASection } from '@/components/marketing/CTASection'
import { PageHero } from '@/components/marketing/PageHero'
import { ToolGallery } from '@/components/marketing/ToolGallery'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { Highlight, SectionHeading } from '@/components/ui/SectionHeading'
import { TOOLS, TOOLS_BY_ID, type ToolId } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const QUESTIONS: { q: string; tool: ToolId }[] = [
  { q: 'How much tax will this fund’s year-end distribution cost my client?', tool: 'mutual-fund' },
  { q: 'What should my client pay each quarter to avoid an underpayment penalty?', tool: 'estimated-tax' },
  { q: 'Is anything on this return likely to draw IRS attention?', tool: 'audit-risk' },
  { q: 'Would an S-corp election save this business owner money?', tool: 'entity-comparison' },
  { q: 'What can we still do before December 31 to reduce this year’s tax?', tool: 'tax-planner' },
]

export default function ToolsPage() {
  useDocumentTitle('Tax Tools')
  const { status } = useAuth()
  const authed = status === 'authenticated'

  return (
    <>
      <PageHero
        eyebrow="Tax tools"
        title={
          <>
            Five tools. <Highlight>One federal engine.</Highlight>
          </>
        }
        description="Each Tapreco tool answers a specific question your clients ask — and all of them share the same rigorous calculations, client records and report format."
      />

      <section className="relative -mt-6 pb-8">
        <div className="container-page">
          <ToolGallery />
          {!authed && (
            <p className="mt-5 flex items-center justify-center gap-1.5 text-[12.5px] text-fg-faint">
              <Lock className="size-3.5" aria-hidden /> Sign in once to use every tool.
              <Button to="/login" variant="ghost" size="sm">
                Login
              </Button>
            </p>
          )}
        </div>
      </section>

      <section aria-label="What each tool delivers" className="relative py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="What you get" title={<>Every tool, <Highlight>on the record.</Highlight></>} />
          <ol className="mt-14 divide-y divide-line/[0.08] border-y border-line/[0.08]">
            {TOOLS.map((tool, i) => (
              <Reveal key={tool.id}>
                <li className="grid gap-6 py-9 md:grid-cols-[5rem_minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
                  <span className="t-numeral text-[2.75rem] text-fg/25">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 id={`tool-${tool.id}`} className="font-serif text-[clamp(1.6rem,2.6vw,2.1rem)] leading-[1.05] tracking-[-0.02em] text-fg">
                      {tool.name}
                    </h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-fg-subtle">{tool.description}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                      <Button to={tool.path} size="sm" withArrow>
                        Open {tool.shortName}
                      </Button>
                      <span className="text-[12.5px] text-fg-faint">{tool.forms.join(' · ')}</span>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {tool.outputs.map((o) => (
                      <li key={o} className="flex items-start gap-2.5 text-[14.5px] text-fg-muted">
                        <Check className="mt-0.5 size-[18px] shrink-0 text-accent-400" aria-hidden />
                        {o}
                      </li>
                    ))}
                  </ul>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="which-title" className="relative pb-20 sm:pb-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Choosing a tool"
            title={
              <span id="which-title">
                Which tool answers <Highlight>your question?</Highlight>
              </span>
            }
          />
          <div className="mx-auto mt-12 flex max-w-4xl flex-col gap-3">
            {QUESTIONS.map(({ q, tool }) => {
              const t = TOOLS_BY_ID[tool]
              return (
                <Reveal key={tool}>
                  <Link
                    to={t.path}
                    className="group surface-card flex flex-col gap-3 rounded-card p-5 transition-[transform,box-shadow] duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-28px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-[15px] text-fg-muted">“{q}”</span>
                    <span className="inline-flex shrink-0 items-center gap-2 text-[14px] font-semibold text-accent-300">
                      <t.icon className="size-4" aria-hidden />
                      {t.shortName}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
