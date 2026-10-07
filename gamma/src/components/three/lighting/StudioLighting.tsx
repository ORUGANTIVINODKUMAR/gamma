import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { useSceneQuality } from '@/lib/three/quality'

/**
 * Bright product-studio lighting. A procedural environment (no HDR download)
 * made of soft-boxes gives metals and clearcoats something believable to
 * reflect; a key and a cool rim light separate pale objects from the pale page.
 */
export function StudioLighting({ intensity = 1 }: { intensity?: number }) {
  const { quality } = useSceneQuality()
  return (
    <>
      <ambientLight intensity={0.22 * intensity} />
      <directionalLight position={[5, 8, 6]} intensity={2.1 * intensity} />
      <directionalLight position={[-7, 3, -3]} intensity={0.9 * intensity} color="#c9dcff" />
      <Environment resolution={quality === 'high' ? 256 : 128} frames={1} environmentIntensity={0.62 * intensity}>
        <color attach="background" args={["#b9b6ae"]} />
        {/* overhead soft-box */}
        <Lightformer form="rect" intensity={5} position={[0, 7, 2]} scale={[14, 7, 1]} rotation-x={Math.PI / 2} />
        {/* left key strip */}
        <Lightformer form="rect" intensity={3} position={[-7, 2, 3]} scale={[7, 9, 1]} rotation-y={Math.PI / 2} />
        {/* cool right rim */}
        <Lightformer form="rect" intensity={2.4} position={[8, 1, -1]} scale={[5, 9, 1]} rotation-y={-Math.PI / 2} color="#cfe0ff" />
        {/* front fill */}
        <Lightformer form="rect" intensity={1.6} position={[0, 1, 9]} scale={[12, 5, 1]} />
        {/* floor bounce */}
        <Lightformer form="rect" intensity={1.3} position={[0, -4, 2]} scale={[16, 4, 1]} rotation-x={-Math.PI / 2} />
      </Environment>
    </>
  )
}

/**
 * Soft grounding shadow on a virtual floor. Real contact shadows on high
 * quality; skipped once the performance monitor degrades the scene (callers
 * pair it with <BlobShadow/> where a cheap fallback matters).
 */
export function GroundShadow({ y = -1.6, scale = 14, opacity = 0.42 }: { y?: number; scale?: number; opacity?: number }) {
  const { quality, degraded } = useSceneQuality()
  if (quality !== 'high' || degraded) return null
  return <ContactShadows position={[0, y, 0]} scale={scale} blur={2.6} far={5} resolution={512} opacity={opacity} color="#1c2740" frames={Infinity} />
}
