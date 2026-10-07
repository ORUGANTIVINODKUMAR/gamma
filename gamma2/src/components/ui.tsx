import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { premiumEase, revealTransition } from '../animations/motion'

export function Logo() {
  return <Link to="/" className="brand" aria-label="Tapreco home"><span className="brand-mark" aria-hidden="true"><span /><span /></span><span>TAPRECO<span className="brand-period">.</span></span></Link>
}
export function ButtonLink({ to, children, secondary = false, className = '', externalArrow = false }: { to: string; children: ReactNode; secondary?: boolean; className?: string; externalArrow?: boolean }) {
  return <Link to={to} className={`button ${secondary ? 'button-secondary' : 'button-primary'} ${className}`}>{children}{externalArrow ? <ArrowUpRight size={18} /> : <ArrowRight size={18} />}</Link>
}
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ ...revealTransition, duration: reduced ? 0 : 0.75, delay: reduced ? 0 : delay }}>{children}</motion.div>
}
export function Heading({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return <h2 className={`heading-mask ${className}`}><motion.span initial={reduced ? false : { y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reduced ? 0 : 0.8, ease: premiumEase }}>{children}</motion.span></h2>
}
export function HeroLine({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion()
  return <span className={`hero-line-mask ${className}`}><motion.span initial={reduced ? false : { y: '108%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : delay, ease: premiumEase }}>{children}</motion.span></span>
}
