import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_PREMIUM, fadeUp, revealViewport, staggerContainer } from '@/lib/motion'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  y?: number
}

/** Fades content up once as it scrolls into view. */
export function Reveal({ children, delay = 0, y = 24, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ duration: 0.65, ease: EASE_PREMIUM, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

interface GroupProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  stagger?: number
  delay?: number
}

/** Parent for staggered children (`RevealItem`). */
export function RevealGroup({ children, stagger = 0.08, delay = 0, ...rest }: GroupProps) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={revealViewport} variants={staggerContainer(stagger, delay)} {...rest}>
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, ...rest }: Omit<HTMLMotionProps<'div'>, 'children'> & { children: ReactNode }) {
  return (
    <motion.div variants={fadeUp} {...rest}>
      {children}
    </motion.div>
  )
}
