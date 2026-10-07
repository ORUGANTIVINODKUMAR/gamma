import Reveal from './Reveal'
import { useStep } from '../hooks/useStep'

const STEPS = [
  { n: '01', title: 'Client', text: 'Select or create a client.' },
  { n: '02', title: 'Choose Tool', text: 'Open the appropriate Tapreco tax tool.' },
  { n: '03', title: 'Analyze', text: 'Enter or import the required tax information.' },
  { n: '04', title: 'Review', text: 'Review calculations, analysis and planning results.' },
]

export default function WorkflowSection({ bare = false }: { bare?: boolean }) {
  // highlight moves through the four steps in a loop
  const current = useStep(true, STEPS.length + 1, 1600)
  return (
    <section className="section" id="workflow" aria-labelledby="workflow-title">
      <div className="container">
        <Reveal>
          {!bare && (
            <header className="section__head">
              <p className="label">Workflow</p>
              <h2 id="workflow-title">A simpler tax analysis workflow</h2>
            </header>
          )}
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.n} className={current > i ? (current === i + 1 ? 'is-current' : 'is-done') : ''}>
                <span className="steps__num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
