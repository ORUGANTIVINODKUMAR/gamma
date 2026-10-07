import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Heading, Reveal } from './ui'
import Scene from './Scene'

export default function PlatformSection() {
  return <section id="platform" className="section platform-section" aria-labelledby="platform-title"><div className="container"><div className="platform-heading"><Reveal><span className="eyebrow">CONNECTED BY DESIGN</span></Reveal><div id="platform-title"><Heading>Everything connected.<br /><span className="text-muted">One tax workspace.</span></Heading></div><Reveal><p>From one perspective to the next.<br />Move between tools without losing the bigger picture.</p></Reveal></div><div className="platform-stage"><div className="platform-side-note"><span>FIVE SPECIALTIES</span><strong>One shared<br />perspective.</strong></div><Scene variant="platform" /><div className="platform-side-note right"><span>ONE EXPERIENCE</span><strong>Designed to<br />work together.</strong></div></div><Reveal className="platform-bottom"><span>PLANNING / CALCULATION / REVIEW / STRATEGY</span><Link to="/#tools" className="text-link">Explore the ecosystem <ArrowUpRight size={18} /></Link></Reveal></div></section>
}
