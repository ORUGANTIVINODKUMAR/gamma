import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'

/**
 * Hero for inner marketing pages. Editorial serif headline on the studio
 * backdrop; an optional `scene` slot takes a 3D stage rendered beneath the copy.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  scene,
  align = 'center',
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  /** A 3D scene filling the lower half of the hero. */
  scene?: ReactNode
  align?: 'center' | 'left'
}) {
  return (
    <section className={cn('studio-bg relative isolate overflow-hidden pb-16 pt-[calc(68px+4rem)] sm:pb-24 sm:pt-[calc(68px+5.5rem)]', !!scene && 'pb-0 sm:pb-0')}>
      <div className={cn('container-page relative', align === 'center' ? 'text-center' : 'text-left')}>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_PREMIUM }}
          className="eyebrow inline-flex items-center gap-3"
        >
          {eyebrow}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: EASE_PREMIUM }}
          className={cn('t-h1 mt-5 max-w-4xl text-fg', align === 'center' && 'mx-auto')}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE_PREMIUM }}
            className={cn('t-lead mt-6 max-w-2xl', align === 'center' && 'mx-auto')}
          >
            {description}
          </motion.p>
        )}
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: EASE_PREMIUM }}
            className={cn('mt-9 flex flex-col gap-3 sm:flex-row', align === 'center' && 'justify-center')}
          >
            {actions}
          </motion.div>
        )}
        {children}
      </div>
      {scene && <div className="relative mt-8 h-[min(52svh,460px)] w-full">{scene}</div>}
    </section>
  )
}
