import { Link } from 'react-router-dom'
import type { Tool } from '../data/tools'

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  return (
    <Link to={tool.route} className={`tool-card${tool.flagship ? ' tool-card--flagship' : ''}`}>
      <span className="tool-card__head">
        <span className="icon-box" aria-hidden="true">
          <Icon size={22} strokeWidth={1.7} />
        </span>
        {tool.flagship && <span className="tag">Flagship</span>}
      </span>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      <span className="text-link">Explore tool &rarr;</span>
    </Link>
  )
}
