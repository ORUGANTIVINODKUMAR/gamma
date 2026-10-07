import type { ReactNode } from 'react'
import { PageHero } from '@/components/marketing/PageHero'
import { Callout } from '@/components/ui/primitives'
import { site } from '@/config/site'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

interface LegalSection {
  heading: string
  body: ReactNode
}

function LegalLayout({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  useDocumentTitle(title)
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={`Last updated ${updated}`} />
      <section className="relative pb-24">
        <div className="container-page max-w-3xl">
          <Callout tone="accent" title="Template">
            This document is a starting template for Tapreco and must be reviewed by legal counsel before production launch.
          </Callout>
          <div className="mt-10 flex flex-col gap-10">
            {sections.map((s, i) => (
              <section key={s.heading} aria-labelledby={`legal-${i}`}>
                <h2 id={`legal-${i}`} className="font-display text-[20px] font-semibold text-fg">
                  {i + 1}. {s.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-fg-subtle">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="October 5, 2026"
      sections={[
        {
          heading: 'Information we collect',
          body: (
            <p>
              Account information you provide (name, work email, firm and professional role) and the figures you enter into
              Tapreco tools. Tapreco tools do not request Social Security numbers, bank account details or uploaded tax returns.
            </p>
          ),
        },
        {
          heading: 'How we use information',
          body: (
            <p>
              To authenticate you, provide the tools and workspace, save analyses you choose to save, respond to requests, and
              maintain the security of the service. We do not sell personal information.
            </p>
          ),
        },
        {
          heading: 'Where data is processed',
          body: (
            <p>
              Tax calculations run in your browser. Saved clients and analyses are stored in your workspace; when connected to the
              Tapreco cloud service they are stored on our servers and transmitted over encrypted connections.
            </p>
          ),
        },
        {
          heading: 'Retention and deletion',
          body: <p>You can delete clients and analyses at any time from your workspace. Account deletion requests can be sent to {site.email.privacy}.</p>,
        },
        {
          heading: 'Professional responsibility',
          body: (
            <p>
              Tax professionals using Tapreco remain responsible for their obligations regarding taxpayer information, including
              IRC §7216 and applicable professional standards.
            </p>
          ),
        },
        {
          heading: 'Contact',
          body: <p>Questions about this policy: {site.email.privacy}.</p>,
        },
      ]}
    />
  )
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="October 5, 2026"
      sections={[
        {
          heading: 'The service',
          body: <p>Tapreco provides software tools that support tax analysis and planning by tax professionals.</p>,
        },
        {
          heading: 'Not tax or legal advice',
          body: (
            <p>
              Results depend on the information entered and on Tapreco’s implementation of federal law, including stated
              simplifications. Outputs do not constitute tax, legal or investment advice. Licensed professionals are responsible
              for reviewing results and for the advice they give clients.
            </p>
          ),
        },
        {
          heading: 'Accounts',
          body: <p>You are responsible for safeguarding your credentials and for activity under your account. Notify us promptly of any unauthorized use.</p>,
        },
        {
          heading: 'Acceptable use',
          body: <p>Do not misuse the service, attempt to access it other than through the interfaces we provide, or use it in violation of law.</p>,
        },
        {
          heading: 'Limitation of liability',
          body: <p>To the extent permitted by law, Tapreco is not liable for indirect or consequential damages arising from use of the service.</p>,
        },
        {
          heading: 'Contact',
          body: <p>Questions about these terms: {site.email.support}.</p>,
        },
      ]}
    />
  )
}
