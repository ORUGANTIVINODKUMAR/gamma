import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { TextInput } from '@/components/ui/fields'
import { cn } from '@/lib/cn'

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false)
    return (
      <TextInput
        ref={ref}
        {...props}
        type={visible ? 'text' : 'password'}
        leading={<LockKeyhole className="size-4" aria-hidden />}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="grid size-8 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-line/[0.06] hover:text-fg"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
    )
  },
)

export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  const s = Math.min(4, score) as 0 | 1 | 2 | 3 | 4
  return { score: s, label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][s]! }
}

export function isPasswordAcceptable(pw: string): boolean {
  return pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw)
}

export function StrengthMeter({ password }: { password: string }) {
  const { score, label } = passwordStrength(password)
  if (!password) return null
  return (
    <div className="mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i <= score ? (score <= 1 ? 'bg-critical' : score === 2 ? 'bg-warning' : 'bg-accent-400') : 'bg-line/10',
            )}
          />
        ))}
      </div>
      <span className="w-14 text-right text-[11.5px] text-fg-faint">{label}</span>
    </div>
  )
}
