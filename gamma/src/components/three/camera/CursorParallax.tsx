import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { input } from '@/lib/three/input'
import { damp } from '@/lib/three/math'
import { useSceneQuality } from '@/lib/three/quality'

/**
 * Turns its children a few degrees toward the pointer — a quiet sense of depth,
 * never aggressive tracking. Disabled on touch devices and for reduced motion.
 */
export function CursorParallax({ children, strength = 0.12, lift = 0.05 }: { children: ReactNode; strength?: number; lift?: number }) {
  const ref = useRef<Group>(null)
  const { coarse, reduceMotion } = useSceneQuality()
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const on = !coarse && !reduceMotion
    g.rotation.y = damp(g.rotation.y, on ? input.px * strength : 0, 2.6, dt)
    g.rotation.x = damp(g.rotation.x, on ? -input.py * strength * 0.6 : 0, 2.6, dt)
    g.position.y = damp(g.position.y, on ? input.py * lift : 0, 2.6, dt)
  })
  return <group ref={ref}>{children}</group>
}
