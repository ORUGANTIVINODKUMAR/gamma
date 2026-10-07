import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'

function focusMenuItem(panel: HTMLElement | null, delta: number | 'first') {
  const items = Array.from(panel?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? [])
  if (!items.length) return
  if (delta === 'first') {
    items[0]!.focus()
    return
  }
  const i = items.indexOf(document.activeElement as HTMLElement)
  items[(i + delta + items.length) % items.length]!.focus()
}

/**
 * Accessible dropdown: click or ArrowDown to open, arrow keys between
 * `[data-menu-item]` elements, Escape / outside click / choosing a link to close.
 */
export function Menu({
  button,
  buttonLabel,
  buttonClassName,
  children,
  align = 'right',
  width = 'w-72',
  label,
}: {
  /** Trigger content; receives the open state for icon transitions. */
  button: (open: boolean) => ReactNode
  /** Accessible name for the trigger when its content is an icon. */
  buttonLabel?: string
  buttonClassName: (open: boolean) => string
  children: ReactNode
  align?: 'left' | 'right'
  width?: string
  label: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) trigger.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-label={buttonLabel}
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            requestAnimationFrame(() => focusMenuItem(panel.current, 'first'))
          }
        }}
        className={buttonClassName(open)}
      >
        {button(open)}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id={id}
            role="menu"
            aria-label={label}
            data-lenis-prevent
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE_PREMIUM }}
            style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a, [data-menu-close]')) close(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                focusMenuItem(panel.current, 1)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                focusMenuItem(panel.current, -1)
              }
            }}
            className={cn(
              'glass-strong absolute top-[calc(100%+10px)] z-50 max-h-[70vh] overflow-y-auto rounded-2xl p-1.5 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.16)]',
              align === 'right' ? 'right-0' : 'left-0',
              width,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const menuItemClass =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] text-fg-muted outline-none transition-colors hover:bg-line/[0.06] hover:text-fg focus-visible:bg-line/[0.06] focus-visible:text-fg'
