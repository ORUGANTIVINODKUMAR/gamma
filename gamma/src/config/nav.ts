export interface NavLink {
  label: string
  to: string
}

/** Primary marketing navigation. "Tax Tools" renders as a dropdown from TOOLS. Contact lives in the footer. */
export const PRIMARY_NAV: readonly NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'Platform', to: '/platform' },
  { label: 'Tax Tools', to: '/tools' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'About', to: '/about' },
]
