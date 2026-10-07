import { useEffect, useRef, type RefObject } from 'react'

/**
 * Turns scroll position into a continuous scene index for a scroll-driven story.
 *
 * Sections inside `root` carry `data-scene="0…n"`. The index is the section
 * under the viewport centre plus how far through it the centre has travelled,
 * so it moves continuously (0 → n) rather than jumping between sections. It is
 * written to the returned ref (read by the WebGL scene each frame) and to a
 * `--scene` CSS variable on `root` (for DOM effects) — never to React state.
 */
export function useStory(root: RefObject<HTMLElement | null>): { current: number } {
  const story = useRef(0)

  useEffect(() => {
    const el = root.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const sections = el.querySelectorAll<HTMLElement>('[data-scene]')
      if (!sections.length) return
      const mid = window.innerHeight * 0.5
      let value = 0
      const last = sections.length - 1
      for (let i = 0; i < sections.length; i++) {
        const r = sections[i]!.getBoundingClientRect()
        if (mid >= r.top && mid < r.bottom) {
          value = i + (mid - r.top) / Math.max(1, r.height)
          break
        }
        if (mid >= r.bottom) value = i + 1
      }
      value = Math.min(last, Math.max(0, value))
      story.current = value
      el.style.setProperty('--scene', value.toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // sections may change height as fonts load
    const ro = new ResizeObserver(onScroll)
    ro.observe(el)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      ro.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [root])

  return story
}
