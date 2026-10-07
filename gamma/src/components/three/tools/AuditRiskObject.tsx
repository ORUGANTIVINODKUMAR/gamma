import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { read, type Driver } from '@/lib/three/input'
import { damp, span } from '@/lib/three/math'
import { useSceneQuality } from '@/lib/three/quality'
import { DocumentScanner } from '../models/DocumentScanner'
import { Shield } from '../models/Shield'
import type { ToolObjectProps } from './MutualFundObject'

/**
 * Audit Risk Analyzer — a 1040 passes through a scanning arch and separates
 * into analysis layers; a shield settles in front once analysis completes.
 */
export function AuditRiskObject({ progress = 0, areas, emphasis, ...group }: ToolObjectProps & { areas?: string[]; emphasis?: number[] }) {
  const shield = useRef<Group>(null)
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()
  useFrame((_, dt) => {
    p.current = reduceMotion ? read(progress as Driver) : damp(p.current, read(progress as Driver), 3.4, dt)
    const s = span(p.current, 0.82, 1)
    if (shield.current) {
      shield.current.scale.setScalar(0.001 + s * 0.4)
      shield.current.position.set(1.55, 0.55 + (1 - s) * 0.8, 0.9)
      shield.current.rotation.y = (1 - s) * 1.2
    }
  })
  return (
    <group {...group}>
      <DocumentScanner position={[0, 1.55, 0]} progress={progress} areas={areas} emphasis={emphasis} />
      <group ref={shield}>
        <Shield />
      </group>
    </group>
  )
}
