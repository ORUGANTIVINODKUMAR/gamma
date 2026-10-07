import { Link } from 'react-router-dom'
import Logo from './Logo'
import { TOOLS } from '../data/tools'
import { ROUTES } from '../lib/routes'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Overview', to: ROUTES.info('overview') },
      { label: 'Process', to: ROUTES.process },
      { label: 'Why Tapreco', to: ROUTES.why },
      { label: 'Sign In', to: ROUTES.signIn },
      { label: 'Get Started', to: ROUTES.signUp },
    ],
  },
  { title: 'Tax Tools', links: TOOLS.map((t) => ({ label: t.short, to: ROUTES.tool(t.id) })) },
  {
    title: 'Company',
    links: [
      { label: 'About', to: ROUTES.info('about') },
      { label: 'Careers', to: ROUTES.info('careers') },
      { label: 'Contact', to: ROUTES.contact },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Guides', to: ROUTES.info('guides') },
      { label: 'Support', to: ROUTES.info('support') },
      { label: 'Updates', to: ROUTES.info('updates') },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: ROUTES.info('privacy') },
      { label: 'Terms', to: ROUTES.info('terms') },
      { label: 'Security', to: ROUTES.info('security') },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>Professional tax technology for smarter decisions.</p>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title} className="footer-col">
              <h4>{c.title}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="flink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Tapreco. All rights reserved.</span>
          <div>
            <Link to={ROUTES.info('privacy')} className="flink">Privacy</Link>
            <Link to={ROUTES.info('terms')} className="flink">Terms</Link>
            <Link to={ROUTES.info('security')} className="flink">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
