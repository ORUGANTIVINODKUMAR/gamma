import { PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import * as THREE from 'three'
import { usePreferences } from '@/context/PreferencesContext'
import { useInViewport } from '@/hooks/useInViewport'
import { cn, withPosition } from '@/lib/cn'
import { attachInput } from '@/lib/three/input'
import { releaseMaterials, retainMaterials } from '@/lib/three/materials'
import { detectQuality, isCoarsePointer, SceneQualityContext, type SceneQuality } from '@/lib/three/quality'
import { StudioLighting } from '../lighting/StudioLighting'

export interface SceneCanvasProps {
  children: ReactNode
  /** Plain-language description for assistive tech (non-interactive scenes). */
  label: string
  camera?: { position: [number, number, number]; fov?: number }
  className?: string
  style?: CSSProperties
  /** Rendered beneath the canvas until the first frame, and if WebGL is lost. */
  fallback?: ReactNode
  /** Let the canvas receive pointer events (gallery). Otherwise it never blocks the page. */
  interactive?: boolean
  /** Lighting strength multiplier. */
  light?: number
  /** Skip the built-in studio lighting (the scene supplies its own). */
  bare?: boolean
  onReady?: () => void
}

/**
 * Flags `ready` after the first few frames have actually been drawn. It asks for
 * its own frames, so scenes in on-demand mode (reduced motion) still appear.
 */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const n = useRef(0)
  const invalidate = useThree((s) => s.invalidate)
  useFrame(() => {
    if (n.current >= 3) return
    n.current++
    if (n.current === 3) onReady()
    else invalidate()
  })
  return null
}

/** In reduced-motion mode the loop is on-demand; scroll and pointer ask for a frame. */
function DemandInvalidator({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!active) return
    let trailing: number | undefined
    // redraw now, and once more after scrolling settles so the final state is what stays on screen
    const ping = () => {
      invalidate()
      window.clearTimeout(trailing)
      trailing = window.setTimeout(invalidate, 120)
    }
    window.addEventListener('scroll', ping, { passive: true })
    window.addEventListener('resize', ping)
    ping()
    return () => {
      window.clearTimeout(trailing)
      window.removeEventListener('scroll', ping)
      window.removeEventListener('resize', ping)
    }
  }, [active, invalidate])
  return null
}

export default function SceneCanvas({
  children,
  label,
  camera = { position: [0, 0, 9], fov: 35 },
  className,
  style,
  fallback,
  interactive = false,
  light = 1,
  bare = false,
  onReady,
}: SceneCanvasProps) {
  const wrapper = useRef<HTMLDivElement>(null)
  const inView = useInViewport(wrapper, '160px')
  const { reduceMotion } = usePreferences()
  const base = useMemo(() => detectQuality(), [])
  const coarse = useMemo(() => isCoarsePointer(), [])
  const maxDpr = base === 'high' ? 2 : 1.5
  const [dpr, setDpr] = useState(Math.min(maxDpr, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1))
  const [degraded, setDegraded] = useState(false)
  const [ready, setReady] = useState(false)
  const [lost, setLost] = useState(false)
  // Typing always wins: pause rendering while a field is being edited, so a slow GPU never drops keystrokes.
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    let timer: number | undefined
    const hold = (ms: number) => {
      setTyping(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setTyping(false), ms)
    }
    const onInput = () => hold(450)
    // entering a field is the start of typing: keep the main thread free for select-on-focus
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) hold(350)
    }
    document.addEventListener('input', onInput, true)
    document.addEventListener('focusin', onFocusIn, true)
    return () => {
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('focusin', onFocusIn, true)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    retainMaterials()
    const detach = attachInput()
    return () => {
      detach()
      releaseMaterials()
    }
  }, [])

  const quality = useMemo<SceneQuality>(
    () => ({ quality: base === 'none' ? 'low' : base, dpr, degraded, reduceMotion, coarse }),
    [base, dpr, degraded, reduceMotion, coarse],
  )

  const showFallback = !ready || lost

  return (
    <div ref={wrapper} className={withPosition(className)} style={style}>
      <div
        aria-hidden={!showFallback}
        className={cn('absolute inset-0 transition-opacity duration-700 ease-premium', showFallback ? 'opacity-100' : 'pointer-events-none opacity-0')}
      >
        {fallback}
      </div>
      {!lost && (
        <Canvas
          aria-label={interactive ? undefined : label}
          aria-hidden={interactive || undefined}
          role={interactive ? undefined : 'img'}
          className={cn('transition-opacity duration-1000 ease-premium', ready ? 'opacity-100' : 'opacity-0')}
          style={{ position: 'absolute', inset: 0, pointerEvents: interactive ? 'auto' : 'none' }}
          frameloop={reduceMotion ? 'demand' : inView && !typing ? 'always' : 'never'}
          dpr={[1, dpr]}
          camera={{ position: camera.position, fov: camera.fov ?? 35, near: 0.1, far: 80 }}
          gl={{
            antialias: base === 'high',
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.NeutralToneMapping,
            toneMappingExposure: 1.05,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            const el = gl.domElement
            el.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              setLost(true)
            })
          }}
        >
          <SceneQualityContext.Provider value={quality}>
            <PerformanceMonitor
              flipflops={2}
              onDecline={() => setDegraded(true)}
              onChange={({ factor }) => setDpr(Math.max(0.75, Math.min(maxDpr, 0.75 + factor * (maxDpr - 0.75))))}
            />
            {!bare && <StudioLighting intensity={light} />}
            {children}
            <ReadySignal
              onReady={() => {
                setReady(true)
                onReady?.()
              }}
            />
            <DemandInvalidator active={reduceMotion} />
          </SceneQualityContext.Provider>
        </Canvas>
      )}
    </div>
  )
}
