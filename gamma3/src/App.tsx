import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import { AboutPage, PlatformPage, SolutionsPage, ToolsPage } from './pages/InnerPages'
import { AuthPage, InfoPage, ToolPage } from './pages/SimplePages'

/** Every navigation starts at the top of the new page. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <>
      <ScrollToTop />
      {/* keyed on pathname so each page gets a short CSS fade-in */}
      <div key={pathname} className="page">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/platform" element={<PlatformPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/p/:slug" element={<InfoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}
