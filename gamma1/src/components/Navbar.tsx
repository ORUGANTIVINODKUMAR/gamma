import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { EASE } from '../data/tools'
import { ROUTES } from '../lib/routes'

const LINKS = [
  { label: 'Tools', to: ROUTES.tools },
  { label: 'Process', to: ROUTES.process },
  { label: 'Why Tapreco', to: ROUTES.why },
  { label: 'Contact', to: ROUTES.contact },
]

export default function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled((s) => (s !== y > 24 ? y > 24 : s)))

  useEffect(() => setOpen(false), [pathname])

  return (
    <motion.header
      className={`nav ${scrolled ? 'is-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: EASE }}
    >
      <div className="nav-pill">
        <Logo />
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to={ROUTES.signIn} className="nav-signin">
            Sign in
          </Link>
          <Link to={ROUTES.signUp} className="btn btn-primary btn-sm">
            Get started
          </Link>
          <button className="nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
            <Link to={ROUTES.signIn} onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link to={ROUTES.signUp} className="btn btn-primary" onClick={() => setOpen(false)}>
              Get started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
