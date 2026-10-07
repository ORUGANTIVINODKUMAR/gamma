import type { Transition, Variants } from 'framer-motion'

/** Signature easing: fast start, long soft settle. */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

export const DURATION = {
  hover: 0.22,
  enter: 0.6,
  page: 0.38,
} as const

export const transitionEnter: Transition = { duration: DURATION.enter, ease: EASE_PREMIUM }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: transitionEnter },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitionEnter },
}

export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

/** Default viewport config for scroll reveals — once, slightly before entering. */
export const revealViewport = { once: true, margin: '0px 0px -12% 0px' } as const
