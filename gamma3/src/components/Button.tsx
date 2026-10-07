import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Props {
  to: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm'
  className?: string
}

export default function Button({ to, children, variant = 'primary', size = 'md', className = '' }: Props) {
  return (
    <Link to={to} className={`btn btn--${variant} btn--${size} ${className}`}>
      {children}
    </Link>
  )
}
