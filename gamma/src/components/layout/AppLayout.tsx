import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'
import { readJSON, writeJSON } from '@/services/storage'
import { AnimatedOutlet } from './PageTransition'
import { RequireAuth } from './RequireAuth'
import { SidebarContent } from './Sidebar'
import { getLenis } from './SmoothScroll'
import { Topbar } from './Topbar'

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.div aria-hidden className="absolute inset-0 bg-line/35 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.38, ease: EASE_PREMIUM }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) onClose()
            }}
            className="glass-strong absolute inset-y-0 left-0 w-[min(19rem,86vw)] border-r border-line/[0.07]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="absolute right-3 top-3.5 z-10 grid size-9 place-items-center rounded-full border border-line/10 text-fg-subtle hover:text-fg"
            >
              <X className="size-4" />
            </button>
            <SidebarContent layoutGroup="drawer" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** Authenticated application shell: sidebar, topbar, transitioning content. */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => readJSON('sidebar.collapsed', false))
  const [drawer, setDrawer] = useState(false)
  const closeDrawer = useCallback(() => setDrawer(false), [])

  const toggle = () =>
    setCollapsed((c) => {
      writeJSON('sidebar.collapsed', !c)
      return !c
    })

  return (
    <RequireAuth>
      <div className="relative min-h-dvh overflow-x-clip">
        <aside
          data-print-hide
          className={cn(
            'fixed inset-y-0 left-0 z-40 hidden border-r border-line/[0.06] bg-ink-950/85 backdrop-blur-xl transition-[width] duration-300 ease-premium lg:block',
            collapsed ? 'w-[84px]' : 'w-[272px]',
          )}
        >
          <SidebarContent collapsed={collapsed} onToggleCollapse={toggle} />
        </aside>
        <MobileDrawer open={drawer} onClose={closeDrawer} />

        <div className={cn('flex min-h-dvh flex-col transition-[padding] duration-300 ease-premium', collapsed ? 'lg:pl-[84px]' : 'lg:pl-[272px]')}>
          <Topbar onOpenMenu={() => setDrawer(true)} />
          <main id="main" tabIndex={-1} className="flex-1 px-4 pb-16 pt-6 outline-none sm:px-6 lg:px-8 lg:pt-8">
            <AnimatedOutlet className="mx-auto w-full max-w-[1400px]" />
          </main>
        </div>
      </div>
    </RequireAuth>
  )
}
