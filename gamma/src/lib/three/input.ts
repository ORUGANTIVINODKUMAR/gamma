/**
 * Shared, mutable input state for every scene. Written by DOM listeners,
 * read inside useFrame — nothing here triggers a React render.
 */
export const input = {
  /** Raw pointer, -1..1 (y up). */
  px: 0,
  py: 0,
  /** Damped pointer, updated by whoever owns the frame loop. */
  x: 0,
  y: 0,
  /** Scroll position of the window in px. */
  scrollY: 0,
}

let listeners = 0
let onMove: ((e: PointerEvent) => void) | null = null
let onScroll: (() => void) | null = null

/** Reference-counted: the first scene attaches, the last one detaches. */
export function attachInput(): () => void {
  if (listeners++ === 0) {
    onMove = (e) => {
      if (e.pointerType === 'touch') return
      input.px = (e.clientX / window.innerWidth) * 2 - 1
      input.py = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    onScroll = () => {
      input.scrollY = window.scrollY
    }
    onScroll()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
  }
  return () => {
    if (--listeners === 0 && onMove && onScroll) {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      onMove = onScroll = null
    }
  }
}

/** A value a scene can read each frame: a literal or a ref-like box. */
export type Driver = number | { current: number }
export const read = (d: Driver | undefined, fallback = 0): number => (d === undefined ? fallback : typeof d === 'number' ? d : d.current)
