import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { roundedBox } from '@/lib/three/geometry'
import { read, type Driver } from '@/lib/three/input'
import { damp, easeInOut } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import { Label3D } from './Label'
import type { GroupProps } from './Document'

export type EntityKind = 'schedC' | 'sCorp'

export interface EntityStructureProps extends GroupProps {
  kind: EntityKind
  /** 0 = tax slabs still in the air, 1 = slabs settled onto the structure. */
  fill?: Driver
  /**
   * Size of each tax component, 0–1 on a scale shared by both structures (so equal
   * amounts are equally thick). Schedule C: [income tax, SE tax, …].
   * S corporation: [payroll tax, income tax, …]. Each is drawn as a slab whose
   * thickness is proportional to its value, so differences read spatially.
   */
  weights?: number[]
  /** Overall scale of slab thickness per unit weight. */
  slabScale?: number
}

interface Block {
  x: number
  w: number
  h: number
  mat: 'pearl' | 'ceramic'
  label: string
}

const BLOCKS: Record<EntityKind, Block[]> = {
  schedC: [{ x: 0, w: 1.7, h: 1.0, mat: 'pearl', label: 'Schedule C' }],
  sCorp: [
    { x: -0.62, w: 0.95, h: 1.3, mat: 'pearl', label: 'Wages' },
    { x: 0.64, w: 0.95, h: 0.8, mat: 'ceramic', label: 'Profit' },
  ],
}

const SLAB_MATS = ['sapphire', 'sapphireDeep', 'silver'] as const
const DEPTH = 1.1

/**
 * A business structure with its tax components stacked on top as slabs.
 * Schedule C is one solid block (owner and business are the same taxpayer);
 * the S corporation is two separated blocks — wages and distributions — joined
 * by a bridge. Slab thickness is the tax amount, so the comparison is spatial.
 */
export function EntityStructure({ kind, fill = 1, weights = [1, 0.8, 0.3], slabScale = 1.1, ...group }: EntityStructureProps) {
  const m = getMaterials()
  const refs = useRef<(Group | null)[]>([])
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()
  const blocks = BLOCKS[kind]

  // Slab layout: each weight lands on a block; stacks grow upward.
  const stack = blocks.map(() => 0)
  const slabs = weights.map((w, i) => {
    const bi = kind === 'schedC' ? 0 : Math.min(blocks.length - 1, i === 0 ? 0 : 1)
    const thickness = Math.max(0.05, w * slabScale * 0.9)
    const y = blocks[bi]!.h + stack[bi]! + thickness / 2
    stack[bi]! += thickness + 0.025
    return { bi, thickness, y, i }
  })

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(fill, 1) : damp(p.current, read(fill, 1), 3, dt)
    refs.current.forEach((g, i) => {
      if (!g) return
      const t = easeInOut(Math.min(1, Math.max(0, (p.current - i * 0.12) / 0.7)))
      g.position.y = slabs[i]!.y + 2.4 * (1 - t)
      g.position.x = blocks[slabs[i]!.bi]!.x + (kind === 'schedC' ? 1 : -1) * 1.2 * (1 - t)
    })
  })

  const width = kind === 'schedC' ? 2.5 : 3.1
  return (
    <group {...group}>
      <mesh geometry={roundedBox(width, 0.08, DEPTH + 0.5, 0.03)} material={m.silver} position={[0, -0.04, 0]} />
      {blocks.map((b, bi) => (
        <group key={b.label} position={[b.x, 0, 0]}>
          <mesh geometry={roundedBox(b.w, b.h, DEPTH, 0.07, 2)} material={m[b.mat]} position={[0, b.h / 2, 0]} />
          <Label3D text={b.label} height={0.17} size={60} weight={700} color="#334155" position={[0, b.h * 0.42, DEPTH / 2 + 0.005]} />
          {bi === 0 && kind === 'sCorp' && <mesh geometry={roundedBox(0.34, 0.07, 0.34, 0.02)} material={m.silver} position={[0.63, 0.5, 0]} />}
        </group>
      ))}
      {slabs.map((s, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g
          }}
          position={[blocks[s.bi]!.x, s.y, 0]}
        >
          <mesh geometry={roundedBox(blocks[s.bi]!.w * 0.96, s.thickness, DEPTH * 0.96, 0.025, 2)} material={m[SLAB_MATS[i % SLAB_MATS.length]!]} />
        </group>
      ))}
    </group>
  )
}
