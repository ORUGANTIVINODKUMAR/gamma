import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { roundedBox } from '@/lib/three/geometry'
import { read, type Driver } from '@/lib/three/input'
import { damp } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import type { FormKind } from '@/lib/three/textures'
import { useSceneQuality } from '@/lib/three/quality'
import { Document, type GroupProps } from './Document'

export interface FolderProps extends GroupProps {
  /** 0 = closed, 1 = open with its sheet lifted out. */
  open?: Driver
  width?: number
  height?: number
  /** Sheet kept inside the folder. */
  kind?: FormKind
  tone?: 'sapphire' | 'pearl' | 'silver'
}

/** A filing folder: back panel, index tab, and a front flap that hinges open. */
export function TaxFolder({ open = 0, width = 1.7, height = 2.1, kind = 'report', tone = 'pearl', ...group }: FolderProps) {
  const m = getMaterials()
  const flap = useRef<Group>(null)
  const sheet = useRef<Group>(null)
  const p = useRef(0)
  const sheetScale = Math.min(width / 1.7, height / 2.1) * 0.9
  const { reduceMotion } = useSceneQuality()
  const body = tone === 'sapphire' ? m.sapphire : tone === 'silver' ? m.silver : m.pearl
  const tab = tone === 'sapphire' ? m.pearl : m.sapphire

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(open) : damp(p.current, read(open), 4.5, dt)
    if (flap.current) flap.current.rotation.x = -p.current * 1.15
    if (sheet.current) {
      sheet.current.position.y = height * 0.08 + p.current * height * 0.32
      sheet.current.position.z = 0.06 + p.current * 0.22
    }
  })

  return (
    <group {...group}>
      {/* back panel + tab */}
      <mesh geometry={roundedBox(width, height, 0.05, 0.03)} material={body} position={[0, 0, -0.03]} />
      <mesh geometry={roundedBox(width * 0.34, 0.2, 0.05, 0.04)} material={tab} position={[-width * 0.28, height / 2 + 0.07, -0.03]} />
      {/* the sheet inside */}
      <group ref={sheet} position={[0, height * 0.08, 0.06]} scale={sheetScale}>
        <Document kind={kind} />
      </group>
      {/* front flap — hinged at its bottom edge */}
      <group position={[0, -height / 2, 0.05]} ref={flap}>
        <mesh geometry={roundedBox(width, height * 0.72, 0.045, 0.03)} material={body} position={[0, height * 0.36, 0]} />
        <mesh geometry={roundedBox(width * 0.5, 0.03, 0.05, 0.012)} material={m.silver} position={[0, height * 0.62, 0.03]} />
      </group>
    </group>
  )
}
