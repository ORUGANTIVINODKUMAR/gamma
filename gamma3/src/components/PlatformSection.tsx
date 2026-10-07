import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { TOOLS } from '../data/tools'

export default function PlatformSection({ bare = false }: { bare?: boolean }) {
  return (
    <section className="section section--soft" id="platform" aria-labelledby="platform-title">
      <div className="container">
        <Reveal>
          {!bare && (
<header className="section__head">
            <p className="label">The Platform</p>
            <h2 id="platform-title">One platform for your tax workflow</h2>
            <p className="section__lead">
              Instead of switching between disconnected tools, Tapreco provides access to specialized tax analysis tools from
              one platform.
            </p>
          </header>
)}
          <ul className="rows">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link to={t.route} className="row">
                  <span className="icon-box" aria-hidden="true">
                    <t.icon size={20} strokeWidth={1.7} />
                  </span>
                  <span className="row__name">{t.short}</span>
                  {t.flagship && <span className="tag">Flagship</span>}
                  <span className="row__arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
