import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BufferAttribute, BufferGeometry } from 'three'
import type { Group } from 'three'
import { getSoftSprite } from './sprite'

interface Props {
  count?: number
  spread?: [number, number, number]
  size?: number
  color?: string
  opacity?: number
  animate?: boolean
}

/** A small, slowly drifting dust of champagne particles (single Points draw call). */
export default function FloatingParticles({
  count = 120,
  spread = [7, 5, 4],
  size = 0.05,
  color = '#d3b574',
  opacity = 0.7,
  animate = true,
}: Props) {
  const group = useRef<Group>(null)
  const [sx, sy, sz] = spread

  const geometry = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * sx
      arr[i * 3 + 1] = (Math.random() - 0.5) * sy
      arr[i * 3 + 2] = (Math.random() - 0.5) * sz
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(arr, 3))
    return g
  }, [count, sx, sy, sz])

  useFrame(({ clock }) => {
    if (!animate || !group.current) return
    const t = clock.elapsedTime
    group.current.rotation.y = t * 0.012
    group.current.position.y = Math.sin(t * 0.25) * 0.12
  })

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <pointsMaterial
          map={getSoftSprite()}
          size={size}
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
