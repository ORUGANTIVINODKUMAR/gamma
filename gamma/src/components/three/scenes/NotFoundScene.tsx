import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useSceneQuality } from '@/lib/three/quality'
import { CursorParallax } from '../camera/CursorParallax'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'
import { GroundShadow } from '../lighting/StudioLighting'
import { Document } from '../models/Document'
import { TaxFolder } from '../models/Folder'
import { Label3D } from '../models/Label'
import { BlobShadow } from '../models/Plinth'

function Lost() {
  const sheet = useRef<Group>(null)
  const { reduceMotion, quality, degraded } = useSceneQuality()
  // the missing page drifts above its empty folder
  useFrame(({ clock }) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    if (sheet.current) {
      sheet.current.position.y = 2.7 + Math.sin(t * 0.9) * 0.14
      sheet.current.rotation.z = 0.2 + Math.sin(t * 0.6) * 0.06
      sheet.current.rotation.y = -0.35 + Math.sin(t * 0.5) * 0.12
    }
  })
  return (
    <>
      <CursorParallax strength={0.22}>
        <group position={[0, -1.2, 0]} rotation={[0, -0.4, 0]}>
          <TaxFolder position={[0, 1.05, 0]} width={2} height={2.2} tone="pearl" kind="blank" open={1} />
          <group ref={sheet} position={[0.2, 2.7, 0.5]} rotation={[0, -0.35, 0.2]} scale={0.9}>
            <Document kind="blank" />
            <Label3D text="404" height={0.62} serif size={150} color="#2563eb" position={[0, 0.1, 0.03]} />
          </group>
        </group>
      </CursorParallax>
      <GroundShadow y={-1.25} scale={9} opacity={0.4} />
      {(quality !== 'high' || degraded) && <BlobShadow position={[0, -1.24, 0]} size={5} opacity={0.4} />}
    </>
  )
}

/** An open folder with its page floating free — the 404, in objects. */
export default function NotFoundScene({ className }: { className?: string }) {
  return (
    <SceneCanvas className={className} label="An empty folder with a loose page floating above it, marked 404" camera={{ position: [0, 1.6, 9.5], fov: 30 }} fallback={<DocumentPoster />}>
      <Lost />
    </SceneCanvas>
  )
}
