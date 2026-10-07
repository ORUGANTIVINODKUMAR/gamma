import { AnimatePresence, motion } from 'framer-motion'
import { Check, LifeBuoy, Mail, MessagesSquare, ShieldCheck, type LucideIcon } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { PageHero } from '@/components/marketing/PageHero'
import { Button } from '@/components/ui/Button'
import { Field, Select, TextInput, inputBase } from '@/components/ui/fields'
import { Callout } from '@/components/ui/primitives'
import { Reveal } from '@/components/ui/Reveal'
import { site } from '@/config/site'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'
import { submitContact, type ContactMessage } from '@/services/contact'

const TOPICS: ContactMessage['topic'][] = ['Sales', 'Support', 'Partnerships', 'Other']
const SIZES = ['Just me', '2–10 professionals', '11–50 professionals', '51–200 professionals', '200+ professionals']

const CHANNELS: { icon: LucideIcon; title: string; text: string; email: string }[] = [
  { icon: MessagesSquare, title: 'Sales', text: 'Pricing, demos and onboarding for your firm.', email: site.email.sales },
  { icon: LifeBuoy, title: 'Support', text: 'Help with tools, accounts and reports.', email: site.email.support },
  { icon: ShieldCheck, title: 'Privacy', text: 'Data handling and privacy requests.', email: site.email.privacy },
]

type Errors = Partial<Record<keyof ContactMessage, string>>

function validate(m: ContactMessage): Errors {
  const e: Errors = {}
  if (!m.name.trim()) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) e.email = 'Enter a valid work email.'
  if (m.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).'
  return e
}

export default function ContactPage() {
  useDocumentTitle('Contact')
  const ids = { name: useId(), email: useId(), firm: useId(), size: useId(), topic: useId(), message: useId() }
  const [form, setForm] = useState<ContactMessage>({ name: '', email: '', firm: '', firmSize: SIZES[1]!, topic: 'Sales', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'sent' | 'stored' | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const set = <K extends keyof ContactMessage>(k: K, v: ContactMessage[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length > 0) {
      document.getElementById(ids[Object.keys(v)[0] as 'name'])?.focus()
      return
    }
    setSubmitting(true)
    setFailure(null)
    try {
      setResult(await submitContact(form))
    } catch (err) {
      setFailure((err as Error).message || 'We could not send your message. Please email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const mailto = `mailto:${form.topic === 'Support' ? site.email.support : site.email.sales}?subject=${encodeURIComponent(
    `[${form.topic}] ${form.firm || form.name}`,
  )}&body=${encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.firm}${form.firm ? ' · ' : ''}${form.firmSize}\n${form.email}`)}`

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let’s talk about <span className="text-accent-400">your practice</span>
          </>
        }
        description="Whether you’re evaluating Tapreco for your firm or need help with a tool, we’re here to help."
      />

      <section className="relative pb-24">
        <div className="container-page grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="surface-card relative overflow-hidden rounded-panel p-6 sm:p-10">
              <AnimatePresence mode="wait" initial={false}>
                {result ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_PREMIUM }}
                    className="flex flex-col items-start gap-4 py-6"
                    role="status"
                  >
                    <span className="grid size-14 place-items-center rounded-2xl border border-accent-500/30 bg-accent-500/10 text-accent-300">
                      <Check className="size-7" aria-hidden />
                    </span>
                    <h2 className="font-display text-2xl font-semibold text-fg">Thank you, {form.name.split(' ')[0]}.</h2>
                    {result === 'sent' ? (
                      <p className="text-[15px] leading-relaxed text-fg-subtle">Your message is on its way. Our team will reply to {form.email}.</p>
                    ) : (
                      <>
                        <p className="text-[15px] leading-relaxed text-fg-subtle">
                          Your message is ready. This preview isn’t connected to a messaging service yet, so send it from your email
                          app to make sure it reaches us.
                        </p>
                        <Button href={mailto} icon={<Mail className="size-4" aria-hidden />}>
                          Send via email
                        </Button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setResult(null)
                        setForm((f) => ({ ...f, message: '' }))
                      }}
                      className="text-[13.5px] font-medium text-accent-300 hover:text-accent-200"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={onSubmit}
                    noValidate
                    className="flex flex-col gap-5"
                  >
                    <h2 className="font-display text-xl font-semibold text-fg">Send us a message</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Full name" htmlFor={ids.name} error={errors.name}>
                        <TextInput id={ids.name} autoComplete="name" value={form.name} invalid={!!errors.name} onChange={(e) => set('name', e.target.value)} />
                      </Field>
                      <Field label="Work email" htmlFor={ids.email} error={errors.email}>
                        <TextInput id={ids.email} type="email" autoComplete="email" value={form.email} invalid={!!errors.email} onChange={(e) => set('email', e.target.value)} />
                      </Field>
                      <Field label="Firm" htmlFor={ids.firm} optional>
                        <TextInput id={ids.firm} autoComplete="organization" value={form.firm} onChange={(e) => set('firm', e.target.value)} />
                      </Field>
                      <Field label="Firm size" htmlFor={ids.size}>
                        <Select id={ids.size} value={form.firmSize} options={SIZES.map((s) => ({ value: s, label: s }))} onChange={(e) => set('firmSize', e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Topic" htmlFor={ids.topic}>
                      <Select
                        id={ids.topic}
                        value={form.topic}
                        options={TOPICS.map((t) => ({ value: t, label: t }))}
                        onChange={(e) => set('topic', e.target.value as ContactMessage['topic'])}
                      />
                    </Field>
                    <Field label="How can we help?" htmlFor={ids.message} error={errors.message}>
                      <textarea
                        id={ids.message}
                        rows={5}
                        value={form.message}
                        aria-invalid={!!errors.message || undefined}
                        aria-describedby={errors.message ? `${ids.message}-error` : undefined}
                        onChange={(e) => set('message', e.target.value)}
                        className={cn(inputBase, 'h-auto resize-y py-3 leading-relaxed')}
                      />
                    </Field>
                    {failure && <Callout tone="critical">{failure}</Callout>}
                    <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[12px] text-fg-faint">We use your details only to respond to this request.</p>
                      <Button type="submit" loading={submitting} withArrow>
                        Send message
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            {CHANNELS.map((c, i) => (
              <Reveal key={c.title} delay={0.06 * i}>
                <a
                  href={`mailto:${c.email}`}
                  aria-label={`${c.title}: ${c.text} Email ${c.email}`}
                  className="group accent-border-hover surface-card flex gap-4 rounded-card p-6 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-accent-500/20 bg-accent-500/[0.07] text-accent-300">
                    <c.icon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-display text-[16px] font-semibold text-fg">{c.title}</span>
                    <span className="mt-1 block text-[13.5px] text-fg-subtle">{c.text}</span>
                    <span className="mt-2 block text-[13.5px] font-medium text-accent-300 group-hover:text-accent-200">{c.email}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
