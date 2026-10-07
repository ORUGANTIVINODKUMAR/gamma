import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import SmoothScroll from './components/SmoothScroll'
import LandingPage from './pages/LandingPage'
import { ToolsPage, ProcessPage, WhyPage, ContactPage } from './pages/SitePages'
import { scrollToTop } from './lib/lenis'
import { AuthPage, InfoPage, ToolPage } from './pages/PlaceholderPages'
import { EASE } from './data/tools'
import { ROUTES } from './lib/routes'

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  useEffect(() => {
    scrollToTop()
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><LandingPage /></Page>} />
        <Route path={ROUTES.tools} element={<Page><ToolsPage /></Page>} />
        <Route path={ROUTES.process} element={<Page><ProcessPage /></Page>} />
        <Route path={ROUTES.why} element={<Page><WhyPage /></Page>} />
        <Route path={ROUTES.contact} element={<Page><ContactPage /></Page>} />
        <Route path={ROUTES.signIn} element={<Page><AuthPage mode="signin" /></Page>} />
        <Route path={ROUTES.signUp} element={<Page><AuthPage mode="signup" /></Page>} />
        <Route path="/tools/:id" element={<Page><ToolPage /></Page>} />
        <Route path="/p/:slug" element={<Page><InfoPage /></Page>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <SmoothScroll />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
