import { motion, useAnimationControls } from 'framer-motion'
import { Mail, Sparkles } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, TextInput } from '@/components/ui/fields'
import { Callout } from '@/components/ui/primitives'
import { TOOLS } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { DEMO_CREDENTIALS, describeAuthError } from '@/services/auth'

export default function LoginPage() {
  useDocumentTitle('Sign in')
  const { login, isDemoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const targetTool = from ? TOOLS.find((t) => from.startsWith(t.path)) : undefined

  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const shake = useAnimationControls()

  const submit = async (creds?: { email: string; password: string }) => {
    const e = creds?.email ?? email
    const p = creds?.password ?? password
    const next: typeof errors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())) next.email = 'Enter the email you use for Tapreco.'
    if (!p) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) {
      void shake.start({ x: [0, -6, 6, -3, 3, 0], transition: { duration: 0.35 } })
      return
    }
    setSubmitting(true)
    try {
      await login(e, p, remember)
      navigate(from && from.startsWith('/app') ? from : '/app', { replace: true })
    } catch (err) {
      const { message, field } = describeAuthError(err)
      setErrors({ [field ?? 'form']: message })
      void shake.start({ x: [0, -6, 6, -3, 3, 0], transition: { duration: 0.35 } })
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void submit()
  }

  const signInWithDemo = () => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    void submit({ ...DEMO_CREDENTIALS })
  }

  return (
    <motion.div animate={shake}>
      <h1 className="font-display text-[2rem] font-semibold tracking-[-0.03em] text-fg">Welcome back</h1>
      <p className="mt-2 text-[15px] text-fg-subtle">Sign in to your Tapreco workspace.</p>

      {targetTool && (
        <Callout tone="accent" className="mt-6">
          Sign in to open the <strong className="font-semibold text-fg">{targetTool.name}</strong>. You’ll stay signed in for every tool.
        </Callout>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <Field label="Email" htmlFor={emailId} error={errors.email}>
          <TextInput
            id={emailId}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@firm.com"
            value={email}
            invalid={!!errors.email}
            leading={<Mail className="size-4" aria-hidden />}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor={passwordId} error={errors.password}>
          <PasswordInput id={passwordId} autoComplete="current-password" value={password} invalid={!!errors.password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="flex items-center justify-between gap-4">
          <Checkbox checked={remember} onChange={setRemember}>
            Keep me signed in
          </Checkbox>
          <Link to="/forgot-password" className="text-[13px] font-medium text-accent-300 hover:text-accent-200">
            Forgot password?
          </Link>
        </div>

        {errors.form && (
          <Callout tone="critical">
            <span role="alert">{errors.form}</span>
          </Callout>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting} withArrow={!submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {isDemoMode && (
        <div className="mt-6 rounded-2xl border border-line/[0.07] bg-line/[0.02] p-4">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <Sparkles className="size-4 text-accent-300" aria-hidden /> Demo workspace
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-fg-faint">
            Explore Tapreco with sample clients and analyses. Email <span className="text-fg-subtle">{DEMO_CREDENTIALS.email}</span> ·
            password <span className="text-fg-subtle">{DEMO_CREDENTIALS.password}</span>
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={signInWithDemo} disabled={submitting}>
            Use demo account
          </Button>
        </div>
      )}

      <p className="mt-8 text-center text-[14px] text-fg-subtle">
        New to Tapreco?{' '}
        <Link to="/signup" state={location.state} className="font-semibold text-accent-300 hover:text-accent-200">
          Create an account
        </Link>
      </p>
    </motion.div>
  )
}
