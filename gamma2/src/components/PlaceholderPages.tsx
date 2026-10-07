import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Check, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { tools } from '../data/tools'
import { ButtonLink, Reveal } from './ui'

export function ToolPage() {
  const { slug } = useParams()
  const tool = tools.find(item => item.slug === slug)
  if (!tool) return <NotFound />
  const Icon = tool.icon
  return <main className="detail-page container"><Link to="/#tools" className="back-link"><ArrowLeft size={16} /> All tax tools</Link><Reveal><span className="eyebrow">{tool.category}</span><h1>{tool.name}</h1><p className="detail-description">{tool.description}</p><div className="detail-grid"><div><ul className="feature-list">{tool.features.map(feature => <li key={feature}><span><Check size={13} /></span>{feature}</li>)}</ul><ButtonLink to="/get-started">Get Started</ButtonLink></div><div className="placeholder-panel"><Icon size={34} strokeWidth={1.3} /><h2>Your next workspace.</h2><p>This tool’s workspace is not connected yet. This page reserves its route for the existing Tapreco tool when it is integrated.</p><span className="placeholder-badge">FRONTEND PREVIEW</span></div></div></Reveal></main>
}

export function AccountPage({ signup = false }: { signup?: boolean }) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [status, setStatus] = useState('')
  return <main className="account-page container"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Tapreco</Link><div className="account-layout"><Reveal><span className="eyebrow">YOUR NEXT PERSPECTIVE</span><h1>{signup ? <>Better decisions<br /><span className="text-muted">start here.</span></> : <>Welcome back.<br /><span className="text-muted">Think ahead.</span></>}</h1><p>A thoughtful workspace for professional tax planning, analysis, and review.</p><span className="account-note"><LockKeyhole size={17} /> Built around professional work.</span></Reveal><Reveal className="account-form-panel"><h2>{signup ? 'Get started with Tapreco' : 'Sign in to Tapreco'}</h2><p className="preview-notice">Frontend preview · account services are not yet connected.</p><form onSubmit={event => { event.preventDefault(); setStatus('Account services are not connected in this project yet. No credentials were sent and no account was created.') }}>
    {signup && <label>Full name<input name="name" autoComplete="name" placeholder="Your full name" required /></label>}
    <label>Work email<input name="email" type="email" autoComplete="email" placeholder="you@yourfirm.com" required /></label>
    {signup && <label>Firm name<input name="firm" autoComplete="organization" placeholder="Your accounting firm" required /></label>}
    <label>Password<span className="password-input"><input name="password" type={passwordVisible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} placeholder="At least 8 characters" required /><button type="button" onClick={() => setPasswordVisible(!passwordVisible)} aria-label={passwordVisible ? 'Hide password' : 'Show password'} aria-pressed={passwordVisible}>{passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
    <button className="button button-primary form-submit" type="submit">{signup ? 'Create your workspace' : 'Sign In'} <ArrowUpRight size={17} /></button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form><p className="account-switch">{signup ? 'Already have an account?' : 'New to Tapreco?'} <Link to={signup ? '/sign-in' : '/get-started'} onClick={() => setStatus('')}>{signup ? 'Sign in' : 'Get started'}</Link></p></Reveal></div></main>
}

export function LegalPage() {
  const { topic } = useParams()
  const titles: Record<string, string> = { privacy: 'Privacy policy', terms: 'Terms of use', security: 'Security at Tapreco' }
  if (!topic || !titles[topic]) return <NotFound />
  return <main className="detail-page container"><Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Tapreco</Link><span className="eyebrow">TAPRECO / {topic.toUpperCase()}</span><h1>{titles[topic]}</h1><div className="legal-panel"><span className="placeholder-badge">PENDING PUBLICATION</span><h2>This information will be published before launch.</h2><p>This is a frontend preview. Tapreco’s approved {topic === 'security' ? 'security information' : titles[topic].toLowerCase()} has not been provided for this project. No compliance, data retention, or security guarantees are implied by this page.</p><ButtonLink to="/" secondary>Back to the platform</ButtonLink></div></main>
}

export function NotFound() {
  return <main className="detail-page container"><span className="eyebrow">404 / A NEW PERSPECTIVE</span><h1>Let’s get you<br /><span className="text-muted">back on track.</span></h1><p className="detail-description">This page couldn’t be found.</p><ButtonLink to="/">Back to Tapreco</ButtonLink></main>
}
