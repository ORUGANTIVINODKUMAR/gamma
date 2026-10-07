import { motion } from 'framer-motion'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'
import { formatNumber, parseMoney } from '@/lib/format'
import { InfoTip } from './Tooltip'

export const inputBase =
  'h-11 w-full rounded-field border border-line/10 bg-ink-900/80 px-3.5 text-[14.5px] text-fg placeholder:text-fg-faint ' +
  'outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-premium ' +
  'hover:border-line/20 focus:border-accent-500/70 focus:bg-ink-850 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] ' +
  'aria-[invalid=true]:border-critical/70 aria-[invalid=true]:focus:shadow-[0_0_0_4px_rgba(208,59,59,0.15)] ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

/* ── Field wrapper ─────────────────────────────────────────────────────── */

interface FieldProps {
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  info?: string
  error?: string
  children: ReactNode
  className?: string
  optional?: boolean
}

export function Field({ label, htmlFor, hint, info, error, children, className, optional }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-1.5">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg-muted">
          {label}
          {optional && <span className="ml-1.5 font-normal text-fg-faint">Optional</span>}
        </label>
        {info && <InfoTip text={info} />}
      </div>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-[12.5px] text-critical-soft">
          {error}
        </p>
      ) : hint ? (
        <p id={htmlFor ? `${htmlFor}-hint` : undefined} className="text-[12px] leading-relaxed text-fg-faint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/* ── Text input ────────────────────────────────────────────────────────── */

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode
  trailing?: ReactNode
  invalid?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { leading, trailing, invalid, className, ...rest },
  ref,
) {
  return (
    <div className="relative">
      {leading && <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-fg-faint">{leading}</span>}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={rest.id ? `${rest.id}-${invalid ? 'error' : 'hint'}` : undefined}
        className={cn(inputBase, !!leading && 'pl-10', !!trailing && 'pr-11', className)}
        {...rest}
      />
      {trailing && <span className="absolute inset-y-0 right-1.5 grid place-items-center">{trailing}</span>}
    </div>
  )
})

/* ── Numeric input (money / percent) ───────────────────────────────────── */

interface NumericInputProps {
  id?: string
  value: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  allowNegative?: boolean
  decimals?: number
  placeholder?: string
  className?: string
  'aria-label'?: string
  max?: number
}

/** Shows "$12,500" at rest, raw digits while editing; accepts "12.5k". */
export function NumericInput({
  id,
  value,
  onChange,
  prefix,
  suffix,
  allowNegative = false,
  decimals = 0,
  placeholder = '0',
  className,
  max,
  ...aria
}: NumericInputProps) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState('')

  const display = focused
    ? draft
    : value === 0
      ? ''
      : decimals > 0
        ? value.toLocaleString('en-US', { maximumFractionDigits: decimals })
        : formatNumber(value)

  const commit = (raw: string) => {
    let n = parseMoney(raw)
    if (!allowNegative) n = Math.abs(n)
    if (max !== undefined) n = Math.min(n, max)
    n = decimals > 0 ? Number(n.toFixed(decimals)) : Math.round(n)
    onChange(n)
  }

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-[14px] text-fg-faint">{prefix}</span>
      )}
      <input
        id={id}
        inputMode={allowNegative || decimals > 0 ? 'text' : 'numeric'}
        autoComplete="off"
        placeholder={placeholder}
        value={display}
        onFocus={(e) => {
          setFocused(true)
          setDraft(value === 0 ? '' : String(value))
          requestAnimationFrame(() => e.target.select())
        }}
        onChange={(e) => {
          const raw = e.target.value
          if (/^-?[\d,.$\s]*[kKmM]?$/.test(raw)) {
            setDraft(raw)
            commit(raw)
          }
        }}
        onBlur={() => setFocused(false)}
        className={cn(inputBase, 'tabular text-right', prefix && 'pl-8', suffix && 'pr-9', className)}
        {...aria}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-3.5 grid place-items-center text-[14px] text-fg-faint">{suffix}</span>
      )}
    </div>
  )
}

export function MoneyField({
  label,
  value,
  onChange,
  hint,
  info,
  allowNegative,
  className,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: ReactNode
  info?: string
  allowNegative?: boolean
  className?: string
}) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} info={info} className={className}>
      <NumericInput id={id} value={value} onChange={onChange} prefix="$" allowNegative={allowNegative} />
    </Field>
  )
}

export function PercentField({
  label,
  value,
  onChange,
  hint,
  info,
  className,
}: {
  label: string
  /** 0–100 */
  value: number
  onChange: (v: number) => void
  hint?: ReactNode
  info?: string
  className?: string
}) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} info={info} className={className}>
      <NumericInput id={id} value={value} onChange={onChange} suffix="%" decimals={2} max={100} />
    </Field>
  )
}

