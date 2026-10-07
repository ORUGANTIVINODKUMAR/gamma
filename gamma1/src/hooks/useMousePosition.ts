import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from './useReducedMotion'

/**
 * Normalised pointer position (-1..1, y up) stored in a ref so that
 * consumers (e.g. r3f useFrame loops) never trigger React re-renders.
 */
export function useMousePosition() {
  const pos = useRef({ x: 0, y: 0 })
  const fine = useFinePointer()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!fine || reduced) {
      pos.current.x = 0
      pos.current.y = 0
      return
    }
    const onMove = (e: PointerEvent) => {
      pos.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pos.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [fine, reduced])

  return pos
}
