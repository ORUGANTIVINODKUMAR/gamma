import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useSceneQuality } from '@/lib/three/quality'
import { CursorParallax } from '../camera/CursorParallax'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'
import { GroundShadow } from '../lighting/StudioLighting'
import { DataVault } from '../models/DataVault'
import { Document } from '../models/Document'
import { BlobShadow, Plinth } from '../models/Plinth'
import { Shield } from '../models/Shield'

function Stage({ mood }: { mood: number }) {
  const shield = useRef<Group>(null)
  const docA = useRef<Group>(null)
  const docB = useRef<Group>(null)
  const { reduceMotion, quality, degraded } = useSceneQuality()

  useFrame(({ clock }) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    if (shield.current) {
      shield.current.position.y = 4.55 + Math.sin(t * 0.9) * 0.08
      shield.current.rotation.y = Math.sin(t * 0.4) * 0.35
    }
    if (docA.current) {
      docA.current.position.y = 1.7 + Math.sin(t * 0.7) * 0.1
      docA.current.rotation.z = 0.12 + Math.sin(t * 0.5) * 0.03
    }
    if (docB.current) {
      docB.current.position.y = 2.2 + Math.sin(t * 0.6 + 1.7) * 0.1
      docB.current.rotation.z = -0.1 + Math.sin(t * 0.45 + 1) * 0.03
    }
  })

  return (
    <>
      <CursorParallax strength={0.16}>
        <group position={[0, -1.7, 0]} rotation={[0, -0.35, 0]}>
          <Plinth radius={2} />
          <DataVault open={mood} />
          <group ref={shield} position={[0, 4.55, 0.1]}>
            <Shield scale={0.62} />
          </group>
          <group ref={docA} position={[-2.1, 1.7, 0.4]} rotation={[0, 0.35, 0.12]} scale={0.7}>
            <Document kind="f1099" />
          </group>
          <group ref={docB} position={[2.15, 2.2, 0.3]} rotation={[0, -0.4, -0.1]} scale={0.66}>
            <Document kind="plan" />
          </group>
        </group>
      </CursorParallax>
      <GroundShadow y={-1.72} scale={11} />
      {(quality !== 'high' || degraded) && <BlobShadow position={[0, -1.71, 0]} size={7} />}
    </>
  )
}

/**
 * The sign-in backdrop: a filing vault under a floating shield. It lives in
 * the layout (not each page), so moving between Login, Signup and Forgot
 * Password animates the vault — the drawer eases out as the task gets heavier.
 * Calm by design; it must never compete with the form.
 */
export default function AuthScene({ mood = 0.3, className }: { mood?: number; className?: string }) {
  return (
    <SceneCanvas
      className={className}
      label="A three-dimensional filing vault beneath a protective shield, representing secure access to your tax workspace."
      camera={{ position: [0, 1.4, 11.5], fov: 30 }}
      fallback={<DocumentPoster />}
    >
      <Stage mood={mood} />
    </SceneCanvas>
  )
}
