import { animate, useInView } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { usePreferences } from '@/context/PreferencesContext'
import { cn } from '@/lib/cn'
import { initials as toInitials } from '@/lib/format'

/* ── Card ──────────────────────────────────────────────────────────────── */

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('surface-card rounded-card', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-accent-500/10 text-accent-400">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-fg">{title}</h3>
          {description && <p className="mt-1 text-[13px] leading-relaxed text-fg-faint">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* ── Badge ─────────────────────────────────────────────────────────────── */

/**
 * Semantic tones rendered in three palette styles — meaning is carried by the
 * badge text, never by colour alone:
 *   neutral (gray) ← neutral, good, warning
 *   accent  (light blue) ← accent, info, serious
 *   strong  (solid blue) ← critical
 */
export type Tone = 'accent' | 'neutral' | 'good' | 'warning' | 'serious' | 'critical' | 'info'

const NEUTRAL = 'border-line/10 bg-line/[0.04] text-fg-muted'
const ACCENT = 'border-accent-500/25 bg-accent-500/10 text-accent-300'
const STRONG = 'border-accent-400 bg-accent-400 text-white'

const toneClasses: Record<Tone, string> = {
  neutral: NEUTRAL,
  good: NEUTRAL,
  warning: NEUTRAL,
  accent: ACCENT,
  info: ACCENT,
  serious: ACCENT,
  critical: STRONG,
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string; withIcon?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11.5px] font-semibold tracking-[0.01em]',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ── Avatar ────────────────────────────────────────────────────────────── */

export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-lg bg-accent-500/10 font-display font-semibold text-accent-300',
        size === 'sm' && 'size-8 text-[11px]',
        size === 'md' && 'size-9 text-xs',
        size === 'lg' && 'size-14 text-base',
        className,
      )}
    >
      {toInitials(name) || '–'}
    </span>
  )
}

/* ── Spinner / loaders ─────────────────────────────────────────────────── */

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-fg-subtle', className)}>
      <LoaderCircle className="size-5 animate-spin text-accent-400" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" aria-busy="true">
      <p className="animate-pulse text-[13px] font-medium text-fg-faint">Loading…</p>
    </div>
  )
}

/* ── Animated counter ──────────────────────────────────────────────────── */

export function Counter({
  value,
  format = (n) => Math.round(n).toLocaleString('en-US'),
  duration = 1.4,
  className,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const { reduceMotion } = usePreferences()
  const [display, setDisplay] = useState(() => format(reduceMotion ? value : 0))

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setDisplay(format(value))
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(v)),
    })
    return () => controls.stop()
    // format is intentionally excluded: callers pass inline functions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, duration, reduceMotion])

  return (
    <span ref={ref} className={className} aria-label={format(value)}>
      <span aria-hidden>{display}</span>
    </span>
  )
}

/* ── Empty state ───────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      <span className="grid size-12 place-items-center rounded-xl bg-accent-500/10 text-accent-400">
        {icon}
      </span>
      <h3 className="font-display text-base font-semibold text-fg">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-relaxed text-fg-faint">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/* ── Callout ───────────────────────────────────────────────────────────── */

/** Note block with a left rule. `critical` is reserved for genuine errors (red). */
export function Callout({
  tone = 'neutral',
  title,
  children,
  className,
}: {
  tone?: 'neutral' | 'accent' | 'warning' | 'critical' | 'good'
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border-l-[3px] px-4 py-3 text-[13.5px] leading-relaxed',
        tone === 'neutral' && 'border-line/20 bg-line/[0.03] text-fg-subtle',
        (tone === 'accent' || tone === 'warning' || tone === 'good') && 'border-accent-400 bg-accent-500/[0.07] text-fg-muted',
        tone === 'critical' && 'border-critical bg-critical/[0.06] text-fg-muted',
        className,
      )}
    >
      {title && <p className="mb-0.5 font-semibold text-fg">{title}</p>}
      {children}
    </div>
  )
}
