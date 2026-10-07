import { MathUtils } from 'three'

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3)
export const lerp = MathUtils.lerp
export const damp = MathUtils.damp

/** Sub-range of a 0..1 progress, eased: 0 before `a`, 1 after `b`. */
export const span = (p: number, a: number, b: number) => easeInOut(clamp01((p - a) / (b - a)))
