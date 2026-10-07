import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import { MathUtils, type Group, type PerspectiveCamera } from 'three'
import { TOOLS, type ToolId } from '@/config/tools'
import { input } from '@/lib/three/input'
import { damp } from '@/lib/three/math'
import { roundedBox } from '@/lib/three/geometry'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'
import { GroundShadow } from '../lighting/StudioLighting'
import { Label3D } from '../models/Label'
import { BlobShadow, Plinth } from '../models/Plinth'
import { TOOL_OBJECTS } from '../tools/registry'

const TOOL_IDS: ToolId[] = TOOLS.map((t) => t.id)
const N = TOOL_IDS.length
const FOV = 34
const TAN = Math.tan(MathUtils.degToRad(FOV / 2))

export interface GalleryState {
  selected: ToolId | null
  hovered: ToolId | null
  /** Camera pushes in just before navigating to the tool. */
  diving: boolean
}

export interface GalleryProps {
  state: GalleryState
  onSelect: (id: ToolId | null) => void
  onHover: (id: ToolId | null) => void
  className?: string
}

/** One source of truth for the arc spacing, shared by the camera rig and the props. */
const spacingFor = (compact: boolean) => (compact ? 3.4 : 3.2)

const slot = (i: number, spacing: number): [number, number, number] => [(i - (N - 1) / 2) * spacing, 0, -Math.pow(i - (N - 1) / 2, 2) * 0.28]

function GalleryProp({ id, index, spacing, live, onSelect, onHover }: { id: ToolId; index: number; spacing: number; live: RefObject<GalleryState>; onSelect: GalleryProps['onSelect']; onHover: GalleryProps['onHover'] }) {
  const spec = TOOL_OBJECTS[id]
  const Obj = spec.Component
  const m = getMaterials()
  const { reduceMotion, quality } = useSceneQuality()
  const root = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const driver = useRef(0)
  const pos = slot(index, spacing)
  const face = -(index - (N - 1) / 2) * 0.13

  useFrame((state, dt) => {
    const g = root.current
    const s = live.current
    if (!g || !s) return
    const sel = s.selected === id
    const hov = s.hovered === id
    const lift = sel ? 0.22 : hov ? 0.16 : 0
    const scale = (sel ? 1.1 : hov ? 1.05 : 1) * (s.selected && !sel ? 0.86 : 1)
    const t = reduceMotion ? 0 : state.clock.elapsedTime
    g.position.y = reduceMotion ? lift : damp(g.position.y, lift + Math.sin(t * 0.8 + index) * 0.04, 5, dt)
    const k = reduceMotion ? scale : damp(g.scale.x, scale, 5, dt)
    g.scale.setScalar(k)
    if (inner.current) inner.current.rotation.y = reduceMotion ? face : damp(inner.current.rotation.y, sel ? face * 0.3 : face + Math.sin(t * 0.35 + index) * 0.06, 3, dt)
    driver.current = sel || hov ? 1 : spec.idle
  })

  return (
    <group
      ref={root}
      position={pos}
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
      <group ref={inner} rotation={[0, face, 0]}>
        <Plinth radius={spec.plinth * 1.05} />
        {quality !== 'high' && <BlobShadow size={spec.plinth * 2.7} position={[0, -0.17, 0]} />}
        <group scale={spec.scale}>
          <Obj progress={driver} />
        </group>
        <group position={[0, 0.02, spec.plinth * 1.05 + 0.5]} rotation={[-0.35, 0, 0]}>
          <mesh geometry={roundedBox(spec.plinth * 1.5, 0.36, 0.06, 0.04)} material={m.pearl} />
          <Label3D text={spec.caption} height={0.22} size={60} color="#1e293b" weight={800} position={[0, 0, 0.04]} />
        </group>
      </group>
    </group>
  )
}

