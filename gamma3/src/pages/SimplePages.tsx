import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { toolBySlug } from '../data/tools'

function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="simple">{children}</main>
      <Footer />
    </>
  )
}

const titleCase = (s = '') => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/** Placeholder route for each tool. Replace the element for a slug with the real tool when it is wired in. */
export function ToolPage() {
  const { slug } = useParams()
  const tool = toolBySlug(slug)
  return (
    <Shell>
      <div className="container">
        <p className="label">{tool?.flagship ? 'Flagship Tool' : 'Tax Tool'}</p>
        <h1>{tool?.name ?? titleCase(slug)}</h1>
        <p className="section__lead">
          This route is reserved for the {tool?.name ?? 'tool'}. Connect the existing Tapreco tool to this path and it will
          open from every link on the homepage.
        </p>
        <Button to="/tools" variant="secondary">
          Back to all tools
        </Button>
      </div>
    </Shell>
  )
}

export function InfoPage() {
  const { slug } = useParams()
  return (
    <Shell>
      <div className="container">
        <p className="label">Tapreco</p>
        <h1>{titleCase(slug)}</h1>
        <p className="section__lead">This page is coming soon.</p>
        <Button to="/" variant="secondary">
          Back to home
        </Button>
      </div>
    </Shell>
  )
}

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const [sent, setSent] = useState(false)
  const login = mode === 'login'
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }
  return (
    <Shell>
      <div className="container simple--narrow">
        <p className="label">{login ? 'Welcome back' : 'Create your account'}</p>
        <h1>{login ? 'Sign In' : 'Get Started'}</h1>
        <form className="form" onSubmit={onSubmit}>
          {!login && (
            <label className="field">
              <span>Full name</span>
              <input name="name" autoComplete="name" required />
            </label>
          )}
          <label className="field">
            <span>Work email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" autoComplete={login ? 'current-password' : 'new-password'} required />
          </label>
          <button className="btn btn--primary" type="submit">
            {login ? 'Sign In' : 'Create Account'}
          </button>
          {sent && (
            <p className="form__note" role="status">
              Authentication is not connected to this frontend yet. Wire this form to your existing login and signup API.
            </p>
          )}
        </form>
        <p className="form__alt">
          {login ? (
            <>
              New to Tapreco? <Link to="/signup">Get started</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          )}
        </p>
      </div>
    </Shell>
  )
}
