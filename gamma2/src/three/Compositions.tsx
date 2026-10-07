import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { DocumentPanel, GlassSlab } from './SceneObjects'
import type { SceneDocument, SceneMotion } from './types'

const heroDocuments: SceneDocument[] = [
  { kind: 'form', position: [0.15, 0.65, -0.8], width: 2.65, height: 3.21, rotation: [0, -0.04, 0.09], spread: [0.2, 0.5, -0.7] },
  { kind: 'planner', position: [-0.35, 0.15, 0.15], width: 2.65, height: 3.21, rotation: [0.015, 0.08, -0.055], spread: [-0.4, 0.2, 0.4] },
  { kind: 'audit', position: [1.63, 1.26, 0.98], width: 1.75, height: 1.11, rotation: [0.05, -0.15, 0.02], spread: [0.6, 0.5, 0.25] },
  { kind: 'estimate', position: [-1.72, -0.65, 1.22], width: 1.95, height: 1.24, rotation: [-0.04, 0.12, -0.09], spread: [-0.7, -0.3, 0.4] },
  { kind: 'entity', position: [1.58, -0.59, 0.87], width: 1.83, height: 1.16, rotation: [0.01, -0.14, 0.03], spread: [0.6, -0.2, 0.2] },
  { kind: 'funds', position: [0.07, -1.76, 1.63], width: 1.9, height: 1.2, rotation: [-0.02, 0.05, 0.04], spread: [0, -0.5, 0.3] },
]
const workspaceDocuments: SceneDocument[] = [
  { kind: 'client', position: [-0.85, 0.41, -0.73], width: 2.55, height: 3.09, rotation: [0, -0.07, 0.05], spread: [-0.9, 0.5, -0.8] },
  { kind: 'planner', position: [-0.1, 0.2, 0.05], width: 2.55, height: 3.09, rotation: [0, 0.1, -0.025], spread: [-0.15, 0.1, 0.1] },
  { kind: 'opportunities', position: [0.92, -0.6, 1.23], width: 2.78, height: 1.77, rotation: [0.03, -0.09, 0.025], spread: [0.9, -0.2, 0.9] },
  { kind: 'estimate', position: [1.45, 1.44, 0.45], width: 1.82, height: 1.16, rotation: [0.02, -0.08, 0.03], spread: [0.6, 0.5, 0.3] },
]
const platformDocuments: SceneDocument[] = [
  { kind: 'planner', position: [-1.51, 0.78, -0.51], width: 1.66, height: 2.01, rotation: [0, 0.1, 0.045], spread: [-1.1, 0.5, -0.5] },
  { kind: 'funds', position: [0.18, 1.61, -0.8], width: 1.78, height: 1.13, rotation: [0, -0.04, -0.03], spread: [0, 0.65, -0.5] },
  { kind: 'estimate', position: [2.06, 0.94, -0.3], width: 1.78, height: 1.13, rotation: [0.01, -0.1, -0.015], spread: [1, 0.5, -0.1] },
  { kind: 'audit', position: [-1.93, -0.8, 0.35], width: 1.72, height: 1.09, rotation: [0, 0.07, -0.025], spread: [-0.9, -0.5, 0.5] },
  { kind: 'entity', position: [2.1, -0.78, 0.29], width: 1.72, height: 1.09, rotation: [0, -0.08, 0.025], spread: [0.9, -0.5, 0.5] },
  { kind: 'platform', position: [0, -0.27, 1.4], width: 3.05, height: 1.94, rotation: [0, 0, 0], spread: [0, 0, 0.2] },
]

export default function Composition({ motion }: { motion: SceneMotion }) {
  const ref = useRef<Group>(null)
  const elapsed = useRef(0)
  const angle = motion.variant === 'platform' ? -0.3 : -0.6
  useFrame((state, delta) => {
    if (!ref.current || motion.reduced) return
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt
    const t = elapsed.current
    const progress = MathUtils.clamp(motion.progress.get(), 0, 1)
    const pointerX = motion.mobile ? 0 : MathUtils.clamp(state.pointer.x, -1, 1)
    const pointerY = motion.mobile ? 0 : MathUtils.clamp(state.pointer.y, -1, 1)
    ref.current.rotation.y = MathUtils.damp(ref.current.rotation.y, angle + pointerX * 0.08 + Math.sin(t * 0.11) * 0.035 + (progress - 0.5) * 0.12, 3, dt)
    ref.current.rotation.x = MathUtils.damp(ref.current.rotation.x, 0.23 - pointerY * 0.045 + (progress - 0.5) * 0.06, 3, dt)
    ref.current.position.z = MathUtils.damp(ref.current.position.z, motion.variant === 'hero' ? -(progress - 0.35) * 0.65 : 0, 3, dt)
  })
  const documents = motion.variant === 'hero' ? heroDocuments : motion.variant === 'workspace' ? workspaceDocuments : platformDocuments
  return <group ref={ref} rotation={[0.23, angle, -0.07]} scale={motion.mobile ? 0.9 : 1.02}>
    <GlassSlab position={[0.2, 0.06, -1.32]} scale={[3.25, 3.5, 0.16]} rotation={[0.01, 0.08, 0.09]} mobile={motion.mobile} />
    {documents.map((document, index) => <DocumentPanel key={document.kind} {...document} index={index} motion={motion} />)}
    <GlassSlab position={[0.1, -2.05, -0.15]} scale={[motion.variant === 'platform' ? 5.2 : 4.2, 0.14, 2.2]} rotation={[0.03, 0.04, 0]} mobile={motion.mobile} />
    {!motion.mobile && <GlassSlab position={[-1.98, 1.96, -0.8]} scale={[0.26, 0.7, 0.3]} rotation={[0.1, 0.3, 0.05]} />}
  </group>
}
