import { useMemo } from 'react'
import { MeshBasicMaterial } from 'three'
import { cylinder, unitPlane } from '@/lib/three/geometry'
import { getMaterials } from '@/lib/three/materials'
import { blobTexture } from '@/lib/three/textures'
import type { GroupProps } from './Document'

/** Low round pedestal: pearl disc with a silver bezel. Gives each object a place to stand. */
export function Plinth({ radius = 1.35, height = 0.16, ...group }: GroupProps & { radius?: number; height?: number }) {
  const m = getMaterials()
  return (
    <group {...group}>
      <mesh geometry={cylinder(radius, radius * 1.02, height, 64)} material={m.pearl} position={[0, -height / 2, 0]} />
      <mesh geometry={cylinder(radius * 1.03, radius * 1.03, 0.025, 64)} material={m.silver} position={[0, -height + 0.012, 0]} />
    </group>
  )
}

/** Cheap grounding shadow for low-quality devices: a soft dark disc lying on the floor. */
export function BlobShadow({ size = 3, opacity = 0.5, ...group }: GroupProps & { size?: number; opacity?: number }) {
  const mat = useMemo(() => new MeshBasicMaterial({ map: blobTexture(), transparent: true, opacity, depthWrite: false, toneMapped: false }), [opacity])
  return (
    <group {...group}>
      <mesh geometry={unitPlane()} material={mat} rotation={[-Math.PI / 2, 0, 0]} scale={[size, size, 1]} />
    </group>
  )
}
