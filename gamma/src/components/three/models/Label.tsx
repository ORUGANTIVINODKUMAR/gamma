import { useMemo } from 'react'
import { DoubleSide, MeshBasicMaterial } from 'three'
import { unitPlane } from '@/lib/three/geometry'
import { labelTexture, type LabelOpts } from '@/lib/three/textures'
import type { GroupProps } from './Document'

export interface LabelProps extends GroupProps, LabelOpts {
  text: string
  /** World height of the plane; width follows the text's aspect ratio. */
  height?: number
  opacity?: number
}

/** Flat text plane that lives in the 3D scene (used for form names, Q1…Q4, entity names). */
export function Label3D({ text, height = 0.22, opacity = 1, size, color, weight, serif, bg, pad, align, ...group }: LabelProps) {
  const { tex, aspect } = labelTexture(text, { size, color, weight, serif, bg, pad, align })
  const mat = useMemo(() => new MeshBasicMaterial({ map: tex, transparent: true, opacity, side: DoubleSide, depthWrite: false, toneMapped: false }), [tex, opacity])
  return (
    <group {...group}>
      <mesh geometry={unitPlane()} material={mat} scale={[height * aspect, height, 1]} />
    </group>
  )
}
