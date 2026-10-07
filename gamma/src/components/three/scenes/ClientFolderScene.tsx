import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { CursorParallax } from '../camera/CursorParallax'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'
import { DocumentStack } from '../models/DocumentStack'
import { TaxFolder } from '../models/Folder'
import { GroundShadow } from '../lighting/StudioLighting'
import { useSceneQuality } from '@/lib/three/quality'
import { BlobShadow } from '../models/Plinth'

function Folder({ tone, sheets }: { tone: 'sapphire' | 'pearl'; sheets: number }) {
  const open = useRef(0)
  const { quality, degraded } = useSceneQuality()
  // the folder opens a moment after it appears
  useFrame(({ clock }) => {
    open.current = clock.elapsedTime > 0.35 ? 1 : 0
  })
  const kinds = (['f1040', 'f1099', 'schC', 'plan'] as const).slice(0, Math.max(1, Math.min(4, sheets)))
  return (
    <>
      <CursorParallax strength={0.2}>
        <group position={[-0.35, -0.8, 0]} rotation={[0, 0.45, 0]}>
          <TaxFolder position={[0, 1.0, 0]} width={1.5} height={1.9} tone={tone} open={open} kind="report" />
          <DocumentStack position={[1.55, 0.9, 0.1]} kinds={kinds} spread={0.5} scale={0.8} rotation={[0, -0.3, 0]} />
        </group>
      </CursorParallax>
      <GroundShadow y={-0.82} scale={8} opacity={0.4} />
      {(quality !== 'high' || degraded) && <BlobShadow position={[0, -0.81, 0]} size={5} opacity={0.4} />}
    </>
  )
}

/** A client's file: a folder that opens beside the documents saved for them. */
export default function ClientFolderScene({ tone = 'sapphire', sheets = 1, className }: { tone?: 'sapphire' | 'pearl'; sheets?: number; className?: string }) {
  return (
    <SceneCanvas className={className} label="A client folder opening beside saved documents" camera={{ position: [0, 1.1, 7.2], fov: 30 }} fallback={<DocumentPoster />}>
      <Folder tone={tone} sheets={sheets} />
    </SceneCanvas>
  )
}
