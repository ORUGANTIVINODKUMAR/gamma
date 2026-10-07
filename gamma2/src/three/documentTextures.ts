import { CanvasTexture, SRGBColorSpace } from 'three'
import type { DocumentKind } from './types'

const labels: Record<DocumentKind, [string, string]> = {
  planner: ['Tax Planner', 'See beyond the tax return.'],
  funds: ['Mutual Funds', 'Investment tax perspective'],
  estimate: ['Estimated Tax', 'A clearer view of what’s ahead'],
  audit: ['Audit Review', 'A closer look. A considered review.'],
  entity: ['Entity Comparison', 'Schedule C / S Corporation'],
  client: ['Client Profile', 'Every detail. In context.'],
  opportunities: ['Planning Opportunities', 'Consider the possibilities.'],
  platform: ['Tapreco', 'One intelligent platform.'],
  form: ['1040', 'FEDERAL / INDIVIDUAL TAX RETURN'],
}

export function createDocumentTexture(kind: DocumentKind, mobile: boolean) {
  const portrait = ['planner', 'client', 'form'].includes(kind)
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = portrait ? 1240 : 650
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height
  ctx.fillStyle = kind === 'platform' ? '#edf4ff' : '#fcfdff'
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, 30); ctx.fill()
  ctx.fillStyle = '#dceaf9'
  ctx.beginPath(); ctx.roundRect(61, 61, 65, 65, 15); ctx.fill()
  ctx.fillStyle = '#365d8d'; ctx.fillRect(77, 79, 33, 9); ctx.fillRect(89, 93, 10, 21)
  ctx.fillStyle = '#566c8b'; ctx.font = '600 24px "Manrope Variable", Arial'; ctx.fillText('TAPRECO', 149, 102)
  ctx.fillStyle = '#5d7797'; ctx.font = '500 19px "Manrope Variable", Arial'
  ctx.fillText(kind === 'planner' ? 'PLANNING WORKSPACE' : 'PROFESSIONAL TAX INTELLIGENCE', 149, 133)
  ctx.strokeStyle = '#e0e8f2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(61, 166); ctx.lineTo(w - 61, 166); ctx.stroke()
  ctx.fillStyle = '#233b5d'; ctx.font = `${kind === 'form' ? '500 135' : kind === 'platform' ? '600 83' : portrait ? '600 73' : '600 56'}px "Manrope Variable", Arial`
  ctx.fillText(labels[kind][0], 61, kind === 'form' ? 337 : portrait ? 292 : 271)
  ctx.fillStyle = '#6b83a3'; ctx.font = '400 29px "Manrope Variable", Arial'; ctx.fillText(labels[kind][1], 61, portrait ? 358 : 329)
  if (portrait) {
    const rows = kind === 'planner' ? ['Client profile', 'Tax summary', 'Planning opportunities', 'Deduction review'] : kind === 'client' ? ['Client information', 'Income sources', 'Business interests', 'Planning objectives'] : ['Filing information', 'Income', 'Adjustments & deductions', 'Federal tax review']
    rows.forEach((row, i) => {
      const y = 415 + i * 145
      ctx.fillStyle = i === 2 ? '#eaf3ff' : '#f2f6fc'
      ctx.beginPath(); ctx.roundRect(61, y, w - 122, 122, 16); ctx.fill()
      ctx.fillStyle = i === 2 ? '#7297c2' : '#b5cae3'
      ctx.beginPath(); ctx.roundRect(88, y + 31, 48, 48, 10); ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(101, y + 56); ctx.lineTo(111, y + 65); ctx.lineTo(124, y + 45); ctx.stroke()
      ctx.fillStyle = '#3d577a'; ctx.font = '500 28px "Manrope Variable", Arial'; ctx.fillText(row, 160, y + 52)
      ctx.fillStyle = '#c0d1e5'; ctx.beginPath(); ctx.roundRect(160, y + 73, 255 + i * 25, 6, 3); ctx.fill()
      ctx.strokeStyle = '#7899c0'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(889, y + 49); ctx.lineTo(900, y + 59); ctx.lineTo(889, y + 69); ctx.stroke()
    })
    ctx.fillStyle = '#294c7a'; ctx.beginPath(); ctx.roundRect(61, 1063, w - 122, 99, 16); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '500 27px "Manrope Variable", Arial'; ctx.fillText(kind === 'planner' ? 'Explore the possibilities' : kind === 'form' ? 'A professional perspective' : 'The whole client picture', 96, 1124)
  } else {
    ctx.fillStyle = kind === 'platform' ? '#dceafb' : '#edf4fc'; ctx.beginPath(); ctx.roundRect(61, 386, w - 122, 158, 17); ctx.fill()
    ctx.fillStyle = '#5b7da7'; ctx.font = '500 25px "Manrope Variable", Arial'
    const details = kind === 'entity' ? 'Compare structures. Consider the next step.' : kind === 'funds' ? 'Dividends / Distributions / Capital gains' : kind === 'audit' ? 'Review / Identify / Consider' : kind === 'estimate' ? 'Federal estimate / Withholding' : kind === 'platform' ? 'PLAN / CALCULATE / COMPARE / ANALYZE' : 'Scenario planning / Opportunity review'
    ctx.fillText(details, 93, 448)
    ctx.fillStyle = '#b9cee7'; ctx.beginPath(); ctx.roundRect(93, 479, 490, 7, 3); ctx.fill()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = mobile ? 2 : 4
  return texture
}
