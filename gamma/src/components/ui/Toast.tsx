import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, OctagonAlert, X } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'

interface ToastItem {
  id: number
  message: string
  tone: 'success' | 'info' | 'error'
  action?: { label: string; to: string }
}

let items: ToastItem[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function toast(message: string, opts: { tone?: ToastItem['tone']; action?: ToastItem['action']; duration?: number } = {}) {
  const id = nextId++
  items = [...items, { id, message, tone: opts.tone ?? 'success', action: opts.action }].slice(-3)
  emit()
  window.setTimeout(() => dismiss(id), opts.duration ?? 4200)
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id)
  emit()
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Polite live region of transient confirmations. */
export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => items)
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
      <AnimatePresence initial={false}>
        {list.map((t) => {
          const Icon = t.tone === 'success' ? Check : t.tone === 'error' ? OctagonAlert : Info
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.28, ease: EASE_PREMIUM }}
              className="glass-strong pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.16)]"
              role="status"
            >
              <Icon
                aria-hidden
                className={cn('size-5 shrink-0', t.tone === 'success' ? 'text-accent-300' : t.tone === 'error' ? 'text-critical-soft' : 'text-fg-subtle')}
              />
              <p className="flex-1 text-[13.5px] text-fg">{t.message}</p>
              {t.action && (
                <Link to={t.action.to} onClick={() => dismiss(t.id)} className="shrink-0 text-[13px] font-semibold text-accent-300 hover:text-accent-200">
                  {t.action.label}
                </Link>
              )}
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="grid size-7 shrink-0 place-items-center rounded-full text-fg-faint hover:bg-line/[0.06] hover:text-fg">
                <X className="size-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
