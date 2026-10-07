import { useId } from 'react'
import { cn } from '@/lib/cn'

/** Tapreco mark: a white "T" on sapphire whose base resolves into ascending data bars. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 40 40" className={cn('size-8', className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="39" height="39" rx="10" fill={`url(#${id}-g)`} />
      <path d="M10 11h20v4.5h-7.75V30h-4.5V15.5H10z" fill="#FFFFFF" />
      <rect x="10" y="23.5" width="3.75" height="6.5" rx="1" fill="#FFFFFF" opacity="0.7" />
      <rect x="26.25" y="19.5" width="3.75" height="10.5" rx="1" fill="#FFFFFF" opacity="0.85" />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-[15px] font-semibold tracking-[0.32em] text-fg">
          TAPRECO
        </span>
      )}
    </span>
  )
}
