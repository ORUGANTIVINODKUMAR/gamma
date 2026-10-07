import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'
import { roundedBox } from '@/lib/three/geometry'
import { read, type Driver } from '@/lib/three/input'
import { damp, easeOut } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import type { GroupProps } from './Document'

const GRID = [
  { x: -0.7, z: -0.7, h: 0.5, m: 'pearl' },
  { x: 0, z: -0.7, h: 0.95, m: 'silver' },
  { x: 0.7, z: -0.7, h: 0.35, m: 'pearl' },
  { x: -0.7, z: 0, h: 1.1, m: 'pearl' },
  { x: 0, z: 0, h: 0.6, m: 'sapphire' },
  { x: 0.7, z: 0, h: 0.8, m: 'ceramic' },
  { x: -0.7, z: 0.7, h: 0.4, m: 'ceramic' },
  { x: 0, z: 0.7, h: 0.75, m: 'pearl' },
  { x: 0.7, z: 0.7, h: 1.0, m: 'silver' },
] as const

/** Ledger blocks: a tight grid of beveled blocks that rise into place as `rise` goes 0 → 1. */
export function FinancialBlocks({ rise = 1, ...group }: GroupProps & { rise?: Driver }) {
  const m = getMaterials()
  const refs = useRef<(Mesh | null)[]>([])
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(rise, 1) : damp(p.current, read(rise, 1), 3.2, dt)
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const local = easeOut((p.current - i * 0.06) / 0.62)
      const h = GRID[i]!.h
      mesh.scale.y = Math.max(0.001, local)
      mesh.position.y = (h * local) / 2
    })
  })

  return (
    <group {...group}>
      {GRID.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          geometry={roundedBox(0.62, GRID[i]!.h, 0.62, 0.07, 2)}
          material={m[b.m]}
          position={[b.x, GRID[i]!.h / 2, b.z]}
        />
      ))}
    </group>
  )
}
