import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Reveal } from './Reveal'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
  as?: 'h1' | 'h2'
}

/**
 * Section title block. Wrap the emphasized phrase of `title` in
 * <Highlight>…</Highlight> to render it in italic accent.
 */
export function SectionHeading({ eyebrow, title, description, align = 'center', className, as = 'h2' }: SectionHeadingProps) {
  const Heading = as
  return (
    <div className={cn('flex flex-col gap-5', align === 'center' ? 'mx-auto max-w-3xl items-center text-center' : 'max-w-2xl', className)}>
      {eyebrow && (
        <Reveal>
          <span className="eyebrow inline-flex items-center gap-3">{eyebrow}</span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <Heading className={cn(as === 'h1' ? 't-h1' : 't-h2', 'text-fg')}>{title}</Heading>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p className="t-lead">{description}</p>
        </Reveal>
      )}
    </div>
  )
}

export function Highlight({ children }: { children: ReactNode }) {
  return <em className="text-accent-400">{children}</em>
}
