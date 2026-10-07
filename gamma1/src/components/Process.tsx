import { motion, useScroll } from 'framer-motion'
import { useRef } from 'react'
import { Reveal } from './Reveal'

const STEPS = [
  { title: 'Capture', text: 'Bring the client situation into one structured workspace: income, entities, funds and filings.' },
  { title: 'Analyze', text: 'Run purpose-built tools for planning, estimated tax, audit risk, entity and Roth strategy.' },
  { title: 'Advise', text: 'Turn clear, defensible analysis into confident recommendations your clients can act on.' },
]

export default function Process() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] })

  return (
    <section className="section process" id="process">
      <div className="container process-grid">
        <Reveal className="sec-head process-head">
          <span className="pill">
            <span className="pulse" /> How it works
          </span>
          <h2 className="h2">
            From question to <span className="grad">answer</span> in three moves.
          </h2>
          <p className="sec-lead">A simple rhythm that keeps every engagement consistent.</p>
        </Reveal>

        <ol className="steps" ref={ref}>
          <i className="steps-rail" aria-hidden="true" />
          <motion.i className="steps-fill" style={{ scaleY: scrollYProgress }} aria-hidden="true" />
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={0.05} className="step">
              <span className="step-dot">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
