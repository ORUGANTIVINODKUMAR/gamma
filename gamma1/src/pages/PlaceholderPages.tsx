import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import Logo from '../components/Logo'
import { TOOLS } from '../data/tools'

function Shell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="ph">
      <div className="ph-light" aria-hidden="true" />
      <header className="ph-head">
        <Logo />
      </header>
      <main className="ph-main">
        <span className="pill">{eyebrow}</span>
        <h1 className="h2">{title}</h1>
        <div className="sec-lead">{children}</div>
        <Link to="/" className="ph-back">
          <ArrowLeft size={16} strokeWidth={1.6} /> Back to Tapreco
        </Link>
      </main>
    </div>
  )
}

const cap = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const up = mode === 'signup'
  return (
    <Shell eyebrow="Account" title={up ? 'Create your account' : 'Welcome back'}>
      <p>
        This is a placeholder route for {up ? 'account creation' : 'sign in'}. Point{' '}
        <code>ROUTES.{up ? 'signUp' : 'signIn'}</code> in <code>src/lib/routes.ts</code> at your existing
        authentication page to connect the landing page to the Tapreco application.
      </p>
    </Shell>
  )
}

export function ToolPage() {
  const { id } = useParams()
  const tool = TOOLS.find((t) => t.id === id)
  return (
    <Shell eyebrow={tool ? `Tool ${tool.number}` : 'Tax Tool'} title={tool?.name ?? 'Tax tool'}>
      <p>{tool?.description ?? 'This tool route is not defined.'}</p>
      <p>Placeholder route. Update <code>ROUTES.tool</code> in <code>src/lib/routes.ts</code> to open the live tool.</p>
    </Shell>
  )
}

export function InfoPage() {
  const { slug = '' } = useParams()
  return (
    <Shell eyebrow="Tapreco" title={cap(slug) || 'Page'}>
      <p>This page is coming soon.</p>
    </Shell>
  )
}
