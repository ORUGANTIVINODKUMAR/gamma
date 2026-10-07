import { Environment, Lightformer } from '@react-three/drei'

/** Bright, warm-white studio lighting. The environment is generated procedurally (no HDR download). */
export default function LightingRig({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.9 * intensity} color="#fffaf0" />
      <directionalLight position={[4, 5, 5]} intensity={1.4 * intensity} color="#fff4de" />
      <directionalLight position={[-5, -2, 3]} intensity={0.7 * intensity} color="#dbe7f5" />
      <pointLight position={[0, 0, 4]} intensity={6 * intensity} color="#f1dfae" distance={10} />
      <Environment resolution={128} frames={1} environmentIntensity={0.9}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, -3]} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 2]} scale={[2, 6, 1]} color="#eaf1fb" />
        <Lightformer form="rect" intensity={1.8} position={[5, 0, 2]} scale={[2, 6, 1]} color="#f6e7bf" />
        <Lightformer form="ring" intensity={1.2} position={[0, -3, 3]} scale={4} color="#fff7e4" />
      </Environment>
    </>
  )
}
