import { memo, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Group, MathUtils } from 'three'
import { createDocumentTexture } from './documentTextures'
import type { SceneDocument, SceneMotion, Vector } from './types'

export const DocumentPanel = memo(function DocumentPanel({ kind, position, rotation = [0, 0, 0], width = 2.5, height = 1.59, index = 0, spread = [0, 0, 0], motion }: SceneDocument & { motion: SceneMotion }) {
  const ref = useRef<Group>(null)
  const elapsed = useRef(0)
  const texture = useMemo(() => createDocumentTexture(kind, motion.mobile), [kind, motion.mobile])
  useEffect(() => () => texture.dispose(), [texture])
  useFrame((_state, delta) => {
    if (!ref.current || motion.reduced) return
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt
    const t = elapsed.current
    const entry = MathUtils.clamp((t - index * 0.07) / 1.25, 0, 1)
    const ease = 1 - (1 - entry) ** 3
    const progress = MathUtils.clamp(motion.progress.get(), 0, 1)
    const fan = Math.sin(progress * Math.PI) * (motion.mobile ? 0.48 : 1)
    // Each plane follows its own depth path; scroll expands then gathers the layers.
    const amplitude = motion.variant === 'platform' ? 0.42 : 0.19
    ref.current.position.x = MathUtils.damp(ref.current.position.x, position[0] + spread[0] * fan * amplitude, 3.5, dt)
    ref.current.position.y = MathUtils.damp(ref.current.position.y, position[1] - (1 - ease) * 0.45 + spread[1] * fan * amplitude + Math.sin(t * 0.42 + index * 0.9) * 0.045, 3.5, dt)
    ref.current.position.z = MathUtils.damp(ref.current.position.z, position[2] + spread[2] * fan * amplitude, 3.5, dt)
    ref.current.rotation.z = rotation[2] + Math.sin(t * 0.2 + index) * 0.008
  })
  return <group ref={ref} position={position} rotation={rotation}>
    <RoundedBox args={[width + 0.1, height + 0.1, 0.11]} radius={0.055} smoothness={motion.mobile ? 2 : 3}>
      <meshPhysicalMaterial color="#e7effb" metalness={0.15} roughness={0.22} clearcoat={1} />
    </RoundedBox>
    <mesh position={[0, 0, 0.06]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} transparent toneMapped={false} /></mesh>
  </group>
})

export function GlassSlab({ position, scale, rotation = [0, 0, 0], mobile = false }: { position: Vector; scale: Vector; rotation?: Vector; mobile?: boolean }) {
  return <RoundedBox args={scale} position={position} rotation={rotation} radius={0.07} smoothness={mobile ? 2 : 3}>
    <meshPhysicalMaterial color="#cadff8" roughness={0.16} transmission={mobile ? 0.2 : 0.55} thickness={1.1} ior={1.45} metalness={0.02} clearcoat={1} />
  </RoundedBox>
}
