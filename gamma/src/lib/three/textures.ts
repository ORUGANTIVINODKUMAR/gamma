import * as THREE from 'three'
import { PALETTE } from './palette'

/**
 * Procedural canvas textures for the 3D tax documents. Everything is drawn
 * with 2D canvas — no image downloads — and cached by key. Text is redrawn
 * once the web fonts finish loading so first paint never shows fallback type.
 */

const SANS = '"Manrope Variable", "Inter Variable", system-ui, sans-serif'
const SERIF = '"Instrument Serif", Georgia, serif'

interface Entry {
  tex: THREE.CanvasTexture
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  ctx: CanvasRenderingContext2D
  w: number
  h: number
}
const cache = new Map<string, Entry>()
let fontsRedrawn = false

function redrawAll() {
  for (const e of cache.values()) {
    e.ctx.clearRect(0, 0, e.w, e.h)
    e.draw(e.ctx, e.w, e.h)
    e.tex.needsUpdate = true
  }
}

function whenFontsReady() {
  if (fontsRedrawn || typeof document === 'undefined' || !document.fonts) return
  fontsRedrawn = true
  void Promise.all([
    document.fonts.load(`800 40px ${SANS}`),
    document.fonts.load(`700 40px ${SANS}`),
    document.fonts.load(`500 40px ${SANS}`),
    document.fonts.load(`400 40px ${SERIF}`),
  ])
    .catch(() => undefined)
    .then(redrawAll)
}

function make(key: string, w: number, h: number, draw: Entry['draw']): THREE.CanvasTexture {
  const hit = cache.get(key)
  if (hit) return hit.tex
  whenFontsReady()
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  cache.set(key, { tex, draw, ctx, w, h })
  return tex
}

export function disposeTextures() {
  for (const e of cache.values()) e.tex.dispose()
  cache.clear()
  fontsRedrawn = false
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/* ── Tax forms ──────────────────────────────────────────────────────────── */

export interface FormSpec {
  /** Big form number, e.g. "1040". */
  code: string
  title: string
  sub?: string
  sections: string[]
  stamp?: string
}

export const FORMS = {
  f1040: { code: '1040', title: 'U.S. Individual Income Tax Return', sub: 'Department of the Treasury', sections: ['Income', 'Deductions', 'Credits', 'Schedule C'] },
  f1099: { code: '1099', title: 'Dividends and Distributions', sub: 'Mutual fund statement', sections: ['Ordinary dividends', 'Qualified dividends', 'Capital gain distributions'] },
  schedD: { code: 'D', title: 'Capital Gains and Losses', sub: 'Schedule D (Form 1040)', sections: ['Short-term', 'Long-term', 'Carryover'] },
  schC: { code: 'C', title: 'Profit or Loss From Business', sub: 'Schedule C (Form 1040)', sections: ['Gross receipts', 'Expenses', 'Net profit'] },
  f1120s: { code: '1120-S', title: 'U.S. Income Tax Return for an S Corporation', sub: 'Department of the Treasury', sections: ['Ordinary income', 'Shareholder wages', 'Distributions'] },
  plan: { code: 'PLAN', title: 'Tax Plan', sub: 'Projection and strategy', sections: ['Income', 'Deductions', 'Strategies', 'Outlook'] },
  report: { code: 'RPT', title: 'Client Report', sub: 'Prepared by Tapreco', sections: ['Summary', 'Assumptions', 'Detail'] },
  blank: { code: '', title: '', sub: '', sections: ['', '', '', ''] },
} satisfies Record<string, FormSpec>

export type FormKind = keyof typeof FORMS

const W = 640
const H = 830

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy)
      line = w
      yy += lh
    } else line = test
  }
  if (line) ctx.fillText(line, x, yy)
}

function paperBase(ctx: CanvasRenderingContext2D, accent: string) {
  ctx.fillStyle = PALETTE.paper
  ctx.fillRect(0, 0, W, H)
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, 'rgba(255,255,255,0.7)')
  g.addColorStop(1, 'rgba(226,222,212,0.35)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, W, 12)
}

function drawForm(ctx: CanvasRenderingContext2D, spec: FormSpec, accent: string) {
  const pad = 44
  paperBase(ctx, accent)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = PALETTE.ink
  if (spec.code) {
    ctx.font = `800 ${spec.code.length > 3 ? 74 : 112}px ${SANS}`
    ctx.fillText(spec.code, pad, 140)
  }
  ctx.fillStyle = PALETTE.slate
  ctx.font = `700 25px ${SANS}`
  wrap(ctx, spec.title, pad, 190, W - pad * 2, 32)
  if (spec.sub) {
    ctx.fillStyle = PALETTE.steel
    ctx.font = `500 20px ${SANS}`
    ctx.fillText(spec.sub, pad, 262)
  }
  ctx.strokeStyle = 'rgba(15,23,42,0.14)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(pad, 284)
  ctx.lineTo(W - pad, 284)
  ctx.stroke()

  const count = Math.max(1, spec.sections.length)
  const rowH = Math.min(150, (H - 330 - 70) / count)
  spec.sections.forEach((label, i) => {
    const y = 316 + i * rowH
    ctx.fillStyle = accent
    roundRect(ctx, pad, y, 6, rowH - 32, 3)
    ctx.fill()
    ctx.fillStyle = PALETTE.slate
    ctx.font = `700 20px ${SANS}`
    ctx.fillText(label.toUpperCase(), pad + 22, y + 22)
    ctx.fillStyle = 'rgba(100,116,139,0.22)'
    const widths = [0.62, 0.48, 0.55]
    for (let k = 0; k < 2; k++) {
      roundRect(ctx, pad + 22, y + 40 + k * 22, (W - pad * 2 - 170) * (widths[(i + k) % 3] ?? 0.5), 10, 5)
      ctx.fill()
    }
    ctx.strokeStyle = 'rgba(15,23,42,0.22)'
    ctx.lineWidth = 2
    roundRect(ctx, W - pad - 130, y + 6, 130, rowH - 44, 8)
    ctx.stroke()
    ctx.fillStyle = 'rgba(15,23,42,0.28)'
    roundRect(ctx, W - pad - 108, y + (rowH - 44) / 2 - 2, 86, 12, 6)
    ctx.fill()
  })

  if (spec.stamp) {
    ctx.save()
    ctx.translate(W - 190, H - 96)
    ctx.rotate(-0.12)
    ctx.strokeStyle = accent
    ctx.fillStyle = accent
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 4
    roundRect(ctx, -86, -28, 172, 56, 10)
    ctx.stroke()
    ctx.font = `800 24px ${SANS}`
    ctx.textAlign = 'center'
    ctx.fillText(spec.stamp, 0, 9)
    ctx.restore()
  }
}

