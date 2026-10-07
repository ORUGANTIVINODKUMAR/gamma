import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import Button from './Button'
import { TOOLS } from '../data/tools'

const PAGES = [
  { label: 'Home', to: '/', end: true },
  { label: 'Platform', to: '/platform' },
  { label: 'Tax Tools', to: '/tools', menu: true },
  { label: 'Solutions', to: '/solutions' },
  { label: 'About', to: '/about' },
]

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Tapreco home">
      <span className="logo__mark" aria-hidden="true">
        T
      </span>
      <span className="logo__word">TAPRECO</span>
    </Link>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const dropdown = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    setOpen(false)
    setMenu(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', on)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', on)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!menu) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    const down = (e: PointerEvent) => {
      if (dropdown.current && !dropdown.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('keydown', key)
    document.addEventListener('pointerdown', down)
    return () => {
      document.removeEventListener('keydown', key)
      document.removeEventListener('pointerdown', down)
    }
  }, [menu])

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="nav__inner">
        <Logo />
        <nav className="nav__links" aria-label="Primary">
          {PAGES.map((p) =>
            p.menu ? (
              <div
                key={p.to}
                className="nav__item"
                ref={dropdown}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMenu(false)
                }}
              >
                <NavLink to={p.to} className="nav__link nav__link--split">
                  {p.label}
                </NavLink>
                <button
                  type="button"
                  className="nav__chev-btn"
                  aria-label="Show tax tools"
                  aria-expanded={menu}
                  aria-controls="tools-menu"
                  onClick={() => setMenu((v) => !v)}
                >
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                <div id="tools-menu" className={`dropdown${menu ? ' is-open' : ''}`}>
                  {TOOLS.map((t) => (
                    <Link key={t.slug} to={t.route} className="dropdown__item" tabIndex={menu ? 0 : -1}>
                      <t.icon size={18} aria-hidden="true" />
                      {t.name}
                    </Link>
                  ))}
                  <Link to="/tools" className="dropdown__all" tabIndex={menu ? 0 : -1}>
                    View all tools
                  </Link>
                </div>
              </div>
            ) : (
              <NavLink key={p.to} to={p.to} end={p.end} className="nav__link">
                {p.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="nav__actions">
          <Link to="/login" className="nav__signin">
            Sign In
          </Link>
          <Button to="/signup" size="sm" className="nav__cta">
            Get Started
          </Button>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="nav__sheet" hidden={!open}>
        <nav aria-label="Mobile">
          {PAGES.map((p) => (
            <NavLink key={p.to} to={p.to} end={p.end} className="nav__sheet-link">
              {p.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav__sheet-actions">
          <Button to="/signup">Get Started</Button>
          <Button to="/login" variant="secondary">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  )
}
