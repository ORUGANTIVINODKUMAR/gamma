import Lenis from 'lenis'
import { useEffect } from 'react'
import { usePreferences } from '@/context/PreferencesContext'

let instance: Lenis | null = null

export const getLenis = (): Lenis | null => instance

/**
 * Lenis smooth scrolling for wheel input. Native scrolling is kept for touch,
 * keyboard and assistive tech, and Lenis is disabled entirely for users who
 * prefer reduced motion or turn it off in Settings.
 */
export function SmoothScroll() {
  const { prefs, reduceMotion } = usePreferences()
  const enabled = prefs.smoothScroll && !reduceMotion

  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    })
    instance = lenis
    return () => {
      lenis.destroy()
      instance = null
    }
  }, [enabled])

  return null
}

export function scrollToTop(): void {
  if (instance) instance.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
}

/** Smooth-scroll to an element id, offset for the fixed navbar. */
export function scrollToId(id: string, offset = -88): void {
  const el = document.getElementById(id)
  if (!el) return
  if (instance) {
    instance.scrollTo(el, { offset, duration: 1.2 })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
  }
  // Move focus for keyboard and screen-reader users without a second jump.
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
