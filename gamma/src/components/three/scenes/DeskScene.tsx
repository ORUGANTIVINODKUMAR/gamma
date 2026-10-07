import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type ReactNode, type RefObject } from 'react'
import type { Group } from 'three'
import { TOOLS } from '@/config/tools'
import { roundedBox } from '@/lib/three/geometry'
import { damp } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import { CursorParallax } from '../camera/CursorParallax'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'
import { GroundShadow } from '../lighting/StudioLighting'
import { Document } from '../models/Document'
import { DocumentStack } from '../models/DocumentStack'
import { TaxFolder } from '../models/Folder'
import { BlobShadow } from '../models/Plinth'
import { QuarterDocs } from '../models/QuarterDocs'
import { TOOL_OBJECTS } from '../tools/registry'

export type StationId = 'clients' | 'tools' | 'analyses' | 'reports' | 'deadlines'
export const STATIONS: StationId[] = ['clients', 'tools', 'analyses', 'reports', 'deadlines']

export interface DeskProps {
  hovered: StationId | null
  onHover: (id: StationId | null) => void
  onSelect: (id: StationId) => void
  className?: string
}

/** One station on the desk: a pearl pad, hover lift, pointer events. */
function Station({ id, x, z = 0, scale, hoveredRef, onHover, onSelect, children }: { id: StationId; x: number; z?: number; scale: number; hoveredRef: RefObject<StationId | null>; onHover: DeskProps['onHover']; onSelect: DeskProps['onSelect']; children: ReactNode }) {
  const m = getMaterials()
  const root = useRef<Group>(null)
  const { reduceMotion } = useSceneQuality()
  useFrame((_, dt) => {
    const g = root.current
    if (!g) return
    const on = hoveredRef.current === id
    g.position.y = reduceMotion ? (on ? 0.14 : 0) : damp(g.position.y, on ? 0.14 : 0, 6, dt)
  })
  return (
    <group
      position={[x, 0, z]}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(id)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        onHover(null)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(id)
      }}
    >
      <mesh geometry={roundedBox(2.5, 0.12, 1.9, 0.05)} material={m.pearl} position={[0, -0.06, 0]} />
      <mesh geometry={roundedBox(2.56, 0.03, 1.96, 0.02, 1)} material={m.silver} position={[0, -0.13, 0]} />
      <group ref={root}>{children}</group>
    </group>
  )
}

/** Five miniature instruments on a silver tray. */
function ToolTray({ hover }: { hover: boolean }) {
  const m = getMaterials()
  const driver = useRef(0)
  useFrame(() => {
    driver.current = hover ? 1 : 0.5
  })
  const slots: [number, number][] = [
    [-0.78, -0.42],
    [0, -0.42],
    [0.78, -0.42],
    [-0.4, 0.42],
    [0.4, 0.42],
  ]
  return (
    <group>
      <mesh geometry={roundedBox(2.3, 0.06, 1.7, 0.03)} material={m.silver} position={[0, 0.03, 0]} />
      {TOOLS.map((t, i) => {
        const spec = TOOL_OBJECTS[t.id]
        const Obj = spec.Component
        const [sx, sz] = slots[i]!
        return (
          <group key={t.id} position={[sx, 0.06, sz]} scale={spec.scale * 0.36} rotation={[0, -0.2, 0]}>
            <Obj progress={driver} />
          </group>
        )
      })}
    </group>
  )
}

