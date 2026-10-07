import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { roundedBox } from '@/lib/three/geometry'
import { read, type Driver } from '@/lib/three/input'
import { damp, easeInOut } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import type { GroupProps } from './Document'

/** The Tapreco mark rebuilt in 3D from its SVG geometry (40 × 40 grid → 4 × 4 units). */
const U = 0.1
const part = (x: number, y: number, w: number, h: number) => ({ w: w * U, h: h * U, x: (x + w / 2 - 20) * U, y: -(y + h / 2 - 20) * U })

const PARTS = [
  { ...part(10, 11, 20, 4.5), mat: 'pearl' as const, from: [-2.4, 2.2, 1.6] },
  { ...part(17.75, 15.5, 4.5, 14.5), mat: 'pearl' as const, from: [0.4, -2.6, 2.2] },
  { ...part(10, 23.5, 3.75, 6.5), mat: 'silver' as const, from: [-2.8, -1.4, 1.2] },
  { ...part(26.25, 19.5, 3.75, 10.5), mat: 'silver' as const, from: [2.6, -0.8, 1.8] },
]

/**
 * Plate + four parts. `assemble` 0 → 1 flies the parts in from where the five
 * tool objects were and locks them onto the sapphire plate.
 */
export function TaxLogo3D({ assemble = 1, ...group }: GroupProps & { assemble?: Driver }) {
  const m = getMaterials()
  const refs = useRef<(Group | null)[]>([])
  const plate = useRef<Group>(null)
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(assemble, 1) : damp(p.current, read(assemble, 1), 3.4, dt)
    refs.current.forEach((g, i) => {
      if (!g) return
      const t = easeInOut(Math.min(1, Math.max(0, (p.current - i * 0.08) / 0.7)))
      const def = PARTS[i]!
      g.position.set(def.x + def.from[0]! * (1 - t), def.y + def.from[1]! * (1 - t), 0.2 + 0.14 + def.from[2]! * (1 - t))
      g.rotation.set((1 - t) * 0.9 * (i % 2 ? 1 : -1), (1 - t) * 0.7, (1 - t) * 0.5 * (i % 2 ? -1 : 1))
    })
    if (plate.current) {
      const t = easeInOut(Math.min(1, p.current * 1.4))
      plate.current.scale.setScalar(0.6 + 0.4 * t)
    }
  })

  return (
    <group {...group}>
      <group ref={plate}>
        <mesh geometry={roundedBox(4, 4, 0.4, 0.38, 4)} material={m.sapphire} />
      </group>
      {PARTS.map((pt, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g
          }}
        >
          <mesh geometry={roundedBox(pt.w, pt.h, 0.16, 0.06, 2)} material={m[pt.mat]} />
        </group>
      ))}
    </group>
  )
}
