import ToolCard from './ToolCard'
import Reveal from './Reveal'
import { TOOLS } from '../data/tools'

export default function ToolsSection({ bare = false }: { bare?: boolean }) {
  return (
    <section className="section section--soft" id="tools" aria-labelledby="tools-title">
      <div className="container">
        <Reveal>
          {!bare && (
<header className="section__head">
            <p className="label">Tax Tools</p>
            <h2 id="tools-title">Tax tools built for better decisions</h2>
            <p className="section__lead">
              Access specialized tools for planning, calculations, risk review and entity analysis from one professional platform.
            </p>
          </header>
)}
          <div className="tools-grid">
            {TOOLS.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
