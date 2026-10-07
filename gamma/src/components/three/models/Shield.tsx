import { checkGeometry, shieldGeometry } from '@/lib/three/geometry'
import { getMaterials } from '@/lib/three/materials'
import type { GroupProps } from './Document'

/** Pearl shield with a silver rim, sapphire inlay and a check — the audit-protection mark. */
export function Shield({ scale = 1, ...group }: GroupProps & { scale?: number }) {
  const m = getMaterials()
  return (
    <group {...group} scale={scale}>
      <mesh geometry={shieldGeometry(1, 0.16, 0.05)} material={m.silver} />
      <mesh geometry={shieldGeometry(0.88, 0.2, 0.04)} material={m.pearl} position={[0, 0, 0.02]} />
      <mesh geometry={shieldGeometry(0.64, 0.2, 0.03)} material={m.sapphire} position={[0, 0, 0.06]} />
      <mesh geometry={checkGeometry()} material={m.pearl} position={[0, 0.02, 0.27]} scale={0.95} />
    </group>
  )
}
