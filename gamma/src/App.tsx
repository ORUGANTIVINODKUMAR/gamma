import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { RedirectIfAuthenticated } from '@/components/layout/RequireAuth'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { Toaster } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { Pages, prefetchWhenIdle } from './routes'

const AUTH_PATHS = ['/login', '/signup', '/forgot-password']

/**
 * Which shell a path renders in — switching shells cross-fades the whole frame.
 * A signed-out visit to /app is about to redirect to /login, so it is treated
 * as the auth shell to avoid a double fade.
 */
function shellFor(pathname: string, authed: boolean): 'app' | 'auth' | 'public' {
  if (pathname === '/app' || pathname.startsWith('/app/')) return authed ? 'app' : 'auth'
  if (AUTH_PATHS.includes(pathname)) return 'auth'
  return 'public'
}

export default function App() {
  const location = useLocation()
  const { status } = useAuth()
  const shell = shellFor(location.pathname, status === 'authenticated')

  // Prefetch the routes a visitor is most likely to open next.
  useEffect(
    () =>
      prefetchWhenIdle(
        status === 'authenticated'
          ? ['dashboard', 'mutualFund', 'estimatedTax', 'auditRisk', 'entityComparison', 'taxPlanner', 'clients', 'reports']
          : ['home', 'tools', 'platform', 'login', 'signup'],
      ),
    [status],
  )

  return (
    <>
      <SmoothScroll />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={shell}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
        >
          <Routes location={location}>
            <Route element={<PublicLayout />}>
              <Route index element={<Pages.Home />} />
              <Route path="platform" element={<Pages.Platform />} />
              <Route path="tools" element={<Pages.Tools />} />
              <Route path="solutions" element={<Pages.Solutions />} />
              <Route path="about" element={<Pages.About />} />
              <Route path="contact" element={<Pages.Contact />} />
              <Route path="privacy" element={<Pages.Privacy />} />
              <Route path="terms" element={<Pages.Terms />} />
              <Route path="dashboard" element={<Navigate to="/app" replace />} />
              <Route path="*" element={<Pages.NotFound />} />
            </Route>

            <Route
              element={
                <RedirectIfAuthenticated>
                  <AuthLayout />
                </RedirectIfAuthenticated>
              }
            >
              <Route path="login" element={<Pages.Login />} />
              <Route path="signup" element={<Pages.Signup />} />
              <Route path="forgot-password" element={<Pages.Forgot />} />
            </Route>

            <Route path="app" element={<AppLayout />}>
              <Route index element={<Pages.Dashboard />} />
              <Route path="clients" element={<Pages.Clients />} />
              <Route path="reports" element={<Pages.Reports />} />
              <Route path="profile" element={<Pages.Profile />} />
              <Route path="settings" element={<Pages.Settings />} />
              <Route path="tools">
                <Route index element={<Pages.ToolsHub />} />
                <Route path="mutual-fund" element={<Pages.MutualFund />} />
                <Route path="estimated-tax" element={<Pages.EstimatedTax />} />
                <Route path="audit-risk" element={<Pages.AuditRisk />} />
                <Route path="entity-comparison" element={<Pages.EntityComparison />} />
                <Route path="tax-planner" element={<Pages.TaxPlanner />} />
                <Route path="*" element={<Navigate to="/app/tools" replace />} />
              </Route>
              <Route path="*" element={<Pages.AppNotFound />} />
            </Route>
          </Routes>
        </motion.div>
      </AnimatePresence>
      <Toaster />
    </>
  )
}
