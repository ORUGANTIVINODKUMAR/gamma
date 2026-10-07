import { Link } from 'react-router-dom'

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tp-g" x1="4" y1="4" x2="28" y2="28">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="9.5" stroke="url(#tp-g)" strokeWidth="1.6" />
      <ellipse cx="16" cy="16" rx="14" ry="5" transform="rotate(-24 16 16)" stroke="#C4B5FD" strokeWidth="1" />
      <circle cx="16" cy="16" r="2.7" fill="url(#tp-g)" />
    </svg>
  )
}

export default function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" className="logo" aria-label="Tapreco home" onClick={onClick}>
      <LogoMark />
      <span className="logo-word">TAPRECO</span>
    </Link>
  )
}
