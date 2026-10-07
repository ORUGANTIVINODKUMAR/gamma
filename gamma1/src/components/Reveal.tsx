import { motion } from 'framer-motion'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { EASE } from '../data/tools'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'p' | 'span' | 'li' | 'h2' | 'h3'
}

/** Fade + rise entrance when the element scrolls into view. */
export function Reveal({ children, delay = 0, y = 28, className, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion()
  const Tag = motion[as] as typeof motion.div
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: reduced ? 0.01 : 1.1, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

interface SplitProps {
  lines: ReactNode[][]
  className?: string
  delay?: number
  inView?: boolean
  stagger?: number
}

/** Masked word-by-word headline reveal. `lines` is an array of lines, each an array of words/nodes. */
export function SplitReveal({ lines, className, delay = 0, inView = false, stagger = 0.07 }: SplitProps) {
  const reduced = useReducedMotion()
  let n = 0
  const trigger = inView
    ? { whileInView: { y: '0%' }, viewport: { once: true, margin: '0px 0px -10% 0px' } }
    : { animate: { y: '0%' } }
  return (
    <span className={className}>
      {lines.map((line, li) => (
        <span className="split-line" key={li}>
          {line.map((word, wi) => {
            const i = n++
            return (
              <Fragment key={wi}>
                <span className="split-mask">
                  <motion.span
                    className="split-word"
                    initial={{ y: reduced ? '0%' : '112%' }}
                    {...trigger}
                    transition={{ duration: reduced ? 0.01 : 1.2, delay: delay + i * stagger, ease: EASE }}
                  >
                    {word}
                  </motion.span>
                </span>
                {wi < line.length - 1 ? ' ' : ''}
              </Fragment>
            )
          })}
        </span>
      ))}
    </span>
  )
}
