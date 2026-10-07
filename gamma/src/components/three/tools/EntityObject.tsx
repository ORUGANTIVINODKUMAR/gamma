import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { read } from '@/lib/three/input'
import { damp } from '@/lib/three/math'
import { useSceneQuality } from '@/lib/three/quality'
import { EntityStructure } from '../models/EntityStructure'
import type { ToolObjectProps } from './MutualFundObject'

export interface EntityObjectProps extends ToolObjectProps {
  /** Tax components for each structure, e.g. [income tax, SE/payroll tax, …]. */
  schedC?: number[]
  sCorp?: number[]
}

/**
 * Entity Comparison — Schedule C on the left, S corporation on the right.
 * At rest they stand close together; as `progress` rises they physically
 * separate and each structure's tax slabs settle onto it.
 */
export function EntityObject({ progress = 0, schedC = [1, 0.95, 0.15], sCorp = [0.5, 0.95, 0.2], ...group }: EntityObjectProps) {
  // one scale for both structures, so slab thickness compares directly
  const peak = Math.max(...schedC, ...sCorp, 0.0001)
  const left = useRef<Group>(null)
  const right = useRef<Group>(null)
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()
  useFrame((_, dt) => {
    p.current = reduceMotion ? read(progress) : damp(p.current, read(progress), 3.2, dt)
    const gap = 1.55 + p.current * 0.55
    if (left.current) left.current.position.x = -gap
    if (right.current) right.current.position.x = gap
  })
  return (
    <group {...group}>
      <group ref={left} scale={0.78}>
        <EntityStructure kind="schedC" fill={progress} weights={schedC.map((w) => w / peak)} />
      </group>
      <group ref={right} scale={0.78}>
        <EntityStructure kind="sCorp" fill={progress} weights={sCorp.map((w) => w / peak)} />
      </group>
    </group>
  )
}
