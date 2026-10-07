import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { usePreferences } from '@/context/PreferencesContext'
import { useFinePointer } from '@/hooks/useMediaQuery'

/**
 * Pulls its child a few pixels toward the pointer and springs back on leave.
 * Restrained on purpose (max ~6px), and a no-op on touch and for reduced motion.
 */
export function Magnetic({ children, strength = 0.22, block = false }: { children: ReactNode; strength?: number; block?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })
  const fine = useFinePointer()
  const { reduceMotion } = usePreferences()

  if (!fine || reduceMotion) return <>{children}</>

  return (
    <motion.span
      ref={ref}
      style={{ x: sx, y: sy, display: block ? 'block' : 'inline-flex' }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        x.set(Math.max(-6, Math.min(6, dx * strength)))
        y.set(Math.max(-5, Math.min(5, dy * strength)))
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
