import { Check } from 'lucide-react'
import { tools } from '../data/tools'
import { ButtonLink, Heading, Reveal } from './ui'
import Scene from './Scene'

export default function TaxPlannerSection() {
  return <section className="section planner-section" aria-labelledby="planner-title"><div className="container planner-grid"><div className="planner-copy"><Reveal><span className="eyebrow"><span className="label-line" /> FLAGSHIP TOOL</span></Reveal><div id="planner-title"><Heading>Plan smarter.<br /><span className="text-muted">Before tax<br />season starts.</span></Heading></div><Reveal><p>A return tells you what happened. A plan helps you see what’s possible. Explore client scenarios and planning opportunities in one considered workspace.</p><ul className="feature-list">{tools[0].features.map(feature => <li key={feature}><span><Check size={14} /></span>{feature}</li>)}</ul><ButtonLink to="/tools/tax-planner" externalArrow>Explore Tax Planner</ButtonLink></Reveal></div><div className="planner-visual"><span className="visual-caption">A CLOSER LOOK AT THE POSSIBILITIES</span><Scene variant="workspace" /><div className="planner-caption"><span className="tiny-square" /> BUILT TO THINK AHEAD</div></div></div></section>
}
