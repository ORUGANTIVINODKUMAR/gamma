import { Briefcase, Crosshair, Layers, LineChart, ShieldCheck, Sparkles } from 'lucide-react'
import { Reveal } from './Reveal'
import { BENEFITS } from '../data/tools'

const ICONS = [Layers, Crosshair, LineChart, ShieldCheck, Sparkles, Briefcase]

function Row({ items, reverse }: { items: typeof BENEFITS; reverse?: boolean }) {
  return (
    <div className={`mq ${reverse ? 'is-reverse' : ''}`}>
      <div className="mq-track">
        {[0, 1].map((k) => (
          <div className="mq-set" key={k} aria-hidden={k === 1}>
            {items.map((b) => {
              const Icon = ICONS[BENEFITS.indexOf(b)]
              return (
                <article className="why-card" key={b.title}>
                  <span className="card-icon">
                    <Icon size={20} strokeWidth={1.6} />
                  </span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </article>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Why() {
  return (
    <section className="section why" id="why">
      <div className="container">
        <Reveal className="sec-head sec-center">
          <span className="pill">
            <span className="pulse" /> Why Tapreco
          </span>
          <h2 className="h2">
            Built for people who <span className="grad">advise.</span>
          </h2>
        </Reveal>
      </div>
      <Row items={BENEFITS.slice(0, 3)} />
      <Row items={BENEFITS.slice(3)} reverse />
    </section>
  )
}
