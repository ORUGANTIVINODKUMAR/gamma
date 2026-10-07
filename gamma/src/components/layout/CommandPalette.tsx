import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, FileText, LayoutDashboard, Search, Settings, UserRound, UsersRound, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { TOOLS } from '@/config/tools'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'
import { useWorkspace } from '@/services/workspace'
import { getLenis } from './SmoothScroll'

interface Command {
  id: string
  label: string
  hint: string
  icon: LucideIcon
  to: string
  group: 'Tools' | 'Pages' | 'Clients'
}

const PAGES: Command[] = [
  { id: 'p-dash', label: 'Dashboard', hint: 'Overview', icon: LayoutDashboard, to: '/app', group: 'Pages' },
  { id: 'p-clients', label: 'Clients', hint: 'Manage clients', icon: UsersRound, to: '/app/clients', group: 'Pages' },
  { id: 'p-reports', label: 'Reports', hint: 'Saved analyses', icon: FileText, to: '/app/reports', group: 'Pages' },
  { id: 'p-settings', label: 'Settings', hint: 'Preferences', icon: Settings, to: '/app/settings', group: 'Pages' },
  { id: 'p-profile', label: 'Profile', hint: 'Your account', icon: UserRound, to: '/app/profile', group: 'Pages' },
]

/** Mounted only while open, so search state always starts fresh. */
function PaletteDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { clients } = useWorkspace()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const commands = useMemo<Command[]>(
    () => [
      ...TOOLS.map((t) => ({ id: t.id, label: t.name, hint: 'Tax tool', icon: t.icon, to: t.path, group: 'Tools' as const })),
      ...PAGES,
      ...clients.map((c) => ({
        id: `c-${c.id}`,
        label: c.name,
        hint: `${c.entity}${c.state ? ` · ${c.state}` : ''}`,
        icon: UsersRound,
        to: `/app/clients?client=${c.id}`,
        group: 'Clients' as const,
      })),
    ],
    [clients],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? commands.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(q))
      : [...commands.filter((c) => c.group !== 'Clients'), ...commands.filter((c) => c.group === 'Clients').slice(0, 4)]
    return list.slice(0, 12)
  }, [commands, query])

  useEffect(() => {
    const lenis = getLenis()
    lenis?.stop()
    return () => lenis?.start()
  }, [])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (c: Command | undefined) => {
    if (!c) return
    onClose()
    navigate(c.to)
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Quick search"
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: EASE_PREMIUM }}
      className="glass-strong relative w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_40px_120px_-20px_rgba(15,23,42,0.16)]"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
        else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setActive((a) => Math.min(results.length - 1, a + 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setActive((a) => Math.max(0, a - 1))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          go(results[active])
        }
      }}
    >
      <div className="flex items-center gap-3 border-b border-line/[0.07] px-4">
        <Search className="size-4 text-fg-faint" aria-hidden />
        <input
          // oxlint-disable-next-line jsx-a11y/no-autofocus -- the palette is a modal search; focus must land in the input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          placeholder="Search tools, pages and clients…"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          aria-activedescendant={results[active] ? `cmd-${results[active]!.id}` : undefined}
          className="h-14 flex-1 bg-transparent text-[15px] text-fg placeholder:text-fg-faint focus:outline-none"
        />
        <kbd className="rounded-md border border-line/10 px-1.5 py-0.5 text-[10.5px] text-fg-faint">Esc</kbd>
      </div>
      {/* WAI-ARIA combobox pattern: keyboard is handled on the input via aria-activedescendant. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role */}
      <ul ref={listRef} id="command-results" role="listbox" data-lenis-prevent className="max-h-[50vh] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-8 text-center text-[13.5px] text-fg-faint">No matches for “{query}”.</li>}
        {results.map((c, i) => (
          // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-to-interactive-role
          <li role="option"
            key={c.id}
            id={`cmd-${c.id}`}
            aria-selected={i === active}
            data-index={i}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(c)}
            className={cn('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors', i === active ? 'bg-line/[0.07]' : 'hover:bg-line/[0.04]')}
          >
            <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg border', i === active ? 'border-accent-500/40 bg-accent-500/10 text-accent-300' : 'border-line/[0.08] text-fg-faint')}>
              <c.icon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium text-fg">{c.label}</span>
              <span className="block truncate text-[11.5px] text-fg-faint">{c.hint}</span>
            </span>
            {i === active && <CornerDownLeft className="size-3.5 text-fg-faint" aria-hidden />}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

/** ⌘K / Ctrl+K quick navigation across tools, pages and clients. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div aria-hidden className="absolute inset-0 bg-line/35 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <PaletteDialog onClose={onClose} />
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