function Rig({ live, compact }: { live: RefObject<GalleryState>; compact: boolean }) {
  const size = useThree((s) => s.size)
  const { reduceMotion, coarse } = useSceneQuality()
  const spacing = spacingFor(compact)
  const aspect = size.width / size.height
  const view = useRef({ x: 0, y: 0, z: 14, tx: 0, ty: 0.9, ox: 0, oy: 0 })

  useFrame((state, dt) => {
    const cam = state.camera as PerspectiveCamera
    const s = live.current
    const v = view.current
    const sel = s?.selected ? TOOL_IDS.indexOf(s.selected) : -1
    const selected = sel >= 0

    // Wide enough for the whole arc, or tight on one object.
    const needHalf = selected ? 3.5 : ((N - 1) / 2) * spacing + 1.9
    let dist = Math.max(6.2, needHalf / (TAN * Math.min(aspect, 2.4)))
    if (compact && !selected) dist = Math.max(dist, 22)
    if (s?.diving) dist *= 0.5

    const p = selected ? slot(sel, spacing) : [0, 0, -0.3]
    const spec = selected ? TOOL_OBJECTS[TOOL_IDS[sel]!] : null
    const targetY = spec ? spec.centerY * spec.scale + 0.2 : 1.35
    const tx = p[0]! + (coarse || reduceMotion ? 0 : input.px * 0.5)
    const lerpK = reduceMotion ? 80 : 3.4
    v.x = damp(v.x, p[0]! + (coarse || reduceMotion ? 0 : input.px * 0.6), lerpK, dt)
    v.y = damp(v.y, selected ? 1.7 : 3.1 + (coarse ? 0 : input.py * 0.4), lerpK, dt)
    v.z = damp(v.z, p[2]! + dist, lerpK, dt)
    v.tx = damp(v.tx, tx, lerpK, dt)
    v.ty = damp(v.ty, targetY, lerpK, dt)
    // Selected tool sits to one side so the info panel has room; on phones it sits above the panel.
    const ox = selected && !compact ? -0.16 : 0
    const oy = selected && compact ? 0.16 : 0
    v.ox = damp(v.ox, ox, lerpK, dt)
    v.oy = damp(v.oy, oy, lerpK, dt)

    cam.position.set(v.x, v.y, v.z)
    cam.lookAt(v.tx, v.ty, p[2]!)
    cam.fov = FOV
    cam.setViewOffset(size.width, size.height, -v.ox * size.width, v.oy * size.height, size.width, size.height)
  })
  return null
}

function Gallery({ state, onSelect, onHover }: Omit<GalleryProps, 'className'>) {
  const size = useThree((s) => s.size)
  const compact = size.width / size.height < 1.05 || size.width < 640
  const spacing = spacingFor(compact)
  const invalidate = useThree((s) => s.invalidate)
  const live = useRef<GalleryState>(state)
  // reduced motion renders on demand, so a selection change must ask for a frame
  useEffect(() => {
    live.current = state
    invalidate()
  }, [state, invalidate])
  // never leave the pointer cursor behind when the gallery unmounts
  useEffect(
    () => () => {
      document.body.style.cursor = ''
    },
    [],
  )

  return (
    <>
      <Rig live={live} compact={compact} />
      {/* background catcher: clicking empty space returns to the overview */}
      <mesh position={[0, 0, -12]} onClick={() => onSelect(null)}>
        <planeGeometry args={[120, 60]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {TOOL_IDS.map((id, i) => (
        <GalleryProp key={id} id={id} index={i} spacing={spacing} live={live} onSelect={onSelect} onHover={onHover} />
      ))}
      <GroundShadow y={-0.02} scale={36} opacity={0.5} />
    </>
  )
}

export default function GalleryScene({ state, onSelect, onHover, className }: GalleryProps) {
  return (
    <SceneCanvas
      className={className}
      interactive
      label="Interactive gallery of the five Tapreco tax tools"
      camera={{ position: [0, 3.4, 16], fov: FOV }}
      fallback={<DocumentPoster />}
    >
      <Gallery state={state} onSelect={onSelect} onHover={onHover} />
    </SceneCanvas>
  )
}
