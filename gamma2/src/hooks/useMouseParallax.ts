import { useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { PointerEvent } from 'react'
import { hoverSpring } from '../animations/motion'

export function useMouseParallax(maxTilt = 3) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(x, hoverSpring)
  const rotateY = useSpring(y, hoverSpring)
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(-((event.clientY - rect.top) / rect.height - 0.5) * maxTilt * 2)
    y.set(((event.clientX - rect.left) / rect.width - 0.5) * maxTilt * 2)
  }
  const reset = () => { x.set(0); y.set(0) }
  return { style: { rotateX, rotateY, transformPerspective: 1100 }, onPointerMove, onPointerLeave: reset, onBlur: reset }
}