/* ── Select ────────────────────────────────────────────────────────────── */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly { value: string | number; label: string }[]
}

export function Select({ options, className, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select className={cn(inputBase, 'cursor-pointer appearance-none pr-10', className)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-800 text-fg">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-faint" />
    </div>
  )
}

export function SelectField<T extends string | number>({
  label,
  value,
  onChange,
  options,
  hint,
  info,
  className,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: readonly { value: T; label: string }[]
  hint?: ReactNode
  info?: string
  className?: string
}) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} info={info} className={className}>
      <Select
        id={id}
        value={value}
        options={options}
        onChange={(e) => {
          const raw = e.target.value
          const match = options.find((o) => String(o.value) === raw)
          if (match) onChange(match.value)
        }}
      />
    </Field>
  )
}

/* ── Switch ────────────────────────────────────────────────────────────── */

export function Switch({
  checked,
  onChange,
  label,
  description,
  id,
  className,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  description?: ReactNode
  id?: string
  className?: string
}) {
  const autoId = useId()
  const switchId = id ?? autoId
  const labelId = `${switchId}-label`
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <label id={labelId} htmlFor={switchId} className="cursor-pointer text-[13.5px] font-medium text-fg-muted">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[12px] leading-relaxed text-fg-faint">{description}</p>}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ease-premium',
          checked ? 'border-accent-500 bg-accent-500' : 'border-line/15 bg-line/[0.12] hover:bg-line/[0.18]',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          className={cn(
            'block size-[18px] rounded-full shadow-md',
            checked ? 'ml-[22px] bg-white' : 'ml-[3px] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.3)]',
          )}
        />
      </button>
    </div>
  )
}

/* ── Segmented control ─────────────────────────────────────────────────── */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  size = 'md',
}: {
  value: T
  onChange: (v: T) => void
  options: readonly { value: T; label: string }[]
  label: string
  className?: string
  size?: 'sm' | 'md'
}) {
  const group = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      tabIndex={-1}
      className={cn('inline-flex rounded-full border border-line/10 bg-ink-900/80 p-1', className)}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        e.preventDefault()
        const i = options.findIndex((o) => o.value === value)
        const next = options[(i + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length]!
        onChange(next.value)
        const btn = (e.currentTarget as HTMLElement).querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
        btn?.focus()
      }}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            data-value={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative flex-1 whitespace-nowrap rounded-full font-medium transition-colors duration-200',
              size === 'sm' ? 'h-7 px-3 text-[12px]' : 'h-8 px-3.5 text-[13px]',
              active ? 'text-white' : 'text-fg-subtle hover:text-fg',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${group}`}
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className="absolute inset-0 rounded-full bg-accent-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Stepper (small integers) ──────────────────────────────────────────── */

export function StepperField({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  hint,
  className,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  hint?: ReactNode
  className?: string
}) {
  const id = useId()
  const btn =
    'grid size-9 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-line/[0.06] hover:text-accent-300 disabled:opacity-30 disabled:hover:bg-transparent'
  return (
    <Field label={label} htmlFor={id} hint={hint} className={className}>
      <div className="flex h-11 items-center justify-between rounded-field border border-line/10 bg-ink-900/80 px-1">
        <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`}>
          <Minus className="size-4" />
        </button>
        <output id={id} aria-live="polite" className="tabular text-[15px] font-semibold text-fg">
          {value}
        </output>
        <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase ${label}`}>
          <Plus className="size-4" />
        </button>
      </div>
    </Field>
  )
}

/* ── Checkbox ──────────────────────────────────────────────────────────── */

export function Checkbox({
  checked,
  onChange,
  children,
  id,
  invalid,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
  id?: string
  invalid?: boolean
}) {
  const autoId = useId()
  const cid = id ?? autoId
  return (
    <div className="flex items-start gap-3">
      <span className="relative mt-0.5 grid size-[18px] shrink-0 place-items-center">
        <input
          id={cid}
          type="checkbox"
          checked={checked}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.checked)}
          className={cn(
            'peer size-[18px] cursor-pointer appearance-none rounded-[5px] border bg-ink-900 transition-colors',
            'checked:border-accent-400 checked:bg-accent-500 hover:border-line/30',
            invalid ? 'border-critical/70' : 'border-line/20',
          )}
        />
        <svg viewBox="0 0 16 16" aria-hidden className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100">
          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <label htmlFor={cid} className="cursor-pointer text-[13.5px] leading-snug text-fg-subtle">
        {children}
      </label>
    </div>
  )
}
