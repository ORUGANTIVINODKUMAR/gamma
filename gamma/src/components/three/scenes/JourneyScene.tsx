import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import { MathUtils, type Group, type PerspectiveCamera } from 'three'
import { TOOLS, type ToolId } from '@/config/tools'
import { input } from '@/lib/three/input'
import { clamp01, damp, easeOut, smooth } from '@/lib/three/math'
import { useSceneQuality } from '@/lib/three/quality'
import { PALETTE } from '@/lib/three/palette'
import { roundedBox } from '@/lib/three/geometry'
import { getMaterials } from '@/lib/three/materials'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'
import { GroundShadow } from '../lighting/StudioLighting'
import { Calculator } from '../models/Calculator'
import { CoinStack } from '../models/CoinStack'
import { Label3D } from '../models/Label'
import { BlobShadow, Plinth } from '../models/Plinth'
import { Shield } from '../models/Shield'
import { TaxLogo3D } from '../models/TaxLogo3D'
import { TOOL_OBJECTS } from '../tools/registry'

/**
 * The homepage story, in one persistent scene.
 *
 *  scene 0    hero: the five tool objects hang together as a floating workspace
 *  scene 1    they separate and land on pedestals in a ring (the tool gallery)
 *  scene 2–6  the camera orbits the ring, arriving at each tool as it animates
 *  scene 7    the objects converge and rebuild into the Tapreco mark
 *
 * `story.current` is a continuous scene index (0 … 7) written by the page's
 * scroll listener. A single parent loop turns it into a shared `World`
 * (smoothed scene, easing phases, ring layout) and moves the camera; each prop
 * then positions itself from that world. No React state is touched while
 * scrolling, so nothing re-renders.
 */

export interface Story {
  current: number
}

const TOOL_IDS: ToolId[] = TOOLS.map((t) => t.id)
const N = TOOL_IDS.length
const FOV = 34
const TAN = Math.tan(MathUtils.degToRad(FOV / 2))

/** Where each object hangs in the hero workspace (position, y-rotation, scale multiplier). */
const CLUSTER: { p: [number, number, number]; ry: number; s: number }[] = [
  { p: [0.0, -0.15, 1.6], ry: -0.3, s: 0.85 }, // mutual fund — front
  { p: [-1.55, -0.8, 0.6], ry: 0.45, s: 0.5 }, // estimated tax — low left
  { p: [-0.6, 0.65, -1.5], ry: 0.15, s: 0.72 }, // audit risk — back
  { p: [1.6, -0.5, 0.1], ry: -0.5, s: 0.4 }, // entity — right
  { p: [1.3, 1.4, -2.3], ry: -0.2, s: 0.6 }, // planner — high right
]

interface CamKey {
  r: number
  a: number
  y: number
  t: [number, number, number]
  /** Horizontal / vertical composition shift, as a fraction of the viewport. */
  ox: number
  oy: number
}

interface Layout {
  ring: [number, number, number][]
  phi: number[]
  keys: CamKey[]
}

/** Everything the props need, refreshed once per frame by <Journey/>. */
interface World {
  sc: number
  e0: number
  e7: number
  ie: number
  time: number
  toolsPhase: number
  layout: Layout
}

function buildLayout(width: number, height: number): Layout {
  const aspect = width / height
  const compact = aspect < 0.95
  const ringR = compact ? 5 : 7.5
  const step = MathUtils.degToRad(compact ? 36 : 40)
  const phi = TOOL_IDS.map((_, i) => (i - (N - 1) / 2) * step)
  const ring = phi.map((a) => [Math.sin(a) * ringR, 0, Math.cos(a) * ringR] as [number, number, number])

  // Camera distance that frames a tool in the free half of the viewport.
  const frac = compact ? 0.92 : 0.5
  const dist = TOOL_IDS.map((id) => Math.max(5.2, (TOOL_OBJECTS[id].width * 1.25) / (frac * 2 * TAN * Math.min(aspect, 1.9))))
  const sideX = compact ? 0 : 0.2
  const upY = compact ? 0.19 : 0

  const keys: CamKey[] = [
    { r: compact ? 12.5 : 10.4, a: 0, y: 1.6, t: [0, 0.35, 0], ox: compact ? 0 : 0.23, oy: compact ? 0.17 : 0 },
    { r: compact ? 28 : 25, a: 0, y: compact ? 11 : 10.5, t: [0, 0.4, ringR * 0.6], ox: 0, oy: compact ? 0.16 : -0.05 },
  ]
  TOOL_IDS.forEach((id, i) => {
    const spec = TOOL_OBJECTS[id]
    const d = dist[i]!
    keys.push({
      r: ringR + d,
      a: phi[i]!,
      y: 1.5 + d * 0.12,
      t: [ring[i]![0], spec.centerY * spec.scale + 0.15, ring[i]![2]],
      // text alternates sides; the tool sits in the free half
      ox: compact ? 0 : i % 2 === 0 ? sideX : -sideX,
      oy: upY,
    })
  })
  keys.push({ r: compact ? 17 : 11.5, a: 0, y: 1.8, t: [0, 1.6, 0], ox: 0, oy: compact ? 0.31 : 0.13 })
  return { ring, phi, keys }
}

