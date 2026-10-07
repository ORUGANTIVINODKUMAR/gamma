import { CanvasTexture } from 'three'

let cached: CanvasTexture | null = null

/** Soft round sprite shared by every Points material (one tiny texture, created once). */
export function getSoftSprite() {
  if (cached) return cached
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.7)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  cached = new CanvasTexture(c)
  return cached
}
