import * as THREE from 'three'
import { PALETTE } from './palette'
import { disposeGeometries } from './geometry'
import { disposeTextures, formTexture, type FormKind } from './textures'

/**
 * Shared premium material set. One instance of each is reused by every mesh in
 * every scene, so the GPU compiles each shader once. Disposed together when the
 * last canvas unmounts (see SceneCanvas).
 */

export interface MaterialSet {
  /** Primary surfaces — warm pearl ceramic with a soft clearcoat. */
  pearl: THREE.MeshPhysicalMaterial
  /** Structural objects — matte ceramic. */
  ceramic: THREE.MeshPhysicalMaterial
  /** Small premium accents — brushed silver metal. */
  silver: THREE.MeshPhysicalMaterial
  /** Enamel in the brand sapphire. */
  sapphire: THREE.MeshPhysicalMaterial
  sapphireDeep: THREE.MeshPhysicalMaterial
  /** Ink-dark glass for displays and frames. */
  ink: THREE.MeshPhysicalMaterial
  /** Frosted translucent panes. */
  glass: THREE.MeshPhysicalMaterial
  /** Clear acrylic for layered data elements. */
  acrylic: THREE.MeshPhysicalMaterial
  /** Plain matte paper — sheet edges and backs. */
  paper: THREE.MeshStandardMaterial
  /** Hairline for glass and acrylic edges. */
  edge: THREE.LineBasicMaterial
  /** Unlit translucent sapphire — scan planes and highlights. */
  scan: THREE.MeshBasicMaterial
}

/** Slightly under-white so printed paper keeps headroom under bright studio light. */
const PAPER_TINT = '#f1efe9'

let set: MaterialSet | null = null
const paperCache = new Map<string, THREE.MeshStandardMaterial>()
let refs = 0

function build(): MaterialSet {
  return {
    pearl: new THREE.MeshPhysicalMaterial({
      color: PALETTE.pearl,
      roughness: 0.38,
      metalness: 0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
      sheen: 0.4,
      sheenColor: new THREE.Color('#ffffff'),
      sheenRoughness: 0.5,
    }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: PALETTE.ceramic, roughness: 0.72, metalness: 0, clearcoat: 0.1 }),
    silver: new THREE.MeshPhysicalMaterial({ color: '#d4dae2', roughness: 0.3, metalness: 1, clearcoat: 0.2 }),
    sapphire: new THREE.MeshPhysicalMaterial({ color: PALETTE.sapphire, roughness: 0.26, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 }),
    sapphireDeep: new THREE.MeshPhysicalMaterial({ color: PALETTE.sapphireDeep, roughness: 0.3, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    ink: new THREE.MeshPhysicalMaterial({ color: '#16213a', roughness: 0.18, metalness: 0.2, clearcoat: 1 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: PALETTE.glass,
      roughness: 0.22,
      metalness: 0,
      transparent: true,
      opacity: 0.42,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.4,
      depthWrite: false,
    }),
    acrylic: new THREE.MeshPhysicalMaterial({
      color: '#dfe9f8',
      roughness: 0.06,
      metalness: 0,
      transparent: true,
      opacity: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.6,
      depthWrite: false,
    }),
    paper: new THREE.MeshStandardMaterial({ color: PAPER_TINT, roughness: 0.85, metalness: 0 }),
    edge: new THREE.LineBasicMaterial({ color: '#7f9bc9', transparent: true, opacity: 0.9 }),
    scan: new THREE.MeshBasicMaterial({ color: PALETTE.sapphire, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }),
  }
}

export function getMaterials(): MaterialSet {
  return (set ??= build())
}

/** Paper sheet material for a given form (printed face, matte). */
export function paperMaterial(kind: FormKind, opts: { accent?: string; stamp?: string } = {}): THREE.MeshStandardMaterial {
  const key = `${kind}:${opts.accent ?? ''}:${opts.stamp ?? ''}`
  let m = paperCache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ map: formTexture(kind, opts), color: PAPER_TINT, roughness: 0.82, metalness: 0 })
    paperCache.set(key, m)
  }
  return m
}

/** Any custom texture as a paper-like face (used for quarter sheets). */
export function texturedPaper(key: string, map: THREE.Texture): THREE.MeshStandardMaterial {
  let m = paperCache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ map, color: PAPER_TINT, roughness: 0.82, metalness: 0 })
    paperCache.set(key, m)
  }
  return m
}

let disposeTimer: ReturnType<typeof setTimeout> | undefined

/** Called by every canvas on mount. */
export function retainMaterials() {
  refs++
  clearTimeout(disposeTimer)
}

/**
 * Called by every canvas on unmount. Shared GPU resources (materials and
 * canvas textures) are freed once no canvas remains — after a short grace
 * period so route hand-offs and StrictMode remounts don't thrash the GPU.
 */
export function releaseMaterials() {
  if (--refs > 0) return
  refs = 0
  clearTimeout(disposeTimer)
  disposeTimer = setTimeout(() => {
    if (refs > 0) return
    if (set) Object.values(set).forEach((m) => m.dispose())
    set = null
    paperCache.forEach((m) => m.dispose())
    paperCache.clear()
    disposeTextures()
    disposeGeometries()
  }, 1500)
}
