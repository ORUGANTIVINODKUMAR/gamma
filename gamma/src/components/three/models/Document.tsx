import type { ThreeElements } from '@react-three/fiber'
import { useMemo } from 'react'
import type { Texture } from 'three'
import { unitBox } from '@/lib/three/geometry'
import { getMaterials, paperMaterial, texturedPaper } from '@/lib/three/materials'
import type { FormKind } from '@/lib/three/textures'

export type GroupProps = ThreeElements['group']

export const DOC_W = 1.6
export const DOC_H = 2.07
export const DOC_T = 0.03

export interface DocumentProps extends GroupProps {
  kind?: FormKind
  accent?: string
  stamp?: string
  /** Custom printed face (e.g. quarter sheets). Overrides `kind`. */
  texture?: Texture
  textureKey?: string
  w?: number
  h?: number
}

/**
 * A single printed tax form: a thin paper slab whose front face carries a
 * procedurally drawn form. Geometry and materials are shared across all sheets.
 */
export function Document({ kind = 'blank', accent, stamp, texture, textureKey, w = DOC_W, h = DOC_H, ...group }: DocumentProps) {
  const m = getMaterials()
  const front = texture ? texturedPaper(textureKey ?? texture.uuid, texture) : paperMaterial(kind, { accent, stamp })
  const materials = useMemo(() => [m.paper, m.paper, m.paper, m.paper, front, m.paper], [m, front])
  return (
    <group {...group}>
      <mesh geometry={unitBox()} material={materials} scale={[w, h, DOC_T]} />
    </group>
  )
}
