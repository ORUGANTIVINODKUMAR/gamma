import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSceneQuality } from '@/lib/three/quality'
import { CursorParallax } from '../camera/CursorParallax'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'
import { GroundShadow } from '../lighting/StudioLighting'
import { DocumentStack } from '../models/DocumentStack'
import { TaxFolder } from '../models/Folder'
import { BlobShadow } from '../models/Plinth'

function Shelf({ open, count }: { open: boolean; count: number }) {
  const folders = useRef(0)
  const { quality, degraded } = useSceneQuality()
  // folders fan open while a report is on screen
  useFrame(() => {
    folders.current = open ? 1 : 0.15
  })
  const fan = Math.min(1, count / 6)
  return (
    <>
      <CursorParallax strength={0.1}>
        <group position={[0, -0.9, 0]}>
          <TaxFolder position={[-2.1, 1.0, 0]} width={1.1} height={1.9} tone="sapphire" kind="report" open={folders} rotation={[0, 0.3, 0]} />
          <TaxFolder position={[-0.85, 1.0, 0.15]} width={1.1} height={1.9} tone="pearl" kind="plan" open={folders} rotation={[0, 0.12, 0]} />
          <TaxFolder position={[0.4, 1.0, 0.1]} width={1.1} height={1.9} tone="silver" kind="schedD" open={folders} rotation={[0, -0.08, 0]} />
          <DocumentStack position={[2.2, 1.05, 0]} kinds={['f1099', 'schC', 'f1040']} spread={0.25 + fan * 0.5} scale={0.9} rotation={[0, -0.35, 0]} />
        </group>
      </CursorParallax>
      <GroundShadow y={-0.92} scale={10} opacity={0.4} />
      {(quality !== 'high' || degraded) && <BlobShadow position={[0, -0.91, 0]} size={6} opacity={0.4} />}
    </>
  )
}

/** A shelf of report folders and loose documents; the folders open while a report is being read. */
export default function ReportShelfScene({ open, count, className }: { open: boolean; count: number; className?: string }) {
  return (
    <SceneCanvas
      className={className}
      label="A shelf of report folders and documents"
      camera={{ position: [0, 1.2, 8], fov: 30 }}
      fallback={<DocumentPoster />}
    >
      <Shelf open={open} count={count} />
    </SceneCanvas>
  )
}
