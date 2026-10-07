import { createContext, useContext } from 'react'

/**
 * high — desktop GPUs: contact shadows, high DPR, full object detail.
 * low  — phones, tablets and constrained devices: blob shadows, capped DPR,
 *        reduced geometry segments, simplified camera motion.
 * none — no WebGL: callers render their static fallback.
 */
export type Quality = 'high' | 'low' | 'none'

export interface SceneQuality {
  quality: Quality
  /** Max device pixel ratio the canvas may use. */
  dpr: number
  /** True once the live performance monitor has stepped the scene down. */
  degraded: boolean
  /** Honour prefers-reduced-motion: render settled frames, no ambient motion. */
  reduceMotion: boolean
  /** Touch-first device: no hover, simplified camera. */
  coarse: boolean
}

export const SceneQualityContext = createContext<SceneQuality>({
  quality: 'low',
  dpr: 1,
  degraded: false,
  reduceMotion: false,
  coarse: false,
})

export const useSceneQuality = () => useContext(SceneQualityContext)

let webglSupport: boolean | null = null

export function canUseWebGL(): boolean {
  if (webglSupport !== null) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    webglSupport = !!gl
    // Release the probe context immediately; browsers cap live contexts.
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglSupport = false
  }
  return webglSupport
}

export function detectQuality(): Quality {
  if (typeof window === 'undefined' || !canUseWebGL()) return 'none'
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 900
  const weak =
    !!nav.connection?.saveData ||
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) ||
    (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4)
  return coarse || narrow || weak ? 'low' : 'high'
}

export function isCoarsePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}
