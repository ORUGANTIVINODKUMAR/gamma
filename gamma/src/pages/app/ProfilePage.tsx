import { BadgeCheck, Building2, Mail } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Select, TextInput } from '@/components/ui/fields'
import { Avatar, Badge, Callout } from '@/components/ui/primitives'
import { toast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate } from '@/lib/format'
import { describeAuthError, PROFESSIONAL_ROLES, type ProfessionalRole, type User } from '@/services/auth'
import { useWorkspace } from '@/services/workspace'

function formFrom(user: User | null) {
  return { name: user?.name ?? '', firm: user?.firm ?? '', role: (user?.role ?? 'CPA') as ProfessionalRole, title: user?.title ?? '', phone: user?.phone ?? '' }
}

export default function ProfilePage() {
  useDocumentTitle('Profile')
  const { user, updateProfile, isDemoMode } = useAuth()
  const ws = useWorkspace()
  const ids = { name: useId(), firm: useId(), role: useId(), title: useId(), phone: useId(), email: useId() }
  const [form, setForm] = useState(() => formFrom(user))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null
  const dirty = form.name !== user.name || form.firm !== user.firm || form.role !== user.role || form.title !== (user.title ?? '') || form.phone !== (user.phone ?? '')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 2 || !form.firm.trim()) {
      setError('Name and firm are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateProfile({ ...form, name: form.name.trim(), firm: form.firm.trim() })
      toast('Profile updated')
    } catch (err) {
      setError(describeAuthError(err).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="mt-1.5 font-display text-[clamp(1.6rem,3vw,2.15rem)] font-semibold tracking-[-0.03em] text-fg">Profile</h1>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[360px_1fr]">
        <section className="surface-card relative overflow-hidden rounded-panel p-6 text-center" aria-label="Profile summary">
          <div className="relative flex flex-col items-center">
            <Avatar name={user.name} size="lg" className="!size-20 !text-xl" />
            <h2 className="mt-4 font-display text-[19px] font-semibold text-fg">{user.name}</h2>
            <p className="text-[13px] text-fg-subtle">{user.title ? `${user.title} · ` : ''}{user.role}</p>
            <Badge tone="accent" withIcon={false} className="mt-3">
              <BadgeCheck className="size-3" aria-hidden /> {isDemoMode ? 'Demo workspace' : 'Professional'}
            </Badge>
          </div>
          <dl className="relative mt-6 flex flex-col gap-3 text-left text-[13px]">
            <div className="flex items-center gap-3 rounded-xl border border-line/[0.06] bg-line/[0.02] px-3.5 py-3">
              <Mail className="size-4 text-fg-faint" aria-hidden />
              <dt className="sr-only">Email</dt>
              <dd className="truncate text-fg-muted">{user.email}</dd>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-line/[0.06] bg-line/[0.02] px-3.5 py-3">
              <Building2 className="size-4 text-fg-faint" aria-hidden />
              <dt className="sr-only">Firm</dt>
              <dd className="truncate text-fg-muted">{user.firm}</dd>
            </div>
          </dl>
          <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Clients', value: ws.clients.length },
              { label: 'Analyses', value: ws.analyses.length },
              { label: 'Member since', value: formatDate(user.createdAt, 'monthDay') },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-line/[0.06] bg-line/[0.02] p-3">
                <p className="font-display text-[16px] font-semibold text-fg">{s.value}</p>
                <p className="text-[11px] text-fg-faint">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={onSubmit} noValidate className="surface-card rounded-panel p-6 sm:p-8" aria-label="Edit profile">
          <h2 className="font-display text-[16px] font-semibold text-fg">Personal details</h2>
          <p className="mt-1 text-[13px] text-fg-faint">Shown on reports you prepare.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor={ids.name}>
              <TextInput id={ids.name} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email" htmlFor={ids.email} hint="Contact support to change your sign-in email.">
              <TextInput id={ids.email} value={user.email} disabled readOnly />
            </Field>
            <Field label="Firm" htmlFor={ids.firm}>
              <TextInput id={ids.firm} autoComplete="organization" value={form.firm} onChange={(e) => setForm({ ...form, firm: e.target.value })} />
            </Field>
            <Field label="Professional role" htmlFor={ids.role}>
              <Select id={ids.role} value={form.role} options={PROFESSIONAL_ROLES.map((r) => ({ value: r, label: r }))} onChange={(e) => setForm({ ...form, role: e.target.value as ProfessionalRole })} />
            </Field>
            <Field label="Title" htmlFor={ids.title} optional>
              <TextInput id={ids.title} autoComplete="organization-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Tax Manager" />
            </Field>
            <Field label="Phone" htmlFor={ids.phone} optional>
              <TextInput id={ids.phone} type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          {error && (
            <Callout tone="critical" className="mt-5">
              {error}
            </Callout>
          )}
          <div className="mt-8 flex justify-end gap-2">
            <Button
              variant="ghost"
              disabled={!dirty || saving}
              onClick={() => setForm(formFrom(user))}
            >
              Discard
            </Button>
            <Button type="submit" loading={saving} disabled={!dirty}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
