import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useIsMobile, useReducedMotion } from '../../hooks/useReducedMotion'

interface Props {
  children: ReactNode
  camera?: { position: [number, number, number]; fov: number }
  className?: string
}

/**
 * Canvas wrapper that stops rendering while off-screen, caps device pixel ratio,
 * and renders on demand for reduced-motion users.
 */
export default function SceneCanvas({ children, camera = { position: [0, 0, 6], fov: 35 }, className }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const mobile = useIsMobile()
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={host} className={className} aria-hidden="true">
      <Canvas
        frameloop={!visible ? 'never' : reduced ? 'demand' : 'always'}
        dpr={mobile ? [1, 1.25] : [1, 1.5]}
        camera={camera}
        gl={{ alpha: true, antialias: !mobile, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        {children}
      </Canvas>
    </div>
  )
}
