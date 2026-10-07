import { motion, useAnimationControls } from 'framer-motion'
import { Building2, Mail, UserRound } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isPasswordAcceptable, PasswordInput, StrengthMeter } from '@/components/auth/PasswordInput'
import { Button } from '@/components/ui/Button'
import { Checkbox, Field, Select, TextInput } from '@/components/ui/fields'
import { Callout } from '@/components/ui/primitives'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { describeAuthError, PROFESSIONAL_ROLES, type ProfessionalRole } from '@/services/auth'

type Errors = Partial<Record<'name' | 'email' | 'firm' | 'password' | 'terms' | 'form', string>>

export default function SignupPage() {
  useDocumentTitle('Create account')
  const { signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const ids = { name: useId(), email: useId(), firm: useId(), role: useId(), password: useId() }
  const [form, setForm] = useState({ name: '', email: '', firm: '', role: 'CPA' as ProfessionalRole, password: '' })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const shake = useAnimationControls()

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k as keyof Errors]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (form.name.trim().length < 2) next.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid work email.'
    if (!form.firm.trim()) next.firm = 'Enter your firm or practice name.'
    if (!isPasswordAcceptable(form.password)) next.password = 'Use at least 8 characters, including a letter and a number.'
    if (!terms) next.terms = 'Please accept the Terms and Privacy Policy.'
    setErrors(next)
    if (Object.keys(next).length) {
      void shake.start({ x: [0, -6, 6, -3, 3, 0], transition: { duration: 0.35 } })
      return
    }
    setSubmitting(true)
    try {
      await signup({ ...form, email: form.email.trim().toLowerCase() })
      navigate(from && from.startsWith('/app') ? from : '/app', { replace: true, state: { welcome: true } })
    } catch (err) {
      const { message, field } = describeAuthError(err)
      setErrors({ [field === 'email' ? 'email' : 'form']: message })
      void shake.start({ x: [0, -6, 6, -3, 3, 0], transition: { duration: 0.35 } })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div animate={shake}>
      <h1 className="font-display text-[2rem] font-semibold tracking-[-0.03em] text-fg">Create your account</h1>
      <p className="mt-2 text-[15px] text-fg-subtle">One account unlocks all five Tapreco tax tools.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <Field label="Full name" htmlFor={ids.name} error={errors.name}>
          <TextInput id={ids.name} autoComplete="name" value={form.name} invalid={!!errors.name} leading={<UserRound className="size-4" aria-hidden />} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Work email" htmlFor={ids.email} error={errors.email}>
          <TextInput
            id={ids.email}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@firm.com"
            value={form.email}
            invalid={!!errors.email}
            leading={<Mail className="size-4" aria-hidden />}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-[1.3fr_1fr]">
          <Field label="Firm" htmlFor={ids.firm} error={errors.firm}>
            <TextInput id={ids.firm} autoComplete="organization" value={form.firm} invalid={!!errors.firm} leading={<Building2 className="size-4" aria-hidden />} onChange={(e) => set('firm', e.target.value)} />
          </Field>
          <Field label="Role" htmlFor={ids.role}>
            <Select id={ids.role} value={form.role} options={PROFESSIONAL_ROLES.map((r) => ({ value: r, label: r }))} onChange={(e) => set('role', e.target.value as ProfessionalRole)} />
          </Field>
        </div>
        <Field label="Password" htmlFor={ids.password} error={errors.password} hint="At least 8 characters with a letter and a number.">
          <PasswordInput id={ids.password} autoComplete="new-password" value={form.password} invalid={!!errors.password} onChange={(e) => set('password', e.target.value)} />
          <StrengthMeter password={form.password} />
        </Field>
        <div>
          <Checkbox checked={terms} onChange={(v) => { setTerms(v); if (v) setErrors((e) => ({ ...e, terms: undefined })) }} invalid={!!errors.terms}>
            I agree to the{' '}
            <Link to="/terms" className="text-accent-300 underline-offset-2 hover:underline">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="text-accent-300 underline-offset-2 hover:underline">Privacy Policy</Link>.
          </Checkbox>
          {errors.terms && <p role="alert" className="mt-1.5 pl-8 text-[12.5px] text-critical-soft">{errors.terms}</p>}
        </div>

        {errors.form && (
          <Callout tone="critical">
            <span role="alert">{errors.form}</span>
          </Callout>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting} withArrow={!submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-8 text-center text-[14px] text-fg-subtle">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-accent-300 hover:text-accent-200">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
