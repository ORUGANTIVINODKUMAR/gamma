import { useLayoutEffect, useRef } from 'react'
import { Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three'
import { cylinder } from '@/lib/three/geometry'
import { getMaterials } from '@/lib/three/materials'
import type { GroupProps } from './Document'

const STACKS: { x: number; z: number; n: number }[] = [
  { x: -0.55, z: 0.1, n: 6 },
  { x: 0.2, z: -0.25, n: 9 },
  { x: 0.62, z: 0.34, n: 4 },
]
const COIN_H = 0.09
const TOTAL = STACKS.reduce((s, k) => s + k.n, 0)

/** Three stacks of silver coins, instanced (one draw call), each capped with a sapphire inlay. */
export function CoinStack({ radius = 0.38, ...group }: GroupProps & { radius?: number }) {
  const m = getMaterials()
  const coins = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = coins.current
    if (!mesh) return
    const mat = new Matrix4()
    const q = new Quaternion()
    const one = new Vector3(1, 1, 1)
    let i = 0
    STACKS.forEach((s, si) => {
      for (let k = 0; k < s.n; k++) {
        // each coin sits a hair off-axis, like a hand-stacked pile
        const jx = Math.sin(si * 7 + k * 2.3) * 0.012
        const jz = Math.cos(si * 5 + k * 1.7) * 0.012
        mat.compose(new Vector3(s.x + jx, k * COIN_H + COIN_H / 2, s.z + jz), q, one)
        mesh.setMatrixAt(i++, mat)
      }
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group {...group}>
      <instancedMesh ref={coins} args={[cylinder(radius, radius, COIN_H * 0.96, 36), m.silver, TOTAL]} />
      {STACKS.map((s) => (
        <mesh key={`${s.x}`} geometry={cylinder(radius * 0.62, radius * 0.62, 0.012, 32)} material={m.sapphire} position={[s.x, s.n * COIN_H + 0.004, s.z]} />
      ))}
    </group>
  )
}
