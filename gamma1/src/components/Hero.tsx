import { motion, useScroll, useTransform } from 'framer-motion'
import { Calculator, Compass, ScanSearch, TrendingUp } from 'lucide-react'
import { lazy, Suspense, useRef } from 'react'
import MagneticButton from './MagneticButton'
import { SplitReveal } from './Reveal'
import { EASE } from '../data/tools'
import { ROUTES } from '../lib/routes'
import { useReducedMotion } from '../hooks/useReducedMotion'

const GlobeScene = lazy(() => import('./GlobeScene'))

const CHIPS = [
  { label: 'Planning', Icon: Compass, cls: 'chip-1' },
  { label: 'Calculation', Icon: Calculator, cls: 'chip-2' },
  { label: 'Risk insight', Icon: ScanSearch, cls: 'chip-3' },
  { label: 'Strategy', Icon: TrendingUp, cls: 'chip-4' },
]

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const globeY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60])
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -60])
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={ref} className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true">
        <i className="aurora aurora-a" />
        <i className="aurora aurora-b" />
        <i className="aurora aurora-c" />
        <i className="hero-grid" />
      </div>

      <motion.div className="hero-content container" style={{ y: textY, opacity: fade }}>
        <motion.p
          className="pill"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        >
          <span className="pulse" /> Professional tax technology
        </motion.p>

        <h1 id="hero-title" className="hero-title">
          <SplitReveal
            delay={0.45}
            lines={[
              ['Smarter', 'tax', 'decisions,'],
              [
                <span className="grad" key="a">built</span>,
                <span className="grad" key="b">for</span>,
                <span className="grad" key="c">what</span>,
                <span className="grad" key="d">comes</span>,
                <span className="grad" key="e">next.</span>,
              ],
            ]}
          />
        </h1>

        <motion.p
          className="hero-lead"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1, ease: EASE }}
        >
          Planning, analysis, calculation, strategy and risk insight, together in one platform built for
          professionals who advise with precision.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.25, ease: EASE }}
        >
          <MagneticButton to={ROUTES.tools}>Explore tax tools</MagneticButton>
          <MagneticButton to={ROUTES.signUp} variant="ghost" arrow={false}>
            Get started
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div className="hero-globe" style={{ y: globeY }}>
        <div className="hero-halo" aria-hidden="true" />
        <motion.div
          className="hero-canvas-wrap"
          initial={{ opacity: 0, scale: 0.9, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.5, ease: EASE }}
        >
          <Suspense fallback={null}>
            <GlobeScene className="hero-canvas" />
          </Suspense>
        </motion.div>
        {CHIPS.map(({ label, Icon, cls }, i) => (
          <motion.span
            key={label}
            className={`chip ${cls}`}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 1.6 + i * 0.15, ease: EASE }}
          >
            <Icon size={15} strokeWidth={1.8} /> {label}
          </motion.span>
        ))}
      </motion.div>
    </section>
  )
}
