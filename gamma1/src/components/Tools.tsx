import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PointerEvent } from 'react'
import { Reveal } from './Reveal'
import { TOOLS } from '../data/tools'
import { ROUTES } from '../lib/routes'

function track(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function Tools() {
  return (
    <section className="section tools" id="tools">
      <div className="container">
        <Reveal className="sec-head">
          <span className="pill">
            <span className="pulse" /> Tax tools
          </span>
          <h2 className="h2">
            Six tools. <span className="grad">One workspace.</span>
          </h2>
          <p className="sec-lead">Each tool answers a single tax question with precision, and they all work together.</p>
        </Reveal>

        <div className="bento">
          {TOOLS.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.08} className={`bento-cell bento-${i + 1}`}>
              <Link to={ROUTES.tool(t.id)} className={`card ${t.primary ? 'card-primary' : ''}`} onPointerMove={track}>
                <span className="card-glow" aria-hidden="true" />
                {t.primary && (
                  <span className="card-orbit" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
                <span className="card-top">
                  <span className="card-icon">
                    <t.icon size={t.primary ? 26 : 22} strokeWidth={1.6} />
                  </span>
                  <span className="card-num">{t.number}</span>
                </span>
                <span className="card-body">
                  <h3 className="card-name">{t.name}</h3>
                  <p className="card-desc">{t.description}</p>
                </span>
                <span className="card-go">
                  Open tool <ArrowUpRight size={16} strokeWidth={1.8} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
