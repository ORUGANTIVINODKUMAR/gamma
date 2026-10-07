import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import type { GroupProps } from './Document'

/** Lat/long lattice as line segments. */
function lattice(radius: number, lats: number, longs: number, seg = 64) {
  const pos: number[] = []
  for (let i = 1; i < lats; i++) {
    const phi = (i / lats) * Math.PI
    const y = Math.cos(phi) * radius
    const r = Math.sin(phi) * radius
    for (let s = 0; s < seg; s++) {
      const a0 = (s / seg) * Math.PI * 2
      const a1 = ((s + 1) / seg) * Math.PI * 2
      pos.push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r)
    }
  }
  for (let j = 0; j < longs; j++) {
    const t = (j / longs) * Math.PI * 2
    for (let s = 0; s < seg / 2; s++) {
      const p0 = (s / (seg / 2)) * Math.PI
      const p1 = ((s + 1) / (seg / 2)) * Math.PI
      pos.push(
        Math.sin(p0) * Math.cos(t) * radius, Math.cos(p0) * radius, Math.sin(p0) * Math.sin(t) * radius,
        Math.sin(p1) * Math.cos(t) * radius, Math.cos(p1) * radius, Math.sin(p1) * Math.sin(t) * radius,
      )
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  return g
}

const NODES = 36

/**
 * A slowly rotating sapphire globe: glossy core, light lattice, instanced data
 * nodes on the surface and two tilted silver orbit rings that counter-rotate.
 */
export function Globe({ radius = 0.8, ...group }: GroupProps & { radius?: number }) {
  const m = getMaterials()
  const { reduceMotion, quality } = useSceneQuality()
  const spin = useRef<THREE.Group>(null)
  const ringA = useRef<THREE.Group>(null)
  const ringB = useRef<THREE.Group>(null)
  const nodes = useRef<THREE.InstancedMesh>(null)
  const grid = useMemo(() => lattice(radius * 1.004, 9, 14), [radius])
  const gridMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#cfe0ff', transparent: true, opacity: 0.55 }), [])
  const nodeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), [])
  useLayoutEffect(
    () => () => {
      grid.dispose()
      gridMat.dispose()
      nodeMat.dispose()
    },
    [grid, gridMat, nodeMat],
  )

  useLayoutEffect(() => {
    const mesh = nodes.current
    if (!mesh) return
    const mat = new THREE.Matrix4()
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < NODES; i++) {
      const y = 1 - (i / (NODES - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const t = golden * i
      mat.makeTranslation(Math.cos(t) * r * radius * 1.01, y * radius * 1.01, Math.sin(t) * r * radius * 1.01)
      mesh.setMatrixAt(i, mat)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [radius])

  useFrame((_, dt) => {
    if (reduceMotion) return
    if (spin.current) spin.current.rotation.y += dt * 0.35
    if (ringA.current) ringA.current.rotation.z += dt * 0.18
    if (ringB.current) ringB.current.rotation.z -= dt * 0.12
  })

  const seg = quality === 'high' ? 64 : 32
  return (
    <group {...group}>
      <group ref={spin}>
        <mesh material={m.sapphire}>
          <sphereGeometry args={[radius, seg, seg]} />
        </mesh>
        <lineSegments geometry={grid} material={gridMat} />
        <instancedMesh ref={nodes} args={[undefined, nodeMat, NODES]}>
          <sphereGeometry args={[radius * 0.028, 8, 8]} />
        </instancedMesh>
      </group>
      <group rotation={[1.15, 0, 0.3]}>
        <group ref={ringA}>
          <mesh material={m.silver}>
            <torusGeometry args={[radius * 1.38, radius * 0.018, 12, 96]} />
          </mesh>
        </group>
      </group>
      <group rotation={[0.45, 0, -0.6]}>
        <group ref={ringB}>
          <mesh material={m.silver}>
            <torusGeometry args={[radius * 1.62, radius * 0.012, 12, 96]} />
          </mesh>
          <mesh position={[radius * 1.62, 0, 0]} material={m.pearl}>
            <sphereGeometry args={[radius * 0.07, 16, 16]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

