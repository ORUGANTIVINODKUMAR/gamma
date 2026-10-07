import { Check, Mail } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { isPasswordAcceptable, PasswordInput, StrengthMeter } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/Button'
import { Field, TextInput } from '@/components/ui/fields'
import { Callout } from '@/components/ui/primitives'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { adapter, describeAuthError } from '@/services/auth'

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset password')
  const { isDemoMode } = useAuth()
  const emailId = useId()
  const pwId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<{ field?: string; message: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<'sent' | 'reset' | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError({ field: 'email', message: 'Enter the email on your account.' })
      return
    }
    if (isDemoMode && !isPasswordAcceptable(password)) {
      setError({ field: 'password', message: 'Use at least 8 characters, including a letter and a number.' })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      setDone(await adapter.resetPassword(email, isDemoMode ? password : undefined))
    } catch (err) {
      setError(describeAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div role="status">
        <span className="grid size-14 place-items-center rounded-2xl border border-accent-500/30 bg-accent-500/10 text-accent-300">
          <Check className="size-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-[1.9rem] font-semibold tracking-[-0.03em] text-fg">
          {done === 'reset' ? 'Password updated' : 'Check your inbox'}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-fg-subtle">
          {done === 'reset'
            ? 'Your password has been changed. Sign in with your new password.'
            : `If an account exists for ${email}, we’ve sent a link to reset your password.`}
        </p>
        <Button to="/login" size="lg" fullWidth withArrow className="mt-8">
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-[2rem] font-semibold tracking-[-0.03em] text-fg">Reset your password</h1>
      <p className="mt-2 text-[15px] text-fg-subtle">
        {isDemoMode ? 'Choose a new password for an account in this browser.' : 'Enter your email and we’ll send you a reset link.'}
      </p>
      {isDemoMode && (
        <Callout tone="neutral" className="mt-6">
          Demo mode: accounts live in this browser, so the reset applies instantly. With the Tapreco API connected, a reset
          link is emailed instead.
        </Callout>
      )}
      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <Field label="Email" htmlFor={emailId} error={error?.field === 'email' ? error.message : undefined}>
          <TextInput
            id={emailId}
            type="email"
            autoComplete="email"
            value={email}
            invalid={error?.field === 'email'}
            leading={<Mail className="size-4" aria-hidden />}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {isDemoMode && (
          <Field label="New password" htmlFor={pwId} error={error?.field === 'password' ? error.message : undefined}>
            <PasswordInput id={pwId} autoComplete="new-password" value={password} invalid={error?.field === 'password'} onChange={(e) => setPassword(e.target.value)} />
            <StrengthMeter password={password} />
          </Field>
        )}
        {error && error.field !== 'email' && error.field !== 'password' && <Callout tone="critical">{error.message}</Callout>}
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {isDemoMode ? 'Update password' : 'Send reset link'}
        </Button>
      </form>
      <p className="mt-8 text-center text-[14px] text-fg-subtle">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-accent-300 hover:text-accent-200">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