function Desk({ hovered, onHover, onSelect }: Omit<DeskProps, 'className'>) {
  const m = getMaterials()
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  const { quality, degraded } = useSceneQuality()
  const hoveredRef = useRef<StationId | null>(hovered)
  // phones: two rows (3 in front, 2 behind) so each station stays legible
  const compact = size.width < 640
  // mirror the prop for per-frame reads without reading a ref during render;
  // also keeps the camera aimed at the desk's centre line
  useFrame(({ camera }) => {
    hoveredRef.current = hovered
    camera.lookAt(0, compact ? 0.6 : 1.05, 0)
  })
  const cols = compact ? 3 : STATIONS.length
  const colW = viewport.width / cols
  const scale = Math.min(1, colW / 2.7)
  const xs = STATIONS.map((_, i) => (compact ? (i < 3 ? i - 1 : i - 3 - 0.5) * colW : (i - (STATIONS.length - 1) / 2) * colW))
  const zs = STATIONS.map((_, i) => (compact ? (i < 3 ? 1.6 : -1.9) : 0))
  const open = (id: StationId) => (hovered === id ? 1 : 0)
  const props = { hoveredRef, onHover, onSelect, scale }

  return (
    <>
      <CursorParallax strength={0.05} lift={0.03}>
        <Station id="clients" x={xs[0]!} z={zs[0]!} {...props}>
          <DocumentStack kinds={['f1040', 'schC', 'f1099']} spread={open('clients') * 0.7 + 0.18} position={[0, 1.15, 0]} scale={0.85} />
        </Station>

        <Station id="tools" x={xs[1]!} z={zs[1]!} {...props}>
          <ToolTray hover={hovered === 'tools'} />
        </Station>

        <Station id="analyses" x={xs[2]!} z={zs[2]!} {...props}>
          <FloatingSheets hover={hovered === 'analyses'} />
        </Station>

        <Station id="reports" x={xs[3]!} z={zs[3]!} {...props}>
          <group position={[0, 0.02, 0]}>
            <TaxFolder position={[-0.72, 1.0, 0]} width={0.9} height={1.7} tone="sapphire" kind="report" open={open('reports')} rotation={[0, 0.15, 0]} />
            <TaxFolder position={[0, 1.0, 0.06]} width={0.9} height={1.7} tone="pearl" kind="plan" open={open('reports')} />
            <TaxFolder position={[0.72, 1.0, 0]} width={0.9} height={1.7} tone="silver" kind="schedD" open={open('reports')} rotation={[0, -0.15, 0]} />
          </group>
        </Station>

        <Station id="deadlines" x={xs[4]!} z={zs[4]!} {...props}>
          <QuarterDocs position={[0, 0.06, 0]} assemble={1} lift={hovered === 'deadlines' ? [0.3, 0.6, 0.3, 0.6] : undefined} gap={0.56} sheetScale={0.46} />
        </Station>
      </CursorParallax>
      <mesh geometry={roundedBox(viewport.width * 1.04, 0.1, compact ? 7 : 2.6, 0.04, 1)} material={m.ceramic} position={[0, -0.25, compact ? -0.2 : 0]} />
      <GroundShadow y={-0.32} scale={viewport.width * 1.4} opacity={0.35} />
      {(quality !== 'high' || degraded) && <BlobShadow position={[0, -0.31, 0]} size={viewport.width * 1.1} opacity={0.35} />}
    </>
  )
}

/** Recent analyses: three sheets that hang above the pad and drift. */
function FloatingSheets({ hover }: { hover: boolean }) {
  const refs = useRef<(Group | null)[]>([])
  const { reduceMotion } = useSceneQuality()
  const kinds = ['plan', 'f1040', 'schedD'] as const
  useFrame(({ clock }, dt) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    refs.current.forEach((g, i) => {
      if (!g) return
      const spread = hover ? 1 : 0.6
      g.position.x = damp(g.position.x, (i - 1) * 0.62 * spread, 5, dt)
      g.position.y = 1.05 + i * 0.2 + Math.sin(t * 0.8 + i * 1.4) * 0.06
      g.rotation.z = (1 - i) * 0.12
      g.rotation.y = (i - 1) * -0.25
    })
  })
  return (
    <group>
      {kinds.map((k, i) => (
        <group
          key={k}
          ref={(g) => {
            refs.current[i] = g
          }}
          scale={0.66}
          position={[0, 1.05, i * 0.1]}
        >
          <Document kind={k} />
        </group>
      ))}
    </group>
  )
}

export default function DeskScene({ hovered, onHover, onSelect, className }: DeskProps) {
  return (
    <SceneCanvas
      className={className}
      interactive
      label="A virtual tax desk with five stations: clients, tax tools, analyses, reports and deadlines."
      camera={{ position: [0, 3.2, 9.4], fov: 32 }}
      fallback={<DocumentPoster />}
    >
      <Desk hovered={hovered} onHover={onHover} onSelect={onSelect} />
    </SceneCanvas>
  )
}
