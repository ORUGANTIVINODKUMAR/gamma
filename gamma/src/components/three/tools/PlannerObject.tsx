import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { roundedBox } from '@/lib/three/geometry'
import { read } from '@/lib/three/input'
import { damp, easeInOut } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import { Document } from '../models/Document'
import { Globe } from '../models/Globe'
import { FinancialBlocks } from '../models/FinancialBlocks'
import { Label3D } from '../models/Label'
import { TaxFolder } from '../models/Folder'
import type { ToolObjectProps } from './MutualFundObject'

const PIECES = [
  { from: [-2.6, 2.4, 1.2], delay: 0 },
  { from: [-1.4, 2.8, -0.8], delay: 0.1 },
  { from: [0.2, 2.6, -1.2], delay: 0.2 },
  { from: [2.4, 2.2, 0.6], delay: 0.3 },
  { from: [1.6, 3, 1.6], delay: 0.4 },
]

/**
 * Tax Planner — a planning desk. A pearl board carries year markers, filing
 * folders, a plan sheet and strategy blocks, which drop in and lock together as
 * `progress` rises. Self-contained so the planner can be swapped for another
 * company's planner without touching other tools.
 */
export function PlannerObject({ progress = 0, ...group }: ToolObjectProps) {
  const m = getMaterials()
  const refs = useRef<(Group | null)[]>([])
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(progress) : damp(p.current, read(progress), 3, dt)
    refs.current.forEach((g, i) => {
      if (!g) return
      const piece = PIECES[i]!
      const t = easeInOut(Math.min(1, Math.max(0, (p.current - piece.delay) / 0.62)))
      g.position.set(piece.from[0]! * (1 - t), piece.from[1]! * (1 - t), piece.from[2]! * (1 - t))
      g.rotation.set((1 - t) * 0.6, (1 - t) * (i % 2 ? 0.8 : -0.8), 0)
    })
  })

  const slot = (i: number) => (g: Group | null) => {
    refs.current[i] = g
  }

  return (
    <group {...group}>
      <mesh geometry={roundedBox(3.5, 0.14, 2.3, 0.05, 2)} material={m.pearl} position={[0, 0.07, 0]} />
      <mesh geometry={roundedBox(3.56, 0.03, 2.36, 0.02, 1)} material={m.silver} position={[0, 0.005, 0]} />

      {/* year markers */}
      <group ref={slot(0)}>
        <group position={[-1.2, 0.14, -0.78]}>
          <mesh geometry={roundedBox(0.8, 0.42, 0.1, 0.04)} material={m.sapphire} position={[0, 0.21, 0]} />
          <Label3D text="2025" height={0.2} size={60} weight={800} color="#ffffff" position={[0, 0.22, 0.056]} />
        </group>
        <group position={[-0.25, 0.14, -0.78]}>
          <mesh geometry={roundedBox(0.8, 0.42, 0.1, 0.04)} material={m.pearl} position={[0, 0.21, 0]} />
          <Label3D text="2026" height={0.2} size={60} weight={800} color="#1e3a8a" position={[0, 0.22, 0.056]} />
        </group>
      </group>

      {/* filing folders */}
      <group ref={slot(1)}>
        <TaxFolder position={[-1.2, 0.95, 0.2]} width={0.9} height={1.2} rotation={[-0.08, 0.5, 0]} tone="sapphire" kind="plan" />
      </group>
      <group ref={slot(2)}>
        <TaxFolder position={[-0.45, 0.95, 0.3]} width={0.9} height={1.2} rotation={[-0.08, 0.2, 0]} tone="silver" kind="schedD" />
      </group>

      {/* plan sheet */}
      <group ref={slot(3)}>
        <Document kind="plan" position={[0.5, 1.2, -0.3]} rotation={[-0.12, -0.3, 0.04]} scale={0.8} />
      </group>

      {/* the planner's globe: every strategy, anywhere in the year */}
      <Globe position={[0.1, 3.15, -0.2]} radius={0.98} />

      {/* strategy blocks */}
      <group ref={slot(4)}>
        <FinancialBlocks position={[1.25, 0.14, 0.5]} scale={0.46} rise={progress} />
      </group>
    </group>
  )
}
