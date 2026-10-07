import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { damp } from '@/lib/three/math'
import { read, type Driver } from '@/lib/three/input'
import type { FormKind } from '@/lib/three/textures'
import { useSceneQuality } from '@/lib/three/quality'
import { Document, type GroupProps } from './Document'

export interface DocumentStackProps extends GroupProps {
  kinds?: FormKind[]
  /** 0 = neat stack, 1 = fanned open. */
  spread?: Driver
  scale?: number
}

/** A stack of printed forms that fans open as `spread` rises. */
export function DocumentStack({ kinds = ['schedD', 'f1099', 'f1040'], spread = 0, ...group }: DocumentStackProps) {
  const refs = useRef<(Group | null)[]>([])
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()
  const n = kinds.length
  const mid = (n - 1) / 2

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(spread) : damp(p.current, read(spread), 4, dt)
    const s = p.current
    refs.current.forEach((g, i) => {
      if (!g) return
      const o = i - mid
      g.position.set(o * s * 0.62, Math.abs(o) * -s * 0.05 + i * 0.012, i * 0.05 * (1 - s * 0.4))
      g.rotation.z = -o * s * 0.17
      g.rotation.y = o * s * 0.05
    })
  })

  return (
    <group {...group}>
      {kinds.map((k, i) => (
        <group
          key={`${k}-${i}`}
          ref={(g) => {
            refs.current[i] = g
          }}
        >
          <Document kind={k}/>
        </group>
      ))}
    </group>
  )
}
