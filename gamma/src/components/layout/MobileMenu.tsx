import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { PRIMARY_NAV } from '@/config/nav'
import { TOOLS } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'
import { getLenis } from './SmoothScroll'

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation()
  const { status } = useAuth()
  const [toolsOpen, setToolsOpen] = useState(pathname.startsWith('/tools') || pathname.startsWith('/app/tools'))
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current()
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('button, a')?.focus())
    return () => {
      document.body.style.overflow = prev
      lenis?.start()
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-line/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) onClose()
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.42, ease: EASE_PREMIUM }}
            className="glass-strong absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto border-l border-line/[0.07]"
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-full border border-line/10 text-fg-muted hover:text-fg"
              >
                <X className="size-[18px]" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 px-3 pb-6">
              <ul className="flex flex-col">
                {PRIMARY_NAV.map((item, i) => {
                  const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
                  return (
                    <motion.li
                      key={item.to}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + i * 0.04, duration: 0.35, ease: EASE_PREMIUM }}
                      className="border-b border-line/[0.05]"
                    >
                      {item.to === '/tools' ? (
                        <>
                          <button
                            type="button"
                            aria-expanded={toolsOpen}
                            onClick={() => setToolsOpen((o) => !o)}
                            className={cn(
                              'flex w-full items-center justify-between px-3 py-4 font-display text-[17px] font-semibold',
                              active ? 'text-accent-200' : 'text-fg',
                            )}
                          >
                            Tax Tools
                            <ChevronDown className={cn('size-4 transition-transform duration-300', toolsOpen && 'rotate-180 text-accent-300')} />
                          </button>
                          <AnimatePresence initial={false}>
                            {toolsOpen && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: EASE_PREMIUM }}
                                className="overflow-hidden"
                              >
                                <li>
                                  <Link to="/tools" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-accent-300">
                                    Explore all tax tools
                                  </Link>
                                </li>
                                {TOOLS.map((tool) => (
                                  <li key={tool.id}>
                                    <Link
                                      to={tool.path}
                                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-fg-subtle hover:bg-line/[0.04] hover:text-fg"
                                    >
                                      <span className="grid size-8 place-items-center rounded-lg border border-accent-500/20 bg-accent-500/[0.07] text-accent-300">
                                        <tool.icon className="size-4" aria-hidden />
                                      </span>
                                      {tool.name}
                                    </Link>
                                  </li>
                                ))}
                                <li className="h-2" />
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          to={item.to}
                          aria-current={active ? 'page' : undefined}
                          className={cn('block px-3 py-4 font-display text-[17px] font-semibold', active ? 'text-accent-200' : 'text-fg')}
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.li>
                  )
                })}
              </ul>
            </nav>
            <div className="sticky bottom-0 flex flex-col gap-2.5 border-t border-line/[0.06] bg-ink-950/95 p-5 backdrop-blur-xl">
              {status === 'authenticated' ? (
                <Button to="/app" fullWidth withArrow>
                  Open Dashboard
                </Button>
              ) : (
                <>
                  <Button to="/signup" fullWidth withArrow>
                    Get Started
                  </Button>
                  <Button to="/login" variant="secondary" fullWidth>
                    Login
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
