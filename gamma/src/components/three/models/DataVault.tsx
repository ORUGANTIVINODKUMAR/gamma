import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { cylinder, roundedBox } from '@/lib/three/geometry'
import { read, type Driver } from '@/lib/three/input'
import { damp } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import { Document, type GroupProps } from './Document'

/**
 * A pearl filing vault with three drawers and a silver dial. `open` slides the
 * top drawer out and lifts the documents inside — the "documents" and
 * "secure access" idea in one object.
 */
export function DataVault({ open = 0, ...group }: GroupProps & { open?: Driver }) {
  const m = getMaterials()
  const drawer = useRef<Group>(null)
  const papers = useRef<Group>(null)
  const dial = useRef<Group>(null)
  const p = useRef(0)
  const { reduceMotion } = useSceneQuality()

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(open) : damp(p.current, read(open), 3.2, dt)
    if (drawer.current) drawer.current.position.z = 0.72 + p.current * 0.62
    if (papers.current) papers.current.position.y = 0.05 + p.current * 0.55
    if (dial.current) dial.current.rotation.z = -p.current * Math.PI * 1.5
  })

  return (
    <group {...group}>
      <mesh geometry={roundedBox(2.3, 2.7, 1.5, 0.12, 3)} material={m.pearl} position={[0, 1.35, 0]} />
      {/* top drawer — slides out */}
      <group ref={drawer} position={[0, 2.12, 0.72]}>
        <mesh geometry={roundedBox(2.0, 0.78, 0.1, 0.05)} material={m.ceramic} />
        <mesh geometry={roundedBox(0.7, 0.07, 0.07, 0.03)} material={m.silver} position={[0, 0, 0.08]} />
        <mesh geometry={roundedBox(0.34, 0.12, 0.02, 0.02)} material={m.sapphire} position={[0, 0.22, 0.06]} />
        <group ref={papers} position={[0, 0.05, -0.4]}>
          <Document kind="f1040" scale={0.62} position={[-0.38, 0.55, 0]} rotation={[0, 0, 0.05]} />
          <Document kind="report" scale={0.62} position={[0.38, 0.5, -0.04]} rotation={[0, 0, -0.07]} />
        </group>
      </group>
      {/* lower drawers */}
      {[1.3, 0.48].map((y, i) => (
        <group key={y} position={[0, y, 0.74]}>
          <mesh geometry={roundedBox(2.0, 0.7, 0.1, 0.05)} material={m.ceramic} />
          <mesh geometry={roundedBox(0.7, 0.07, 0.07, 0.03)} material={m.silver} position={[0, 0, 0.08]} />
          <mesh geometry={roundedBox(0.34, 0.12, 0.02, 0.02)} material={i === 0 ? m.silver : m.sapphire} position={[0, 0.2, 0.06]} />
        </group>
      ))}
      {/* the dial */}
      <group position={[0.75, 2.45, 0.77]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={cylinder(0.2, 0.2, 0.06, 40)} material={m.silver} />
        <group ref={dial} position={[0, 0.035, 0]} rotation={[0, 0, 0]}>
          <mesh geometry={cylinder(0.12, 0.12, 0.03, 32)} material={m.sapphire} />
          <mesh geometry={roundedBox(0.04, 0.02, 0.18, 0.01)} material={m.pearl} position={[0, 0.02, 0.06]} />
        </group>
      </group>
      <mesh geometry={roundedBox(2.5, 0.1, 1.7, 0.04)} material={m.silver} position={[0, 0.02, 0]} />
    </group>
  )
}
