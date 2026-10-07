import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import type { MotionValue } from 'framer-motion'
import type { SceneVariant } from '../components/Scene'
import Composition from './Compositions'

export default function TaxScene({ variant, active, reduced, progress }: { variant: SceneVariant; active: boolean; reduced: boolean; progress: MotionValue<number> }) {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.6))
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => { setMobile(media.matches); setDpr(Math.min(window.devicePixelRatio, media.matches ? 1.25 : 1.6)) }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const motion = { variant, reduced, mobile, progress }
  return <Canvas dpr={dpr} frameloop={!active ? 'never' : reduced ? 'demand' : 'always'} camera={{ position: [0, -0.12, 9.7], fov: variant === 'platform' ? 36 : 37 }} gl={{ antialias: !mobile, alpha: true, powerPreference: 'low-power' }} fallback={<div className="webgl-fallback">Professional tax intelligence. Thoughtfully connected.</div>}>
    <ambientLight intensity={1.15} />
    <directionalLight position={[-4, 6, 6]} intensity={2.4} color="#ffffff" />
    <directionalLight position={[5, 3, -4]} intensity={2.2} color="#cfe5ff" />
    <Environment resolution={mobile ? 32 : 64} frames={1}><Lightformer intensity={3.5} position={[-5, 3, 5]} scale={[8, 6, 1]} /><Lightformer intensity={2} position={[4, 2, -3]} rotation={[0, Math.PI / 2, 0]} scale={[5, 5, 1]} color="#d5e8ff" /></Environment>
    <Composition motion={motion} />
    <ContactShadows position={[0, -2.45, 0]} opacity={0.27} scale={10} blur={2.7} far={4.5} resolution={mobile ? 128 : 256} frames={1} color="#536c91" />
    {!reduced && <PerformanceMonitor onDecline={() => setDpr(mobile ? 1 : 1.25)} flipflops={2} onFallback={() => setDpr(1)} />}
  </Canvas>
}
