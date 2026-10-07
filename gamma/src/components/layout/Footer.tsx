import { ArrowUpRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { site } from '@/config/site'
import { TOOLS } from '@/config/tools'

interface FooterColumn {
  title: string
  links: { label: string; to: string }[]
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Overview', to: '/platform' },
      { label: 'Dashboard', to: '/platform#dashboard' },
      { label: 'Workflow', to: '/platform#workflow' },
      { label: 'Security', to: '/platform#security' },
    ],
  },
  {
    title: 'Tax Tools',
    links: TOOLS.map((t) => ({ label: t.shortName, to: t.path })),
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Solutions', to: '/solutions' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'All tax tools', to: '/tools' },
      { label: 'Tax year coverage', to: '/platform#coverage' },
      { label: 'Get support', to: '/contact' },
    ],
  },
]

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13v5.43h-4v-4.82c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.9h-4v-11Z" />
    </svg>
  )
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[14px]" aria-hidden fill="currentColor">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58l11.09 14.47Z" />
    </svg>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line/[0.06] bg-ink-950">
      <div className="container-page relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Link to="/" aria-label="Tapreco home" className="inline-block rounded-lg">
              <Logo />
            </Link>
            <p className="mt-5 text-[14px] leading-relaxed text-fg-subtle">{site.description}</p>
            <a
              href={`mailto:${site.email.sales}`}
              className="group mt-6 inline-flex items-center gap-2 text-[13.5px] font-medium text-accent-300 hover:text-accent-200"
            >
              <Mail className="size-4" aria-hidden />
              {site.email.sales}
              <ArrowUpRight aria-hidden className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            {(site.social.linkedin || site.social.x) && (
              <div className="mt-6 flex gap-2">
                {site.social.linkedin && (
                  <a
                    href={site.social.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Tapreco on LinkedIn (opens in a new tab)"
                    className="grid size-9 place-items-center rounded-full border border-line/10 text-fg-subtle transition-colors hover:border-accent-500/40 hover:text-accent-200"
                  >
                    <LinkedInGlyph />
                  </a>
                )}
                {site.social.x && (
                  <a
                    href={site.social.x}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Tapreco on X (opens in a new tab)"
                    className="grid size-9 place-items-center rounded-full border border-line/10 text-fg-subtle transition-colors hover:border-accent-500/40 hover:text-accent-200"
                  >
                    <XGlyph />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-faint">{col.title}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="relative text-[13.5px] text-fg-subtle transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-accent-400/70 after:transition-transform after:duration-300 hover:text-fg hover:after:scale-x-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 text-[12.5px] text-fg-faint md:flex-row md:items-center md:justify-between">
          <p>© {year} Tapreco. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/privacy" className="hover:text-fg">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-fg">Terms of Service</Link>
            <Link to="/contact" className="hover:text-fg">Contact</Link>
          </nav>
        </div>
        <p className="mt-6 max-w-3xl text-[11.5px] leading-relaxed text-fg-faint/80">
          Tapreco provides calculations and analysis to support licensed tax professionals. Results depend on the information
          entered and current federal law, and do not constitute legal or tax advice.
        </p>
      </div>
    </footer>
  )
}
