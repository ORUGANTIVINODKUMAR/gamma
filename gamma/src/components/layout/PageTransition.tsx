import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { PageLoader } from '@/components/ui/primitives'
import { usePreferences } from '@/context/PreferencesContext'
import { EASE_PREMIUM } from '@/lib/motion'
import { scrollToId, scrollToTop } from './SmoothScroll'

/**
 * Route outlet with a short fade / lift / blur-to-clear transition. The old
 * page exits (~200ms), scroll resets, then the new page settles in (~380ms).
 */
export function AnimatedOutlet({ className }: { className?: string }) {
  const location = useLocation()
  const outlet = useOutlet()
  const { reduceMotion } = usePreferences()

  // Deep links with a hash (/#tools, /platform#security) scroll after the page mounts.
  const hashTarget = location.hash ? `${location.pathname}${location.hash}` : ''
  useEffect(() => {
    if (!hashTarget) return
    const id = decodeURIComponent(hashTarget.slice(hashTarget.indexOf('#') + 1))
    const t = window.setTimeout(() => scrollToId(id), reduceMotion ? 0 : 420)
    return () => window.clearTimeout(t)
  }, [hashTarget, reduceMotion])

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => !location.hash && scrollToTop()}>
      <motion.div
        key={location.pathname}
        className={className}
        // A soft depth shift: the old page pulls back and away, the new one settles in from just in front.
        style={{ transformOrigin: '50% 30%' }}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.018, y: 10, filter: 'blur(7px)' }}
        animate={
          reduceMotion
            ? { opacity: 1, transition: { duration: 0.15 } }
            : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.42, ease: EASE_PREMIUM }, transitionEnd: { filter: 'none', transform: 'none' } }
        }
        exit={
          reduceMotion
            ? { opacity: 0, transition: { duration: 0.1 } }
            : { opacity: 0, scale: 0.985, y: -6, filter: 'blur(5px)', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }
        }
      >
        <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
      </motion.div>
    </AnimatePresence>
  )
}
