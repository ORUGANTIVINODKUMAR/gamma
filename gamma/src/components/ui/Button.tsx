import { ArrowRight, LoaderCircle } from 'lucide-react'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Magnetic } from '@/components/motion/Magnetic'

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: Variant
  size?: Size
  /** Trailing arrow that glides right on hover. */
  withArrow?: boolean
  icon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
  /** Pull gently toward the pointer (fine pointers only). */
  magnetic?: boolean
  className?: string
  children?: ReactNode
}

type AsButton = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: undefined; href?: undefined }
type AsLink = CommonProps & Omit<LinkProps, 'className' | 'children'> & { to: string; href?: undefined }
type AsAnchor = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string; to?: undefined }

export type ButtonProps = AsButton | AsLink | AsAnchor

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-semibold tracking-[-0.005em] ' +
  'transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-premium will-change-transform ' +
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-400 ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent-400 text-white shadow-[0_10px_30px_-12px_rgba(37,99,235,0.65),inset_0_1px_0_rgba(255,255,255,0.45)] ' +
    'hover:scale-[1.02] hover:shadow-[0_16px_44px_-12px_rgba(37,99,235,0.8),inset_0_1px_0_rgba(255,255,255,0.55)] active:scale-[0.985]',
  secondary:
    'border border-accent-500/40 bg-ink-900/40 text-accent-200 backdrop-blur-sm ' +
    'hover:scale-[1.02] hover:border-accent-400/80 hover:bg-accent-500/[0.08] hover:text-accent-100 hover:shadow-[0_10px_30px_-14px_rgba(37,99,235,0.45)] active:scale-[0.985]',
  ghost: 'text-fg-muted hover:bg-line/[0.06] hover:text-fg',
  subtle: 'border border-line/10 bg-line/[0.04] text-fg hover:border-line/20 hover:bg-line/[0.07]',
  danger: 'border border-critical/40 bg-critical/10 text-critical-soft hover:border-critical/70 hover:bg-critical/15',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-[3.25rem] px-7 text-[15px]',
}

function Inner({ variant, withArrow, icon, loading, children }: CommonProps) {
  return (
    <>
      {variant === 'primary' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/35 to-transparent group-hover/btn:animate-sweep"
        />
      )}
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      <span className="relative">{children}</span>
      {withArrow && (
        <ArrowRight
          aria-hidden
          className="relative size-4 transition-transform duration-300 ease-premium group-hover/btn:translate-x-1"
        />
      )}
    </>
  )
}

export function Button({ magnetic, ...props }: ButtonProps) {
  const node = <ButtonBase {...(props as ButtonProps)} />
  return magnetic ? <Magnetic block={props.fullWidth}>{node}</Magnetic> : node
}

function ButtonBase(props: ButtonProps) {
  const { variant = 'primary', size = 'md', withArrow, icon, loading, fullWidth, className, children, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)
  const inner = <Inner variant={variant} withArrow={withArrow} icon={icon} loading={loading}>{children}</Inner>

  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link {...(rest as Omit<AsLink, keyof CommonProps>)} className={classes}>
        {inner}
      </Link>
    )
  }
  if ('href' in rest && rest.href !== undefined) {
    return (
      <a {...(rest as Omit<AsAnchor, keyof CommonProps>)} className={classes}>
        {inner}
      </a>
    )
  }
  const buttonProps = rest as Omit<AsButton, keyof CommonProps>
  return (
    <button
      type="button"
      {...buttonProps}
      disabled={buttonProps.disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {inner}
    </button>
  )
}
