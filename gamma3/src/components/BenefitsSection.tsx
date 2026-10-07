import { FileText, Gauge, LayoutGrid, LockKeyhole, Repeat, UsersRound } from 'lucide-react'
import Reveal from './Reveal'

const BENEFITS = [
  { icon: LayoutGrid, title: 'Unified Platform', text: 'Access your tax tools from one location.' },
  { icon: UsersRound, title: 'Client-Based Workflow', text: 'Organize calculations and analysis around clients.' },
  { icon: FileText, title: 'Professional Calculations', text: 'Build tools around structured tax rules and inputs.' },
  { icon: Gauge, title: 'Simple Experience', text: 'Reduce unnecessary complexity in everyday workflows.' },
  { icon: Repeat, title: 'Consistent Interface', text: 'Use a familiar experience across different tax tools.' },
  { icon: LockKeyhole, title: 'Secure Access', text: 'Provide controlled access for firms and team members.' },
]

export default function BenefitsSection({ bare = false }: { bare?: boolean }) {
  return (
    <section className="section section--soft" id="benefits" aria-labelledby="benefits-title">
      <div className="container">
        <Reveal>
          {!bare && (
<header className="section__head">
            <p className="label">Why Tapreco</p>
            <h2 id="benefits-title">Designed for professional tax work</h2>
          </header>
)}
          <ul className="benefits">
            {BENEFITS.map((b) => (
              <li key={b.title}>
                <span className="icon-box" aria-hidden="true">
                  <b.icon size={20} strokeWidth={1.7} />
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
