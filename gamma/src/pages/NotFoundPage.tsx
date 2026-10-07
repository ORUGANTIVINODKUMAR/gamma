import { ArrowLeft, ClipboardList } from 'lucide-react'
import { lazy } from 'react'
import { Link } from 'react-router-dom'
import { DocumentPoster, SceneBoundary } from '@/components/three/core/SceneBoundary'
import { Button } from '@/components/ui/Button'
import { TOOLS } from '@/config/tools'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const NotFoundScene = lazy(() => import('@/components/three/scenes/NotFoundScene'))

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <section className="studio-bg relative isolate flex min-h-[90svh] items-center overflow-hidden pt-[72px]">
      <div className="container-page relative grid items-center gap-10 py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Error 404</p>
          <h1 className="t-h1 mt-5 text-fg">
            This page isn’t <em className="text-accent-400">on the return.</em>
          </h1>
          <p className="t-lead mt-5 max-w-md">The page you’re looking for doesn’t exist or has moved. Head back home or jump straight into a tool.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/" icon={<ArrowLeft className="size-4" aria-hidden />} magnetic>
              Back to home
            </Button>
            <Button to="/tools" variant="secondary" icon={<ClipboardList className="size-4" aria-hidden />}>
              Explore Tax Tools
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <li key={t.id}>
                <Link
                  to={t.path}
                  className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] text-fg-subtle transition-[transform,color] duration-200 ease-premium hover:-translate-y-0.5 hover:text-accent-200"
                >
                  <t.icon className="size-3.5" aria-hidden /> {t.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <SceneBoundary className="relative h-[320px] sm:h-[420px]" fallback={<DocumentPoster />}>
          <NotFoundScene className="absolute inset-0" />
        </SceneBoundary>
      </div>
    </section>
  )
}
