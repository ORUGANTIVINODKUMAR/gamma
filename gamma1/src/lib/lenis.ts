import type Lenis from 'lenis'

/** Shared Lenis instance so any component can trigger smooth anchor scrolling. */
let instance: Lenis | null = null

export const setLenis = (l: Lenis | null) => {
  instance = l
}

export function scrollToTop() {
  if (instance) instance.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

export function scrollToTarget(target: string | number) {
  if (instance) {
    instance.scrollTo(target, { offset: typeof target === 'string' && target !== '#top' ? -8 : 0, duration: 1.6 })
    return
  }
  if (typeof target === 'number') return window.scrollTo({ top: target, behavior: 'smooth' })
  const el = target === '#top' ? document.body : document.querySelector(target)
  if (target === '#top') window.scrollTo({ top: 0, behavior: 'smooth' })
  else el?.scrollIntoView({ behavior: 'smooth' })
}
