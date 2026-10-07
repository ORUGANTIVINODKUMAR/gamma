import { useLayoutEffect, useRef } from 'react'
import { Color, Matrix4, type InstancedMesh } from 'three'
import { roundedBox } from '@/lib/three/geometry'
import { getMaterials } from '@/lib/three/materials'
import { Label3D } from './Label'
import type { GroupProps } from './Document'

const COLS = 4
const ROWS = 4
const KEY_COLORS = ['#f1eee8', '#dfe4ea', '#2563eb']

/** Pearl calculator: ink display, 16 instanced keys, one sapphire "equals" key. */
export function Calculator({ display = 'TAX', ...group }: GroupProps & { display?: string }) {
  const m = getMaterials()
  const keys = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = keys.current
    if (!mesh) return
    const mat = new Matrix4()
    const c = new Color()
    let i = 0
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        mat.makeTranslation((col - (COLS - 1) / 2) * 0.34, -0.34 - r * 0.31, 0.2)
        mesh.setMatrixAt(i, mat)
        const last = col === COLS - 1 && r === ROWS - 1
        c.set(last ? KEY_COLORS[2]! : col === COLS - 1 ? KEY_COLORS[1]! : KEY_COLORS[0]!)
        mesh.setColorAt(i, c)
        i++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [])

  return (
    <group {...group}>
      <mesh geometry={roundedBox(1.62, 2.3, 0.36, 0.14, 3)} material={m.pearl} />
      <mesh geometry={roundedBox(1.62 - 0.2, 0.22, 0.02, 0.01)} material={m.silver} position={[0, 0.96, 0.18]} />
      <mesh geometry={roundedBox(1.3, 0.52, 0.05, 0.06, 2)} material={m.ink} position={[0, 0.62, 0.19]} />
      <Label3D text={display} height={0.2} color="#9fc0ff" size={72} weight={800} position={[0.28, 0.62, 0.222]} />
      <instancedMesh ref={keys} args={[roundedBox(0.3, 0.25, 0.08, 0.05), m.ceramic, COLS * ROWS]} />
    </group>
  )
}