export function formTexture(kind: FormKind, opts: { accent?: string; stamp?: string } = {}): THREE.CanvasTexture {
  const accent = opts.accent ?? PALETTE.sapphire
  const key = `form:${kind}:${accent}:${opts.stamp ?? ''}`
  return make(key, W, H, (ctx) => drawForm(ctx, { ...FORMS[kind], stamp: opts.stamp }, accent))
}

/** Quarterly estimated-payment sheet: a huge Q-number and its due date. */
export function quarterTexture(q: 1 | 2 | 3 | 4, due: string): THREE.CanvasTexture {
  return make(`quarter:${q}:${due}`, W, H, (ctx) => {
    paperBase(ctx, PALETTE.sapphire)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = PALETTE.steel
    ctx.font = `700 22px ${SANS}`
    ctx.fillText('FORM 1040-ES', 44, 66)
    ctx.fillStyle = PALETTE.ink
    ctx.font = `400 300px ${SERIF}`
    ctx.fillText(`Q${q}`, 34, 400)
    ctx.fillStyle = PALETTE.slate
    ctx.font = `700 26px ${SANS}`
    ctx.fillText('Estimated payment', 44, 470)
    ctx.fillStyle = PALETTE.steel
    ctx.font = `500 24px ${SANS}`
    ctx.fillText(`Due ${due}`, 44, 506)
    ctx.fillStyle = 'rgba(100,116,139,0.2)'
    for (let i = 0; i < 4; i++) {
      roundRect(ctx, 44, 560 + i * 36, 380 - (i % 2) * 90, 12, 6)
      ctx.fill()
    }
    ctx.strokeStyle = 'rgba(15,23,42,0.22)'
    ctx.lineWidth = 2
    roundRect(ctx, 44, H - 120, W - 88, 66, 12)
    ctx.stroke()
    ctx.fillStyle = 'rgba(37,99,235,0.18)'
    roundRect(ctx, 64, H - 99, 160, 24, 12)
    ctx.fill()
  })
}

/* ── Labels ─────────────────────────────────────────────────────────────── */

export interface LabelOpts {
  size?: number
  color?: string
  weight?: number
  serif?: boolean
  bg?: string
  pad?: number
  align?: 'left' | 'center'
}

/** Text on a transparent (or tinted) plane. Returns the texture and its aspect ratio. */
export function labelTexture(text: string, opts: LabelOpts = {}): { tex: THREE.CanvasTexture; aspect: number } {
  const { size = 64, color = PALETTE.ink, weight = 700, serif = false, bg, pad = 28, align = 'center' } = opts
  const key = `label:${text}:${size}:${color}:${weight}:${serif}:${bg ?? ''}:${pad}:${align}`
  const measure = document.createElement('canvas').getContext('2d')!
  const font = `${serif ? 400 : weight} ${size}px ${serif ? SERIF : SANS}`
  measure.font = font
  const w = Math.ceil(measure.measureText(text).width + pad * 2)
  const h = Math.ceil(size * 1.5 + pad)
  const tex = make(key, w, h, (ctx) => {
    if (bg) {
      ctx.fillStyle = bg
      roundRect(ctx, 0, 0, w, h, h / 2)
      ctx.fill()
    }
    ctx.font = font
    ctx.fillStyle = color
    ctx.textBaseline = 'middle'
    ctx.textAlign = align === 'center' ? 'center' : 'left'
    ctx.fillText(text, align === 'center' ? w / 2 : pad, h / 2 + size * 0.04)
  })
  return { tex, aspect: w / h }
}

/** Soft radial shadow used as a cheap grounding blob on low-quality devices. */
export function blobTexture(): THREE.CanvasTexture {
  return make('blob', 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(15,23,42,0.34)')
    g.addColorStop(0.5, 'rgba(15,23,42,0.12)')
    g.addColorStop(1, 'rgba(15,23,42,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

/** Pixel band (top/bottom, in the form texture) of section `i` of `count` — lets 3D highlights line up with the printed rows. */
export function formRowBand(count: number, i: number): { top: number; bottom: number; height: number; width: number } {
  const rowH = Math.min(150, (H - 330 - 70) / Math.max(1, count))
  const top = 316 + i * rowH - 6
  return { top, bottom: top + rowH - 20, height: H, width: W }
}