/** One tool: pose from cluster → ring → logo, plus its own animation driver. */
function ToolProp({ id, index, world }: { id: ToolId; index: number; world: RefObject<World> }) {
  const spec = TOOL_OBJECTS[id]
  const Obj = spec.Component
  const m = getMaterials()
  const { reduceMotion, quality } = useSceneQuality()
  const root = useRef<Group>(null)
  const plinth = useRef<Group>(null)
  const plate = useRef<Group>(null)
  const driver = useRef(0)

  useFrame(() => {
    const w = world.current
    const g = root.current
    if (!g) return
    const { sc, e0, e7, ie, time, toolsPhase, layout } = w
    const c = CLUSTER[index]!
    const ringP = layout.ring[index]!
    const focus = 1 - clamp01(Math.abs(sc - (2 + index)) * 1.6)
    const bob = reduceMotion ? 0 : Math.sin(time * 0.7 + index * 1.9) * 0.06
    const lift = Math.sin(Math.PI * e0) * 1.1 + Math.sin(Math.PI * e7) * 1.4
    const scatter = 1 + (1 - ie) * 1.4

    g.position.set(
      MathUtils.lerp(MathUtils.lerp(c.p[0] * scatter, ringP[0], e0), 0, e7),
      MathUtils.lerp(MathUtils.lerp(c.p[1] + (1 - ie) * 2.2, ringP[1], e0), 1.4, e7) + lift + bob * (1 - e0 * 0.4),
      MathUtils.lerp(MathUtils.lerp(c.p[2] * scatter, ringP[2], e0), 0, e7),
    )
    g.rotation.y = MathUtils.lerp(MathUtils.lerp(c.ry, layout.phi[index]!, e0), 0, e7)
    // while a tool is in focus its neighbours recede, so they never crowd the copy
    const recede = 1 - toolsPhase * (1 - focus) * 0.5
    const base = MathUtils.lerp(c.s * (0.5 + 0.5 * ie), 1, e0) * spec.scale
    g.scale.setScalar(base * (1 + focus * 0.08) * recede * (1 - e7 * 0.96))
    g.visible = e7 < 0.995

    // animation: idle until the camera arrives, then plays through once
    const into = sc - (2 + index)
    const played = into <= 0 ? 0 : into >= 1 ? 1 : smooth(0.08, 0.72, into)
    driver.current = Math.max(spec.idle, played)

    if (plinth.current) {
      const s = smooth(0.35, 1, sc) * (1 - e7)
      plinth.current.scale.setScalar(Math.max(0.0001, s))
      plinth.current.visible = s > 0.01
    }
    if (plate.current) {
      const s = smooth(0.7, 1, sc) * (1 - e7)
      plate.current.scale.setScalar(Math.max(0.0001, s))
      plate.current.visible = s > 0.01
    }
  })

  return (
    <group ref={root}>
      <group ref={plinth} scale={0.0001}>
        <Plinth radius={spec.plinth} />
        {quality !== 'high' && <BlobShadow size={spec.plinth * 2.6} position={[0, -0.17, 0]} />}
      </group>
      <Obj progress={driver} />
      <group ref={plate} scale={0.0001} position={[0, 0.02, spec.plinth + 0.55]} rotation={[-0.35, 0, 0]}>
        <mesh geometry={roundedBox(spec.plinth * 1.5, 0.34, 0.06, 0.04)} material={m.pearl} />
        <Label3D text={spec.caption} height={0.2} size={60} color="#1e293b" weight={800} position={[0, 0, 0.04]} />
      </group>
    </group>
  )
}

/** Hero-only pieces that dissolve into the five tools as the workspace separates. */
function Extras({ world }: { world: RefObject<World> }) {
  const root = useRef<Group>(null)
  useFrame(() => {
    const g = root.current
    if (!g) return
    const e0 = world.current.e0
    g.scale.setScalar(Math.max(0.0001, 1 - e0))
    g.position.y = e0 * 1.4
    g.visible = e0 < 0.995
  })
  return (
    <group ref={root}>
      <Calculator position={[-2.5, 0.9, 1.2]} rotation={[-0.12, 0.55, 0.08]} scale={0.34} />
      <CoinStack position={[1.45, -1.05, 2.1]} scale={0.46} />
      <Shield position={[0.3, 2.3, 0.2]} rotation={[0, 0.35, 0.05]} scale={0.46} />
    </group>
  )
}

