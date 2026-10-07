import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useFinePointer, useReducedMotion } from '../hooks/useReducedMotion'
import { scrollToTarget } from '../lib/lenis'

interface Props {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'quiet'
  to?: string
  anchor?: string
  arrow?: boolean
  className?: string
  onClick?: () => void
}

/** Button with a subtle magnetic pull toward the cursor (desktop only). */
export default function MagneticButton({ children, variant = 'primary', to, anchor, arrow = true, className = '', onClick }: Props) {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 })
  const magnetic = fine && !reduced

  const move = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!magnetic) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  const leave = () => {
    x.set(0)
    y.set(0)
  }

  const cls = `btn btn-${variant} ${className}`
  const inner = (
    <>
      <span className="btn-label">{children}</span>
      {arrow && <ArrowRight className="btn-arrow" size={17} strokeWidth={1.8} aria-hidden="true" />}
    </>
  )
  const handleAnchor = (e: MouseEvent) => {
    if (anchor) {
      e.preventDefault()
      scrollToTarget(anchor)
    }
    onClick?.()
  }

  return (
    <motion.span className="btn-magnet" style={{ x, y }} onPointerMove={move} onPointerLeave={leave}>
      {to ? (
        <Link to={to} className={cls}>
          {inner}
        </Link>
      ) : (
        <a href={anchor ?? '#'} className={cls} onClick={handleAnchor}>
          {inner}
        </a>
      )}
    </motion.span>
  )
}
