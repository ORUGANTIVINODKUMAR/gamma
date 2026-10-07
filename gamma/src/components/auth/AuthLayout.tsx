import { ArrowLeft, Check } from 'lucide-react'
import { lazy } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatedOutlet } from '@/components/layout/PageTransition'
import { DocumentPoster, SceneBoundary } from '@/components/three/core/SceneBoundary'
import { Logo } from '@/components/ui/Logo'
import { TOOLS } from '@/config/tools'
import { useIsDesktop } from '@/hooks/useMediaQuery'

const AuthScene = lazy(() => import('@/components/three/scenes/AuthScene'))

/** How far the vault drawer eases open for each step of the sign-in flow. */
const MOOD: Record<string, number> = { '/login': 0.25, '/signup': 0.75, '/forgot-password': 0.05 }

/** Split-screen shell for sign-in flows. The 3D stage persists while forms transition. */
export function AuthLayout() {
  const desktop = useIsDesktop()
  const { pathname } = useLocation()
  return (
    <div className="relative grid min-h-dvh overflow-x-clip lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="relative flex min-h-dvh flex-col px-4 py-6 sm:px-8 lg:px-14">
        <header className="relative flex items-center justify-between">
          <Link to="/" aria-label="Tapreco home" className="rounded-lg">
            <Logo />
          </Link>
          <Link to="/" className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-subtle hover:text-fg">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            Back to site
          </Link>
        </header>
        <main id="main" className="relative flex flex-1 items-center justify-center py-10">
          <AnimatedOutlet className="w-full max-w-[26rem]" />
        </main>
        <p className="relative text-center text-[12px] text-fg-faint lg:text-left">
          © {new Date().getFullYear()} Tapreco · <Link to="/privacy" className="hover:text-fg">Privacy</Link> ·{' '}
          <Link to="/terms" className="hover:text-fg">Terms</Link>
        </p>
      </div>

      {desktop && (
        <aside className="studio-bg relative m-3 hidden overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.35)] lg:flex lg:flex-col" aria-label="About Tapreco">
          <SceneBoundary eager className="relative min-h-0 flex-1" fallback={<DocumentPoster />}>
            <AuthScene mood={MOOD[pathname] ?? 0.25} className="absolute inset-0" />
          </SceneBoundary>
          <div className="relative px-10 pb-10">
            <p className="eyebrow">One platform</p>
            <h2 className="t-h2 mt-3 max-w-md text-fg">
              Sign in once. <em className="text-accent-400">Every tool is ready.</em>
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {TOOLS.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-[13px] text-fg-subtle">
                  <Check className="size-4 shrink-0 text-accent-400" aria-hidden />
                  {t.name}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  )
}
