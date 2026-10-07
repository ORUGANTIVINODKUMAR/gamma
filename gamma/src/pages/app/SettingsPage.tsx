import { Download, LogOut, RotateCcw, Trash2 } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { isPasswordAcceptable, PasswordInput, StrengthMeter } from '@/components/auth/PasswordInput'
import { FILING_STATUS_OPTIONS } from '@/components/tools/shared'
import { Button } from '@/components/ui/Button'
import { Field, Segmented, SelectField, Switch } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Modal'
import { Callout } from '@/components/ui/primitives'
import { toast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { usePreferences, type MotionPreference } from '@/context/PreferencesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { TAX_YEARS, type TaxYear } from '@/lib/tax/years'
import { describeAuthError } from '@/services/auth'
import { useWorkspace, workspace } from '@/services/workspace'

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="surface-card grid gap-6 rounded-panel p-6 sm:p-8 lg:grid-cols-[280px_1fr]" aria-label={title}>
      <div>
        <h2 className="font-display text-[16px] font-semibold text-fg">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-faint">{description}</p>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

export default function SettingsPage() {
  useDocumentTitle('Settings')
  const { prefs, setPref } = usePreferences()
  const { changePassword, logout, user } = useAuth()
  const ws = useWorkspace()
  const navigate = useNavigate()
  const ids = { current: useId(), next: useId() }
  const [pw, setPw] = useState({ current: '', next: '' })
  const [pwError, setPwError] = useState<{ field?: string; message: string } | null>(null)
  const [pwSaving, setPwSaving] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const samples = ws.clients.filter((c) => c.sample).length + ws.analyses.filter((a) => a.sample).length

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!pw.current) return setPwError({ field: 'current', message: 'Enter your current password.' })
    if (!isPasswordAcceptable(pw.next)) return setPwError({ field: 'next', message: 'Use at least 8 characters, including a letter and a number.' })
    setPwSaving(true)
    setPwError(null)
    try {
      await changePassword(pw.current, pw.next)
      setPw({ current: '', next: '' })
      toast('Password changed')
    } catch (err) {
      const d = describeAuthError(err)
      setPwError({ field: d.field === 'password' ? 'current' : undefined, message: d.message })
    } finally {
      setPwSaving(false)
    }
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), user: user?.email, ...ws }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tapreco-workspace-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="eyebrow">Account</p>
        <h1 className="mt-1.5 font-display text-[clamp(1.6rem,3vw,2.15rem)] font-semibold tracking-[-0.03em] text-fg">Settings</h1>
      </header>

      <Section title="Tax defaults" description="Starting values for new analyses in every tool.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13.5px] font-medium text-fg-muted">Default tax year</span>
          <Segmented
            label="Default tax year"
            value={String(prefs.defaultTaxYear) as `${TaxYear}`}
            onChange={(v) => setPref('defaultTaxYear', Number(v) as TaxYear)}
            options={TAX_YEARS.map((y) => ({ value: String(y) as `${TaxYear}`, label: String(y) }))}
          />
        </div>
        <SelectField label="Default filing status" value={prefs.defaultFilingStatus} onChange={(v) => setPref('defaultFilingStatus', v)} options={FILING_STATUS_OPTIONS} />
      </Section>

      <Section title="Experience" description="Motion and scrolling. “System” follows your device’s reduced-motion setting.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13.5px] font-medium text-fg-muted">Animation</span>
          <Segmented
            label="Animation preference"
            value={prefs.motion}
            onChange={(v: MotionPreference) => setPref('motion', v)}
            options={[
              { value: 'system', label: 'System' },
              { value: 'reduced', label: 'Reduced' },
              { value: 'full', label: 'Full' },
            ]}
          />
        </div>
        <Switch checked={prefs.smoothScroll} onChange={(b) => setPref('smoothScroll', b)} label="Smooth scrolling" description="Inertial wheel scrolling. Disabled automatically when motion is reduced." />
      </Section>

      <Section title="Security" description="Change the password you use to sign in.">
        <form onSubmit={onChangePassword} noValidate className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Current password" htmlFor={ids.current} error={pwError?.field === 'current' ? pwError.message : undefined}>
              <PasswordInput id={ids.current} autoComplete="current-password" value={pw.current} invalid={pwError?.field === 'current'} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            </Field>
            <Field label="New password" htmlFor={ids.next} error={pwError?.field === 'next' ? pwError.message : undefined}>
              <PasswordInput id={ids.next} autoComplete="new-password" value={pw.next} invalid={pwError?.field === 'next'} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <StrengthMeter password={pw.next} />
            </Field>
          </div>
          {pwError && !pwError.field && <Callout tone="critical">{pwError.message}</Callout>}
          <div>
            <Button type="submit" variant="secondary" loading={pwSaving}>
              Update password
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Workspace data" description="Clients and saved analyses in your workspace.">
        <div className="flex flex-wrap gap-2">
          <Button variant="subtle" icon={<Download className="size-4" aria-hidden />} onClick={exportData}>
            Export workspace (JSON)
          </Button>
          <Button
            variant="subtle"
            icon={<Trash2 className="size-4" aria-hidden />}
            disabled={samples === 0}
            onClick={() => {
              workspace.clearSamples()
              toast('Sample data removed')
            }}
          >
            Remove sample data{samples ? ` (${samples})` : ''}
          </Button>
          <Button variant="danger" icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => setConfirmReset(true)}>
            Reset workspace
          </Button>
        </div>
      </Section>

      <Section title="Session" description="You stay signed in on this device until you sign out or the session expires.">
        <div>
          <Button
            variant="secondary"
            icon={<LogOut className="size-4" aria-hidden />}
            onClick={async () => {
              await logout()
              navigate('/login', { replace: true })
            }}
          >
            Sign out
          </Button>
        </div>
      </Section>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        title="Reset workspace?"
        description="All clients and saved analyses will be replaced with the sample workspace."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                workspace.reset()
                setConfirmReset(false)
                toast('Workspace reset')
              }}
            >
              Reset workspace
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-fg-subtle">Export your workspace first if you want to keep a copy.</p>
      </Modal>
    </div>
  )
}