/** The destination: the Tapreco mark, assembled on its own pedestal. */
function LogoProp({ world }: { world: RefObject<World> }) {
  const logo = useRef<Group>(null)
  const pedestal = useRef<Group>(null)
  const drive = useRef(0)
  const { reduceMotion } = useSceneQuality()
  useFrame(() => {
    const sc = world.current.sc
    const la = smooth(6.35, 7, sc)
    drive.current = la
    if (logo.current) {
      logo.current.visible = la > 0.001
      logo.current.rotation.y = reduceMotion ? 0 : input.px * 0.25
    }
    if (pedestal.current) pedestal.current.scale.setScalar(Math.max(0.0001, smooth(6.2, 7, sc)))
  })
  return (
    <>
      <group ref={pedestal} scale={0.0001}>
        <Plinth radius={2.1} />
      </group>
      <group ref={logo} position={[0, 2.1, 0]} scale={0.5} visible={false}>
        <TaxLogo3D assemble={drive} />
      </group>
    </>
  )
}

function Journey({ story }: { story: RefObject<number> }) {
  const size = useThree((s) => s.size)
  const { reduceMotion, coarse, quality } = useSceneQuality()
  const layout = useMemo(() => buildLayout(size.width, size.height), [size.width, size.height])
  const world = useRef<World>({ sc: 0, e0: 0, e7: 0, ie: 1, time: 0, toolsPhase: 0, layout })
  const smoothScene = useRef(0)
  const blend = useRef({ ox: 0, oy: 0, lateral: 0 })

  // Runs first (negative priority) so every prop reads this frame's world.
  useFrame((state, dt) => {
    const cam = state.camera as PerspectiveCamera
    const time = state.clock.elapsedTime
    smoothScene.current = reduceMotion ? story.current : damp(smoothScene.current, story.current, 4.2, dt)
    const sc = smoothScene.current

    // phases: hold on each scene, then move in the last part of it
    const e0 = smooth(0.5, 1, clamp01(sc))
    const e7 = smooth(0.58, 1, clamp01(sc - 6))
    // opening shot: the camera drifts in while the workspace assembles (scene 0 only)
    const intro = reduceMotion ? 1 : easeOut((time - 0.15) / 2.8)
    const ie = 1 - (1 - intro) * (1 - e0)
    world.current = { sc, e0, e7, ie, time, toolsPhase: smooth(1.35, 2, sc) * (1 - e7), layout }

    const { keys } = layout
    const k = Math.min(6, Math.floor(sc))
    const g = smooth(0.58, 1, sc - k)
    const A = keys[k]!
    const B = keys[k + 1]!
    const r = MathUtils.lerp(A.r, B.r, g) + (1 - ie) * 4
    const a = MathUtils.lerp(A.a, B.a, g)
    const y = MathUtils.lerp(A.y, B.y, g)
    const calm = reduceMotion || coarse
    blend.current.lateral = damp(blend.current.lateral, calm ? 0 : input.px * 0.45, 2.5, dt)
    cam.position.set(Math.sin(a) * r + blend.current.lateral, y + (calm ? 0 : input.py * 0.18), Math.cos(a) * r)
    cam.lookAt(MathUtils.lerp(A.t[0], B.t[0], g), MathUtils.lerp(A.t[1], B.t[1], g), MathUtils.lerp(A.t[2], B.t[2], g))
    cam.fov = FOV
    const ox = MathUtils.lerp(A.ox, B.ox, g)
    const oy = MathUtils.lerp(A.oy, B.oy, g)
    blend.current.ox = reduceMotion ? ox : damp(blend.current.ox, ox, 6, dt)
    blend.current.oy = reduceMotion ? oy : damp(blend.current.oy, oy, 6, dt)
    cam.setViewOffset(size.width, size.height, -blend.current.ox * size.width, blend.current.oy * size.height, size.width, size.height)
  }, -1)

  return (
    <>
      <fog attach="fog" args={[PALETTE.ivory, 22, 52]} />
      {TOOL_IDS.map((id, i) => (
        <ToolProp key={id} id={id} index={i} world={world} />
      ))}
      {quality === 'high' && <Extras world={world} />}
      <LogoProp world={world} />
      <GroundShadow y={-0.02} scale={44} opacity={0.5} />
    </>
  )
}

export default function JourneyScene({ story, className }: { story: RefObject<number>; className?: string }) {
  return (
    <SceneCanvas
      className={className}
      label="A three-dimensional tax workspace that separates into the five Tapreco tools as you scroll, then rebuilds into the Tapreco mark."
      camera={{ position: [0, 1.6, 10.4], fov: FOV }}
      fallback={<DocumentPoster />}
    >
      <Journey story={story} />
    </SceneCanvas>
  )
}
