import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, ScanLine } from 'lucide-react'
import { tools, toolPath } from '../data/tools'
import { Heading, Reveal } from './ui'
import { useMouseParallax } from '../hooks/useMouseParallax'
import { premiumEase } from '../animations/motion'

const MotionLink = motion.create(Link)
function ToolCard({ tool, index }: { tool: typeof tools[number]; index: number }) {
  const parallax = useMouseParallax(2.5)
  const reduced = useReducedMotion()
  const flagship = index === 0
  const Icon = tool.icon
  return <Reveal className={`tool-card-wrap ${flagship ? 'flagship-wrap' : ''}`} delay={index * 0.075}><MotionLink {...parallax} to={toolPath(tool.slug)} className={`tool-card ${flagship ? 'flagship' : ''}`} whileHover={reduced ? undefined : { y: -6 }} whileTap={reduced ? undefined : { scale: 0.995 }} transition={{ duration: 0.4, ease: premiumEase }}>
    <div className="tool-card-top"><span className="tool-icon"><Icon size={24} strokeWidth={1.5} /></span>{flagship ? <span className="flagship-label">FLAGSHIP TOOL</span> : <span className="tool-index">0{index + 1}</span>}</div>
    <div className="tool-content"><span className="tool-category">{tool.category}</span><h3>{tool.name}</h3><p>{tool.description}</p></div>
    {flagship && <div className="flagship-document" aria-hidden="true"><div className="mini-glass-layer" /><div className="mini-document"><span><ScanLine size={14} /> PLANNING WORKSPACE</span><strong>See beyond<br />the tax return.</strong><div><Check size={13} /> Evaluate your scenarios</div><div><Check size={13} /> Explore the opportunities</div><div><Check size={13} /> Plan the next step</div><span className="mini-document-bottom">STRUCTURED FOR PROFESSIONALS <ArrowUpRight size={14} /></span></div></div>}
    <span className="tool-link">Explore Tool <ArrowUpRight size={19} /></span>
  </MotionLink></Reveal>
}
export default function ToolsSection() {
  return <section id="tools" className="section tools-section" aria-labelledby="tools-title"><div className="container"><Reveal><div className="section-kicker"><span className="eyebrow">A PURPOSE-BUILT TOOLKIT</span><span className="section-number">01 / THE TOOLS</span></div></Reveal><div className="section-heading-row"><div id="tools-title"><Heading>One platform.<br /><span className="text-muted">Five powerful tax tools.</span></Heading></div><Reveal><p className="section-description">Different questions. Connected expertise.<br />Specialized tools to bring clarity to your next tax decision.</p></Reveal></div><div className="tools-grid">{tools.map((tool, index) => <ToolCard tool={tool} index={index} key={tool.slug} />)}</div><Reveal><p className="tools-footnote"><span className="tiny-square" /> Individual expertise. Collective intelligence.</p></Reveal></div></section>
}
