import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, LayoutDashboard, Menu } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { PRIMARY_NAV } from '@/config/nav'
import { TOOLS } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'
import { MobileMenu } from './MobileMenu'

function isActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/'
  if (to === '/tools') return pathname.startsWith('/tools')
  return pathname.startsWith(to)
}

const linkClass =
  'group relative inline-flex h-10 items-center rounded-full px-3.5 text-[13.5px] font-medium transition-colors duration-200'

function ActiveBar() {
  return (
    <motion.span
      layoutId="nav-active"
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="absolute inset-x-3.5 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-400 to-transparent"
    />
  )
}

function HoverBar() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-3.5 -bottom-px h-px origin-left scale-x-0 bg-line/30 transition-transform duration-300 ease-premium group-hover:scale-x-100"
    />
  )
}

function ToolsMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const openSoon = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), 70)
  }
  const closeSoon = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(false), 160)
  }

  const focusItem = useCallback((index: number) => {
    const items = panelRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]')
    if (!items || items.length === 0) return
    items[(index + items.length) % items.length]?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div className="relative" onMouseEnter={openSoon} onMouseLeave={closeSoon}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="tools-menu"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            requestAnimationFrame(() => focusItem(0))
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        className={cn(linkClass, 'gap-1.5', active || open ? 'text-fg' : 'text-fg-subtle hover:text-fg')}
      >
        Tax Tools
        <ChevronDown aria-hidden className={cn('size-3.5 transition-transform duration-300 ease-premium', open && 'rotate-180 text-accent-300')} />
        {active ? <ActiveBar /> : <HoverBar />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="tools-menu"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.985 }}
            transition={{ duration: 0.22, ease: EASE_PREMIUM }}
            style={{ transformOrigin: 'top center' }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) setOpen(false)
            }}
            className="absolute left-1/2 top-[calc(100%+14px)] z-50 w-[720px] -translate-x-1/2"
            onKeyDown={(e) => {
              const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? [])
              const index = items.indexOf(document.activeElement as HTMLElement)
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                focusItem(index + 1)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                focusItem(index - 1)
              } else if (e.key === 'Escape') {
                setOpen(false)
                buttonRef.current?.focus()
              }
            }}
          >
            <div className="glass-strong relative grid grid-cols-[1.45fr_1fr] gap-2 overflow-hidden rounded-panel p-2 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.16)]">
              <ul className="flex flex-col gap-0.5 p-1">
                {TOOLS.map((tool, i) => (
                  <motion.li
                    key={tool.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.25, ease: EASE_PREMIUM }}
                  >
                    <Link
                      to={tool.path}
                      data-menu-item
                      className="group/item flex items-start gap-3.5 rounded-2xl p-3 transition-colors duration-200 hover:bg-line/[0.045] focus-visible:bg-line/[0.045]"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent-500/20 bg-gradient-to-b from-accent-500/15 to-accent-500/[0.03] text-accent-300 transition-all duration-300 ease-premium group-hover/item:border-accent-400/50 group-hover/item:text-accent-200 group-hover/item:shadow-[0_10px_18px_-10px_rgba(37,99,235,0.5)]">
                        <tool.icon className="size-[18px]" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-fg">
                          {tool.name}
                          <ArrowUpRight
                            aria-hidden
                            className="size-3.5 -translate-x-1 text-accent-300 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                          />
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-fg-faint">{tool.tagline}</span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="relative flex flex-col justify-between overflow-hidden rounded-[1.25rem] border border-line/[0.06] bg-gradient-to-b from-ink-700/80 to-ink-850 p-5">
                <div className="relative">
                  <p className="eyebrow">One platform</p>
                  <p className="mt-3 font-display text-lg font-semibold leading-snug text-fg">
                    Five professional tools. <span className="text-accent-400">One secure sign-in.</span>
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-fg-faint">
                    Every analysis shares the same federal engine, client record and report format.
                  </p>
                </div>
                <Link
                  to="/tools"
                  data-menu-item
                  className="group/all relative mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-accent-300 hover:text-accent-200"
                >
                  Explore all tax tools
                  <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Navbar() {
  const scrolled = useScrolled(16)
  const { pathname } = useLocation()
  const { status } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <div className="container-page pt-3">
        <div
          className={cn(
            'rounded-full border transition-[background-color,border-color,backdrop-filter,box-shadow] duration-500 ease-premium',
            scrolled
              ? 'border-white/80 bg-white/70 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_18px_44px_-22px_rgba(15,23,42,0.28)] backdrop-blur-xl backdrop-saturate-150'
              : 'border-transparent bg-transparent',
          )}
        >
        <nav aria-label="Primary" className="flex h-14 items-center justify-between gap-6 pl-5 pr-2.5">
          <Link to="/" aria-label="Tapreco home" className="shrink-0 rounded-lg">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item.to)
              if (item.to === '/tools') {
                return (
                  <li key={item.to}>
                    <ToolsMenu active={active} />
                  </li>
                )
              }
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={cn(linkClass, active ? 'text-fg' : 'text-fg-subtle hover:text-fg')}
                  >
                    {item.label}
                    {active ? <ActiveBar /> : <HoverBar />}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            {status === 'authenticated' ? (
              <span className="hidden sm:inline-flex">
                <Button to="/app" size="sm" icon={<LayoutDashboard className="size-4" aria-hidden />} magnetic>
                  Enter Platform
                </Button>
              </span>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden h-9 items-center rounded-full px-4 text-[13.5px] font-medium text-fg-subtle transition-colors hover:text-fg sm:inline-flex"
                >
                  Login
                </Link>
                <span className="hidden sm:inline-flex">
                  <Button to="/signup" size="sm" withArrow magnetic>
                    Enter Platform
                  </Button>
                </span>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="grid size-10 place-items-center rounded-full border border-line/10 bg-line/[0.03] text-fg transition-colors hover:border-accent-500/40 hover:text-accent-200 lg:hidden"
            >
              <Menu className="size-[18px]" />
            </button>
          </div>
        </nav>
        </div>
      </div>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  )
}
