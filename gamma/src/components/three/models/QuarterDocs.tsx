import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { roundedBox } from '@/lib/three/geometry'
import { read, type Driver } from '@/lib/three/input'
import { damp, easeInOut } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import { quarterTexture } from '@/lib/three/textures'
import { Document, DOC_H, type GroupProps } from './Document'

/** 1040-ES due dates. Calendar facts, not user data. */
const DUE = ['Apr 15', 'Jun 15', 'Sep 15', 'Jan 15'] as const
const SCATTER = [
  { x: -2.4, y: 1.6, z: 1.4, ry: 0.9, rz: 0.5 },
  { x: -0.6, y: -1.8, z: 2.2, ry: -0.7, rz: -0.4 },
  { x: 1.0, y: 2.1, z: 1.6, ry: 0.6, rz: 0.35 },
  { x: 2.6, y: -1.4, z: 2.0, ry: -0.9, rz: -0.5 },
]

export interface QuarterDocsProps extends GroupProps {
  /** 0 = scattered in the air, 1 = four sheets standing in a row. */
  assemble?: Driver
  /** Per-quarter emphasis 0..1 — raises that sheet a little when payments differ. */
  lift?: number[]
  /** Horizontal spacing between sheets. */
  gap?: number
  sheetScale?: number
}

/** Four quarterly payment sheets (Q1–Q4) that assemble into an ordered row on a silver rail. */
export function QuarterDocs({ assemble = 1, lift, gap = 1.28, sheetScale = 0.82, ...group }: QuarterDocsProps) {
  const m = getMaterials()
  const refs = useRef<(Group | null)[]>([])
  const p = useRef(0)
  const liftNow = useRef([0, 0, 0, 0])
  const { reduceMotion } = useSceneQuality()
  const tex = useMemo(() => DUE.map((d, i) => quarterTexture((i + 1) as 1 | 2 | 3 | 4, d)), [])

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(assemble, 1) : damp(p.current, read(assemble, 1), 3.2, dt)
    refs.current.forEach((g, i) => {
      if (!g) return
      const t = easeInOut(Math.min(1, Math.max(0, (p.current - i * 0.09) / 0.7)))
      const sc = SCATTER[i]!
      const target = lift?.[i] ?? 0
      liftNow.current[i] = reduceMotion ? target : damp(liftNow.current[i]!, target, 5, dt)
      const home = (i - 1.5) * gap
      g.position.set(home + sc.x * (1 - t), DOC_H * sheetScale * 0.5 + 0.12 + liftNow.current[i]! * 0.34 + sc.y * (1 - t), sc.z * (1 - t))
      g.rotation.set(0, sc.ry * (1 - t) + (i - 1.5) * -0.07 * t, sc.rz * (1 - t))
    })
  })

  return (
    <group {...group}>
      {tex.map((t, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g
          }}
          scale={sheetScale}
        >
          <Document texture={t} textureKey={`q${i}`} />
        </group>
      ))}
      <mesh geometry={roundedBox(gap * 4 + 0.2, 0.08, 0.34, 0.03)} material={m.silver} position={[0, 0.04, 0.05]} />
    </group>
  )
}
