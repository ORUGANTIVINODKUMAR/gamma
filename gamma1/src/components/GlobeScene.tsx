import SceneCanvas from './3d/SceneCanvas'
import LightingRig from './3d/LightingRig'
import TaprecoGlobe from './3d/TaprecoGlobe'
import FloatingParticles from './3d/FloatingParticles'
import { useMousePosition } from '../hooks/useMousePosition'
import { useIsMobile, useReducedMotion } from '../hooks/useReducedMotion'

/** Hero 3D scene: frosted glass globe, orbital rings and a light dust of particles. */
export default function GlobeScene({ className }: { className?: string }) {
  const mouse = useMousePosition()
  const mobile = useIsMobile()
  const reduced = useReducedMotion()

  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, mobile ? 8.8 : 7.4], fov: 35 }}>
      <LightingRig />
      <TaprecoGlobe mouse={mouse} mobile={mobile} reduced={reduced} />
      <FloatingParticles count={mobile ? 40 : 110} spread={[8, 6, 4]} animate={!reduced} />
    </SceneCanvas>
  )
}
