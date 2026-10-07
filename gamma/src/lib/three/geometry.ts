import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * Geometry cache. Every mesh of the same shape shares one BufferGeometry, and
 * all of it is freed together via `disposeGeometries()` (called with the
 * shared materials when the last canvas unmounts).
 */

const cache = new Map<string, THREE.BufferGeometry>()

function memo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = cache.get(key) as T | undefined
  if (!g) {
    g = make()
    cache.set(key, g)
  }
  return g
}

export function disposeGeometries() {
  cache.forEach((g) => g.dispose())
  cache.clear()
}

/** Unit box — scale the mesh to size. Right for flat sheets where radius is irrelevant. */
export const unitBox = () => memo('box', () => new THREE.BoxGeometry(1, 1, 1))

/** Beveled box at its real size (so the bevel radius stays true). */
export const roundedBox = (w: number, h: number, d: number, r = 0.04, seg = 2) =>
  memo(`rbox:${w}:${h}:${d}:${r}:${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)))

export const cylinder = (rTop: number, rBottom: number, h: number, seg = 40) =>
  memo(`cyl:${rTop}:${rBottom}:${h}:${seg}`, () => new THREE.CylinderGeometry(rTop, rBottom, h, seg))

export const unitPlane = () => memo('plane', () => new THREE.PlaneGeometry(1, 1))

export const ring = (inner: number, outer: number, seg = 64) => memo(`ring:${inner}:${outer}:${seg}`, () => new THREE.RingGeometry(inner, outer, seg))

/** Heater-shield silhouette, extruded with a soft bevel. `inset` shrinks it for the inner face. */
export function shieldGeometry(scale = 1, depth = 0.2, bevel = 0.06) {
  return memo(`shield:${scale}:${depth}:${bevel}`, () => {
    const s = new THREE.Shape()
    s.moveTo(0, 0.95)
    s.bezierCurveTo(0.25, 0.78, 0.55, 0.72, 0.8, 0.72)
    s.lineTo(0.8, 0.1)
    s.bezierCurveTo(0.8, -0.5, 0.4, -0.8, 0, -0.95)
    s.bezierCurveTo(-0.4, -0.8, -0.8, -0.5, -0.8, 0.1)
    s.lineTo(-0.8, 0.72)
    s.bezierCurveTo(-0.55, 0.72, -0.25, 0.78, 0, 0.95)
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 28 })
    g.scale(scale, scale, 1)
    g.translate(0, 0, -depth / 2)
    return g
  })
}

/** Check mark as a thick polygon, extruded. */
export function checkGeometry() {
  return memo('check', () => {
    const s = new THREE.Shape()
    s.moveTo(-0.36, -0.02)
    s.lineTo(-0.27, 0.07)
    s.lineTo(-0.13, -0.07)
    s.lineTo(0.27, 0.33)
    s.lineTo(0.36, 0.24)
    s.lineTo(-0.13, -0.25)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 })
    g.translate(0, 0, -0.025)
    return g
  })
}

/** Outline of a thin pane — gives clear acrylic and glass a defined edge against a pale backdrop. */
export const paneEdges = (w: number, h: number, d = 0.02) => memo(`edges:${w}:${h}:${d}`, () => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)))
