import { useEffect, useRef, useState } from 'react'
import { useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { gentleSpring } from '../animations/motion'

export function useSceneMotion() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [tabActive, setTabActive] = useState(!document.hidden)
  const reduced = !!useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const progress = useSpring(scrollYProgress, gentleSpring)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting)
      if (entry.isIntersecting) setLoaded(true)
    }, { rootMargin: '60px' })
    if (ref.current) observer.observe(ref.current)
    const change = () => setTabActive(!document.hidden)
    document.addEventListener('visibilitychange', change)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', change) }
  }, [])
  return { ref, active: visible && tabActive, loaded, reduced, progress }
}
