import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ButtonLink, Reveal } from './ui'
export default function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [24, -24])
  const rotateY = useTransform(scrollYProgress, [0, 1], [-26, -16])
  return <section ref={ref} className="cta-section" aria-labelledby="cta-title"><div className="container"><div className="cta-panel"><motion.div className="cta-glass-composition" style={reduced ? undefined : { y, rotateY }} aria-hidden="true"><i /><i /><i /><span>1040</span><span>A BETTER PERSPECTIVE.</span></motion.div><Reveal><span className="eyebrow">YOUR NEXT PERSPECTIVE STARTS HERE</span><h2 id="cta-title">Bring your tax tools into<br /><span className="text-muted">one intelligent platform.</span></h2><p>Plan, calculate, compare, and analyze with Tapreco.</p><div className="cta-buttons"><ButtonLink to="/get-started" externalArrow>Get Started</ButtonLink><ButtonLink to="/#tools" secondary>Explore Tools</ButtonLink></div></Reveal></div></div></section>
}
