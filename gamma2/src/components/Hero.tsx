import { ArrowDown, MoveUpRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ButtonLink, HeroLine, Reveal } from './ui'
import { premiumEase } from '../animations/motion'
import Scene from './Scene'

export default function Hero() {
  const reduced = useReducedMotion()
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-background" aria-hidden="true"><div className="ambient-plane" /></div>
    <div className="container hero-grid">
      <div className="hero-copy">
        <Reveal delay={0.12}><div className="eyebrow"><span className="label-line" /> TAX INTELLIGENCE PLATFORM</div></Reveal>
        <h1 id="hero-title"><HeroLine delay={0.2} className="hero-premise">Smarter tax decisions.</HeroLine><HeroLine delay={0.31} className="hero-accent">One intelligent</HeroLine><HeroLine delay={0.43} className="hero-accent">platform.</HeroLine></h1>
        <Reveal delay={0.54}><p className="hero-description">Tapreco brings tax planning, calculations, risk analysis, and entity strategy into one professional platform.</p></Reveal>
        <div className="hero-buttons"><Reveal delay={0.64}><ButtonLink to="/#tools">Explore Tools</ButtonLink></Reveal><Reveal delay={0.72}><ButtonLink to="/get-started" secondary externalArrow>Get Started</ButtonLink></Reveal></div>
        <Reveal delay={0.8}><p className="hero-trust"><ShieldCheck size={16} strokeWidth={1.5} /> Built for CPAs, tax professionals & modern firms.</p></Reveal>
      </div>
      <motion.div className="hero-visual" initial={reduced ? false : { opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.35, ease: premiumEase }}>
        <div className="visual-topline"><span>THE CONNECTED TAX WORKSPACE</span><MoveUpRight size={16} /></div><Scene variant="hero" />
        <div className="scene-note"><span className="scene-note-line" /><span>Purpose-built expertise.<br /><strong>One connected perspective.</strong></span></div><span className="scene-interaction">MOVE TO EXPLORE <MoveUpRight size={13} /></span>
      </motion.div>
    </div>
    <div className="container hero-bottom"><div><span>ONE WORKSPACE</span><strong>Every angle. Considered.</strong></div><Link to="/#tools">Discover your toolkit <ArrowDown size={17} /></Link><span className="hero-bottom-end">PLANNING / ANALYSIS / STRATEGY</span></div>
  </section>
}
