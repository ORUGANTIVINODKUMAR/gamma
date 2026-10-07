import type { Transition } from 'framer-motion'
export const premiumEase = [0.22, 1, 0.36, 1] as const
export const revealTransition: Transition = { duration: 0.75, ease: premiumEase }
export const gentleSpring = { stiffness: 85, damping: 24, mass: 0.8 }
export const hoverSpring = { stiffness: 170, damping: 27, mass: 0.7 }
