import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ToolsSection from './components/ToolsSection'
import BenefitsSection from './components/BenefitsSection'
import CTASection from './components/CTASection'
import PlatformSection from './components/PlatformSection'
import TaxPlannerSection from './components/TaxPlannerSection'
import WorkflowSection from './components/WorkflowSection'
import { premiumEase } from './animations/motion'
import Footer from './components/Footer'
import { AccountPage, LegalPage, NotFound, ToolPage } from './components/PlaceholderPages'

function ScrollManager({ location }: { location: Location }) {
  const { pathname, hash, key } = location
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frame = requestAnimationFrame(() => {
      if (hash) {
        const target = document.getElementById(hash.slice(1))
        if (target) {
          // Route entrance translates the wrapper temporarily. Account for it
          // so the anchor lands at the same position when that motion settles.
          const wrapper = document.getElementById('main-content')
          const transform = wrapper ? new DOMMatrixReadOnly(getComputedStyle(wrapper).transform).m42 : 0
          const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
          const top = target.getBoundingClientRect().top + window.scrollY - transform - margin
          window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' })
        }
      } else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    const titles: Record<string, string> = { '/': 'Professional Tax Intelligence', '/sign-in': 'Sign In', '/get-started': 'Get Started' }
    const fallback = pathname.split('/').filter(Boolean).pop()?.replaceAll('-', ' ')
    document.title = `Tapreco — ${titles[pathname] || fallback || 'Professional Tax Intelligence'}`
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key])
  return null
}

function Landing() {
  return <main><Hero /><ToolsSection /><TaxPlannerSection /><PlatformSection /><WorkflowSection /><BenefitsSection /><CTASection /></main>
}

export default function App() {
  const location = useLocation()
  const reduced = useReducedMotion()
  return <><a className="skip-link" href="#main-content">Skip to content</a><Navbar /><AnimatePresence mode="wait" initial={false}><motion.div id="main-content" className="route-content" tabIndex={-1} key={location.pathname} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 1 } : { opacity: 0, y: -6 }} transition={{ duration: reduced ? 0 : 0.32, ease: premiumEase }}><ScrollManager location={location} /><Routes location={location}><Route path="/" element={<Landing />} /><Route path="/tools/:slug" element={<ToolPage />} /><Route path="/sign-in" element={<AccountPage />} /><Route path="/get-started" element={<AccountPage signup />} /><Route path="/legal/:topic" element={<LegalPage />} /><Route path="*" element={<NotFound />} /></Routes></motion.div></AnimatePresence><Footer /></>
}
