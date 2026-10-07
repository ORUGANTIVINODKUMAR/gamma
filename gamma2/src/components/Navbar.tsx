import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Logo } from './ui'
import { motion, useReducedMotion } from 'framer-motion'
import { premiumEase } from '../animations/motion'

const links = [['Home', '/'], ['Platform', '/#platform'], ['Tax Tools', '/#tools'], ['Solutions', '/#solutions'], ['About', '/#about']]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const reduced = useReducedMotion()
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])
  return <motion.header initial={reduced ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.65, ease: premiumEase }} className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} onClick={event => { if ((event.target as HTMLElement).closest('a')) setOpen(false) }}>
    <div className="nav-inner">
      <Logo />
      <nav aria-label="Main navigation" className="desktop-nav">{links.map(([label, to]) => <Link key={label} to={to} className={to === `${location.pathname}${location.hash}` ? 'active' : ''} aria-current={to === `${location.pathname}${location.hash}` ? 'location' : undefined}>{label}</Link>)}</nav>
      <div className="nav-actions"><Link to="/sign-in" className="sign-in">Sign In</Link><Link to="/get-started" className="button button-primary nav-cta">Get Started <ArrowUpRight size={16} /></Link></div>
      <button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav">{links.map(([label, to]) => <Link key={label} to={to} onClick={() => setOpen(false)}>{label}</Link>)}<Link to="/sign-in" onClick={() => setOpen(false)}>Sign In</Link><Link className="button button-primary" to="/get-started" onClick={() => setOpen(false)}>Get Started <ArrowUpRight size={16} /></Link></nav>}
  </motion.header>
}
