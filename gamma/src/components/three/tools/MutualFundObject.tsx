import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { cylinder, paneEdges, roundedBox } from '@/lib/three/geometry'
import { read, type Driver } from '@/lib/three/input'
import { damp } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import { DOC_H, type GroupProps } from '../models/Document'
import { DocumentStack } from '../models/DocumentStack'

export interface ToolObjectProps extends GroupProps {
  /** 0 → 1 activation of the object's own animation. */
  progress?: Driver
}

/**
 * Mutual Fund Tax Calculator — layered fund statements (1099-DIV, Schedule D)
 * that fan open, two clear acrylic overlays for distribution layers, and a
 * silver certificate seal. Origin is the base centre; height ≈ 2.6.
 */
export function MutualFundObject({ progress = 0, ...group }: ToolObjectProps) {
  const m = getMaterials()
  const overlays = useRef<(Group | null)[]>([])
  const seal = useRef<Group>(null)
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(progress) : damp(p.current, read(progress), 3.5, dt)
    overlays.current.forEach((g, i) => {
      if (!g) return
      g.position.z = 0.14 + (i + 1) * 0.12 + p.current * (i + 1) * 0.26
      g.position.y = DOC_H / 2 + 0.3 + p.current * (i + 1) * 0.1
      g.rotation.z = -p.current * (i + 1) * 0.06
    })
    if (seal.current) {
      seal.current.position.set(0.95 + p.current * 0.25, 0.46 + p.current * 0.1, 0.62)
      seal.current.rotation.y = p.current * 0.6
    }
  })

  return (
    <group {...group}>
      <group position={[0, DOC_H / 2 + 0.3, 0]} rotation={[0, -0.16, 0]}>
        <DocumentStack kinds={['schedD', 'f1099', 'f1099']} spread={progress} />
      </group>
      {[0, 1].map((i) => (
        <group
          key={i}
          ref={(g) => {
            overlays.current[i] = g
          }}
          rotation={[0, -0.16, 0]}
        >
          <mesh geometry={roundedBox(1.5, 1.96, 0.02, 0.02)} material={m.acrylic} />
          <lineSegments geometry={paneEdges(1.5, 1.96)} material={m.edge} />
        </group>
      ))}
      <group ref={seal} rotation={[Math.PI / 2 - 0.35, 0, 0]}>
        <mesh geometry={cylinder(0.32, 0.32, 0.07, 48)} material={m.silver} />
        <mesh geometry={cylinder(0.22, 0.22, 0.085, 48)} material={m.sapphire} />
        <mesh geometry={cylinder(0.1, 0.1, 0.095, 32)} material={m.pearl} />
      </group>
    </group>
  )
}
