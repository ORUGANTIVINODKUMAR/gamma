import { AnimatePresence, motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface TooltipTriggerProps {
  'aria-describedby': string
  onFocus: () => void
  onBlur: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onKeyDown: (e: { key: string }) => void
}

/** Hover/focus tooltip. Content is also exposed via aria-describedby. */
export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: {
  content: ReactNode
  children: (props: TooltipTriggerProps) => ReactNode
  side?: 'top' | 'bottom'
  className?: string
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  return (
    <span className={cn('relative inline-flex', className)}>
      {children({
        'aria-describedby': id,
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onKeyDown: (e) => e.key === 'Escape' && setOpen(false),
      })}
      <AnimatePresence>
        {open && (
          <motion.span
            aria-hidden
            role="tooltip"
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'glass-strong pointer-events-none absolute left-1/2 z-50 w-max max-w-[260px] -translate-x-1/2 rounded-xl px-3 py-2 text-left text-[12.5px] font-normal leading-relaxed text-fg-muted shadow-2xl',
              side === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]',
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
      {/* The description always lives here; the visible bubble is decorative. */}
      <span id={id} className="sr-only">
        {content}
      </span>
    </span>
  )
}

export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip content={text}>
      {(props) => (
        <button
          type="button"
          aria-label="More information"
          {...props}
          className="grid size-4 place-items-center rounded-full text-fg-faint transition-colors hover:text-accent-300 focus-visible:text-accent-300"
        >
          <Info className="size-3.5" />
        </button>
      )}
    </Tooltip>
  )
}
