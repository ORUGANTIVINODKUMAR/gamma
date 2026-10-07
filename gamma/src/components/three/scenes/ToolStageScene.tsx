import { useFrame } from '@react-three/fiber'
import { useRef, type ComponentType } from 'react'
import type { ToolId } from '@/config/tools'
import { useSceneQuality } from '@/lib/three/quality'
import { easeInOut } from '@/lib/three/math'
import { CursorParallax } from '../camera/CursorParallax'
import { GroundShadow } from '../lighting/StudioLighting'
import { BlobShadow, Plinth } from '../models/Plinth'
import { TOOL_OBJECTS } from '../tools/registry'
import type { ToolObjectProps } from '../tools/MutualFundObject'
import SceneCanvas from '../core/SceneCanvas'
import { DocumentPoster } from '../core/SceneBoundary'

/** Drives a looping 0 → 1 → hold → 0 cycle so an idle tool object keeps demonstrating itself. */
function useLoopProgress(period = 9) {
  const progress = useRef(0)
  const { reduceMotion } = useSceneQuality()
  useFrame(({ clock }) => {
    if (reduceMotion) {
      progress.current = 1
      return
    }
    const t = (clock.elapsedTime % period) / period
    // ramp up over the first 55%, hold, then ease back down
    progress.current = t < 0.55 ? easeInOut(t / 0.55) : t < 0.85 ? 1 : 1 - easeInOut((t - 0.85) / 0.15)
  })
  return progress
}

/** Tool-specific inputs for the object (e.g. quarterly lift, tax slabs) — derived from the live calculation. */
export type StageData = Record<string, unknown>

function Stage({ toolId, progress: external, data }: { toolId: ToolId; progress?: { current: number }; data?: StageData }) {
  const spec = TOOL_OBJECTS[toolId]
  const loop = useLoopProgress()
  const { quality, degraded } = useSceneQuality()
  const Obj = spec.Component as ComponentType<ToolObjectProps & StageData>
  return (
    <>
      <CursorParallax strength={0.2}>
        <group scale={spec.scale} position={[0, -0.7, 0]} rotation={[0, -0.42, 0]}>
          <Plinth radius={spec.plinth} />
          <Obj progress={external ?? loop} {...data} />
        </group>
      </CursorParallax>
      <GroundShadow y={-0.95} scale={9} />
      {(quality !== 'high' || degraded) && <BlobShadow position={[0, -0.94, 0]} size={5} />}
    </>
  )
}

/** One tool's 3D identity on its pedestal: used in each tool's page header. */
export default function ToolStageScene({ toolId, progress, data, className }: { toolId: ToolId; progress?: { current: number }; data?: StageData; className?: string }) {
  return (
    <SceneCanvas
      className={className}
      label={`Three-dimensional illustration of the ${toolId.replace('-', ' ')} tool`}
      camera={{ position: [0, 2.3, 9.4], fov: 32 }}
      fallback={<DocumentPoster />}
    >
      <Stage toolId={toolId} progress={progress} data={data} />
    </SceneCanvas>
  )
}
