import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import { roundedBox } from '@/lib/three/geometry'
import { damp } from '@/lib/three/math'
import { getMaterials } from '@/lib/three/materials'
import { useSceneQuality } from '@/lib/three/quality'
import { CursorParallax } from '../camera/CursorParallax'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'
import { GroundShadow } from '../lighting/StudioLighting'
import { Calculator } from '../models/Calculator'
import { DocumentStack } from '../models/DocumentStack'
import { TaxFolder } from '../models/Folder'
import { Label3D } from '../models/Label'
import { FinancialBlocks } from '../models/FinancialBlocks'
import { BlobShadow } from '../models/Plinth'

const LAYERS = ['Client data', 'Tapreco tax engine', 'Insights & reports']

/** One layer of the platform: a pearl plate with a caption and its own object. */
function Layer({ index, hovered, children }: { index: number; hovered: boolean; children: React.ReactNode }) {
  const m = getMaterials()
  const root = useRef<Group>(null)
  const { reduceMotion } = useSceneQuality()
  useFrame(({ clock }, dt) => {
    const g = root.current
    if (!g) return
    // the stack breathes; hovering pulls the layers apart so each can be read
    const t = reduceMotion ? 0 : clock.elapsedTime
    const gap = hovered ? 1.55 : 1.05 + (reduceMotion ? 0 : Math.sin(t * 0.7) * 0.04)
    g.position.y = reduceMotion ? gap * index : damp(g.position.y, gap * index, 4, dt)
  })
  return (
    <group ref={root}>
      <mesh geometry={roundedBox(3.6, 0.14, 2.5, 0.06, 2)} material={m.pearl} />
      <mesh geometry={roundedBox(3.64, 0.03, 2.54, 0.02, 1)} material={m.silver} position={[0, -0.075, 0]} />
      <Label3D text={LAYERS[index]!} height={0.17} size={56} weight={800} color="#334155" position={[-0.9, 0.075, 1.0]} rotation={[-Math.PI / 2, 0, 0]} />
      {children}
    </group>
  )
}

function Stack() {
  const m = getMaterials()
  const [hovered, setHovered] = useState(false)
  const { quality, degraded } = useSceneQuality()
  return (
    <>
      <CursorParallax strength={0.2}>
        <group
          position={[0, -1.6, 0]}
          rotation={[0, -0.5, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* the shared spine that ties the layers together */}
          {[
            [-1.6, -1.05],
            [1.6, 1.05],
          ].map(([x, z]) => (
            <mesh key={`${x}`} geometry={roundedBox(0.07, 2.6, 0.07, 0.03)} material={m.sapphire} position={[x!, 1.15, z!]} />
          ))}
          <Layer index={0} hovered={hovered}>
            <DocumentStack position={[0, 1.0, 0]} kinds={['f1040', 'schC', 'f1099']} spread={hovered ? 0.8 : 0.35} scale={0.78} />
          </Layer>
          <Layer index={1} hovered={hovered}>
            <Calculator position={[-0.9, 0.9, -0.1]} rotation={[0, 0.3, 0]} scale={0.5} />
            <FinancialBlocks position={[0.85, 0.07, 0]} scale={0.6} />
          </Layer>
          <Layer index={2} hovered={hovered}>
            <TaxFolder position={[-0.6, 0.95, 0]} width={1.1} height={1.8} tone="sapphire" kind="report" open={hovered ? 1 : 0.2} rotation={[0, 0.2, 0]} />
            <TaxFolder position={[0.55, 0.95, 0.05]} width={1.1} height={1.8} tone="pearl" kind="plan" open={hovered ? 1 : 0.2} rotation={[0, -0.1, 0]} />
          </Layer>
        </group>
      </CursorParallax>
      <GroundShadow y={-1.65} scale={10} opacity={0.4} />
      {(quality !== 'high' || degraded) && <BlobShadow position={[0, -1.64, 0]} size={6} opacity={0.4} />}
    </>
  )
}

/** The platform as three layers on one spine: client data, the tax engine, and reports. Hover pulls them apart. */
export default function PlatformStackScene({ className }: { className?: string }) {
  return (
    <SceneCanvas
      className={className}
      interactive
      label="Three stacked layers — client data, the Tapreco tax engine, and insights and reports — joined by a shared spine."
      camera={{ position: [0, 2.2, 11], fov: 30 }}
      fallback={<DocumentPoster />}
    >
      <Stack />
    </SceneCanvas>
  )
}
