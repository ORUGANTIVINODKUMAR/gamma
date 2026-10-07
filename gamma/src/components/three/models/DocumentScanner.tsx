import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { type Group, type Mesh, type MeshBasicMaterial, type MeshPhysicalMaterial } from 'three'
import { paneEdges, roundedBox, unitBox, unitPlane } from '@/lib/three/geometry'
import { read, type Driver } from '@/lib/three/input'
import { damp, smooth, span } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { PALETTE } from '@/lib/three/palette'
import { useSceneQuality } from '@/lib/three/quality'
import { formRowBand } from '@/lib/three/textures'
import { DOC_H, DOC_T, DOC_W, Document, type GroupProps } from './Document'
import { Label3D } from './Label'

export interface ScannerProps extends GroupProps {
  /** 0 → 1: document slides in, scan plane sweeps, document separates into layers. */
  progress?: Driver
  /** Layer names, top-to-bottom of the form. */
  areas?: string[]
  /** Per-layer emphasis 0..1: higher layers lift further and carry a denser pane. */
  emphasis?: number[]
}

const DEFAULT_LAYERS = ['Income', 'Deductions', 'Credits', 'Schedule C']
const SCAN_TOP = DOC_H / 2 + 0.12

/**
 * The audit-analysis stage. A Form 1040 slides into a silver scanning arch, a
 * translucent sapphire plane sweeps down it highlighting each section as it
 * passes, then the sheet separates into acrylic layers — one per area analysed.
 * Layers with more emphasis lift higher and carry denser, deeper-blue panes.
 */
export function DocumentScanner({ progress = 1, areas = DEFAULT_LAYERS, emphasis, ...group }: ScannerProps) {
  const m = getMaterials()
  const { reduceMotion } = useSceneQuality()
  const doc = useRef<Group>(null)
  const plane = useRef<Group>(null)
  const paneRefs = useRef<(Group | null)[]>([])
  const bandRefs = useRef<(Mesh | null)[]>([])
  const p = useRef(0)
  const n = areas.length

  const panes = useMemo(() => Array.from({ length: areas.length }, () => m.acrylic.clone() as MeshPhysicalMaterial), [areas.length, m])
  const bands = useMemo(() => Array.from({ length: areas.length }, () => m.scan.clone() as MeshBasicMaterial), [areas.length, m])
  useEffect(
    () => () => {
      panes.forEach((x) => x.dispose())
      bands.forEach((x) => x.dispose())
    },
    [panes, bands],
  )

  const rows = useMemo(
    () =>
      Array.from({ length: areas.length }, (_, i) => {
        const b = formRowBand(n, i)
        const top = (0.5 - b.top / b.height) * DOC_H
        const bottom = (0.5 - b.bottom / b.height) * DOC_H
        return { y: (top + bottom) / 2, h: top - bottom }
      }),
    [areas.length, n],
  )

  useFrame((_, dt) => {
    p.current = reduceMotion ? read(progress, 1) : damp(p.current, read(progress, 1), 3.4, dt)
    const t = p.current
    const slide = span(t, 0, 0.2)
    const scan = span(t, 0.2, 0.58)
    const sep = span(t, 0.6, 0.96)
    const scanY = SCAN_TOP - scan * (DOC_H + 0.24)

    if (doc.current) {
      doc.current.position.x = -2.8 * (1 - slide)
      doc.current.position.z = -0.12 * sep
    }
    if (plane.current) {
      plane.current.position.y = scanY
      plane.current.visible = t > 0.19 && t < 0.62
    }
    rows.forEach((r, i) => {
      const passed = smooth(r.y + r.h / 2 + 0.02, r.y - r.h / 2 - 0.06, scanY)
      const band = bands[i]!
      band.opacity = passed * (0.34 - sep * 0.12)
      const g = paneRefs.current[i]
      if (g) {
        const e = emphasis?.[i] ?? 0.4
        g.position.z = (i + 1) * 0.36 * sep
        g.position.y = e * 0.22 * sep
        g.position.x = (i - (n - 1) / 2) * 0.06 * sep
        g.visible = sep > 0.01
        const pane = panes[i]!
        pane.opacity = sep * (0.07 + e * 0.16)
        pane.color.set(e > 0.66 ? '#c8d9f6' : '#eaf1fb')
      }
    })
    bandRefs.current.forEach((b, i) => {
      if (b) b.visible = (bands[i]!.opacity ?? 0) > 0.01
    })
  })

  return (
    <group {...group}>
      {/* scanning arch */}
      <mesh geometry={roundedBox(0.12, DOC_H + 0.5, 0.5, 0.04)} material={m.silver} position={[-DOC_W / 2 - 0.34, 0, 0]} />
      <mesh geometry={roundedBox(0.12, DOC_H + 0.5, 0.5, 0.04)} material={m.silver} position={[DOC_W / 2 + 0.34, 0, 0]} />
      <mesh geometry={roundedBox(DOC_W + 0.8, 0.14, 0.5, 0.04)} material={m.silver} position={[0, DOC_H / 2 + 0.31, 0]} />
      <mesh geometry={roundedBox(DOC_W + 0.8, 0.1, 0.62, 0.04)} material={m.pearl} position={[0, -DOC_H / 2 - 0.3, 0.02]} />

      {/* the return */}
      <group ref={doc}>
        <Document kind="f1040" />
        {rows.map((r, i) => (
          <mesh
            key={i}
            ref={(el) => {
              bandRefs.current[i] = el
            }}
            geometry={unitPlane()}
            material={bands[i]}
            position={[0, r.y, DOC_T / 2 + 0.004]}
            scale={[DOC_W * 0.9, r.h, 1]}
          />
        ))}
      </group>

      {/* the scanning plane */}
      <group ref={plane} visible={false}>
        <mesh geometry={unitBox()} material={m.scan} scale={[DOC_W + 0.5, 0.012, 0.9]} />
        <mesh geometry={unitBox()} scale={[DOC_W + 0.5, 0.02, 0.012]} position={[0, 0, 0.45]}>
          <meshBasicMaterial color={PALETTE.sapphire} toneMapped={false} />
        </mesh>
      </group>

      {/* analysis layers */}
      {areas.map((name, i) => (
        <group
          key={name}
          ref={(g) => {
            paneRefs.current[i] = g
          }}
          visible={false}
        >
          <mesh geometry={roundedBox(DOC_W * 1.02, DOC_H * 1.02, 0.02, 0.02)} material={panes[i]} />
          <lineSegments geometry={paneEdges(DOC_W * 1.02, DOC_H * 1.02)} material={m.edge} />
          <mesh geometry={unitPlane()} material={bands[i]} position={[0, rows[i]!.y, 0.013]} scale={[DOC_W * 0.9, rows[i]!.h, 1]} />
          <Label3D text={name} height={0.15} size={56} color="#1e3a8a" weight={800} bg="rgba(255,255,255,0.88)" position={[-DOC_W / 2 + 0.52, rows[i]!.y + rows[i]!.h / 2 + 0.1, 0.02]} />
        </group>
      ))}
    </group>
  )
}

