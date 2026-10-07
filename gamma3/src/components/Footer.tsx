import { Link } from 'react-router-dom'
import { Logo } from './Navbar'
import { TOOLS } from '../data/tools'

const info = (slug: string) => `/p/${slug}`

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Overview', to: '/platform' },
      { label: 'Workflow', to: '/solutions' },
      { label: 'Sign In', to: '/login' },
    ],
  },
  { title: 'Tax Tools', links: TOOLS.map((t) => ({ label: t.name, to: t.route })) },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: info('contact') },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', to: info('help-center') },
      { label: 'Guides', to: info('guides') },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo />
            <p>Professional Tax Intelligence</p>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title} className="footer__col">
              <h3>{c.title}</h3>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer__bottom">
          <span>&copy; Tapreco. All rights reserved.</span>
          <ul>
            <li>
              <Link to={info('privacy-policy')}>Privacy</Link>
            </li>
            <li>
              <Link to={info('terms')}>Terms</Link>
            </li>
            <li>
              <Link to={info('security')}>Security</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
