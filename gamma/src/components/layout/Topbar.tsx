import { Bell, CalendarDays, ChevronRight, ExternalLink, LogOut, Menu as MenuIcon, Plus, Search, Settings, ShieldAlert, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { buildNotifications } from '@/components/dashboard/notifications'
import { Menu, menuItemClass } from '@/components/ui/Menu'
import { Avatar } from '@/components/ui/primitives'
import { TOOLS } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/cn'
import { useWorkspace, workspace } from '@/services/workspace'
import { CommandPalette } from './CommandPalette'

const LABELS: Record<string, string> = {
  app: 'Dashboard',
  clients: 'Clients',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
  tools: 'Tax Tools',
}

function Breadcrumbs() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; to?: string }[] = [{ label: 'Dashboard', to: '/app' }]
  if (parts[1] === 'tools') {
    crumbs.push({ label: 'Tax Tools', to: '/app/tools' })
    const tool = TOOLS.find((t) => t.path === `/app/tools/${parts[2]}`)
    if (tool) crumbs.push({ label: tool.shortName })
  } else if (parts[1]) {
    crumbs.push({ label: LABELS[parts[1]] ?? parts[1] })
  }
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <li key={c.label} className={cn('flex min-w-0 items-center gap-1.5', !last && 'hidden sm:flex')}>
              {i > 0 && <ChevronRight className="hidden size-3.5 shrink-0 text-fg-faint/60 sm:block" aria-hidden />}
              {last || !c.to ? (
                <span aria-current={last ? 'page' : undefined} className={cn('truncate', last ? 'font-semibold text-fg' : 'text-fg-faint')}>
                  {c.label}
                </span>
              ) : (
                <Link to={c.to} className="truncate text-fg-faint transition-colors hover:text-fg">
                  {c.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function NotificationsMenu() {
  const ws = useWorkspace()
  const notes = useMemo(() => buildNotifications(ws), [ws])
  const unread = notes.filter((n) => !ws.readNotifications.includes(n.id))
  const icon = { deadline: CalendarDays, risk: ShieldAlert, payment: CalendarDays }

  return (
    <Menu
      label="Notifications"
      width="w-[min(22rem,calc(100vw-2rem))]"
      buttonLabel={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`}
      buttonClassName={(open) =>
        cn('relative grid size-10 place-items-center rounded-full border transition-colors', open ? 'border-accent-500/40 text-accent-200' : 'border-line/[0.08] text-fg-subtle hover:border-line/20 hover:text-fg')
      }
      button={() => (
        <>
          <Bell className="size-[18px]" aria-hidden />
          {unread.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-accent-400 px-1 text-[10px] font-bold leading-[18px] text-white">
              {unread.length}
            </span>
          )}
        </>
      )}
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-2">
        <p className="text-[13px] font-semibold text-fg">Notifications</p>
        {unread.length > 0 && (
          <button
            type="button"
            data-menu-item
            onClick={() => workspace.markNotificationsRead(notes.map((n) => n.id))}
            className="rounded-md text-[12px] font-medium text-accent-300 hover:text-accent-200"
          >
            Mark all read
          </button>
        )}
      </div>
      {notes.length === 0 ? (
        <p className="px-3 py-6 text-center text-[13px] text-fg-faint">You’re all caught up.</p>
      ) : (
        <ul className="flex flex-col">
          {notes.map((n) => {
            const Icon = icon[n.kind]
            const isUnread = !ws.readNotifications.includes(n.id)
            return (
              <li key={n.id}>
                <Link
                  to={n.href}
                  role="menuitem"
                  data-menu-item
                  onClick={() => workspace.markNotificationsRead([n.id])}
                  className={cn(menuItemClass, 'items-start')}
                >
                  <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border', n.kind === 'risk' ? 'border-serious/30 bg-serious/10 text-serious' : 'border-accent-500/25 bg-accent-500/10 text-accent-300')}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium leading-snug text-fg">{n.title}</span>
                    <span className="mt-0.5 block text-[11.5px] text-fg-faint">{n.detail}</span>
                  </span>
                  {isUnread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-400" aria-label="Unread" />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Menu>
  )
}

function NewAnalysisMenu() {
  return (
    <Menu
      label="New analysis"
      width="w-72"
      buttonClassName={() =>
        'group/btn relative hidden h-10 items-center gap-2 overflow-hidden rounded-full bg-accent-400 px-4 text-[13px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(37,99,235,0.6),inset_0_1px_0_rgba(255,255,255,0.45)] transition-transform hover:scale-[1.02] sm:inline-flex'
      }
      button={(open) => (
        <>
          <Plus className={cn('size-4 transition-transform duration-300', open && 'rotate-45')} aria-hidden />
          New analysis
        </>
      )}
    >
      <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">Choose a tool</p>
      {TOOLS.map((t) => (
        <Link key={t.id} to={t.path} role="menuitem" data-menu-item className={menuItemClass}>
          <span className="grid size-8 place-items-center rounded-lg border border-accent-500/20 bg-accent-500/[0.08] text-accent-300">
            <t.icon className="size-4" aria-hidden />
          </span>
          {t.name}
        </Link>
      ))}
    </Menu>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Menu
      label="Account"
      width="w-64"
      buttonLabel="Account menu"
      buttonClassName={() => 'rounded-full transition-transform hover:scale-105'}
      button={() => <Avatar name={user?.name ?? ''} />}
    >
      <div className="px-3 pb-3 pt-2">
        <p className="truncate text-[13.5px] font-semibold text-fg">{user?.name}</p>
        <p className="truncate text-[12px] text-fg-faint">{user?.email}</p>
      </div>
      <div className="border-t border-line/[0.06] pt-1.5">
        <Link to="/app/profile" role="menuitem" data-menu-item className={menuItemClass}>
          <UserRound className="size-4 text-fg-faint" aria-hidden /> Profile
        </Link>
        <Link to="/app/settings" role="menuitem" data-menu-item className={menuItemClass}>
          <Settings className="size-4 text-fg-faint" aria-hidden /> Settings
        </Link>
        <Link to="/" role="menuitem" data-menu-item className={menuItemClass}>
          <ExternalLink className="size-4 text-fg-faint" aria-hidden /> Tapreco website
        </Link>
        <button
          type="button"
          role="menuitem"
          data-menu-item
          data-menu-close
          onClick={async () => {
            await logout()
            navigate('/login', { replace: true })
          }}
          className={cn(menuItemClass, 'hover:text-critical-soft')}
        >
          <LogOut className="size-4 text-fg-faint" aria-hidden /> Log out
        </button>
      </div>
    </Menu>
  )
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const scrolled = useScrolled(8)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const ws = useWorkspace()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header
      data-print-hide
      className={cn(
        'sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300',
        scrolled ? 'border-line/[0.06] bg-ink-950/75 backdrop-blur-xl' : 'border-transparent bg-transparent',
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-line/[0.08] text-fg-subtle hover:text-fg lg:hidden"
        >
          <MenuIcon className="size-[18px]" />
        </button>
        <div className="min-w-0 flex-1">
          <Breadcrumbs />
        </div>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Search"
          aria-keyshortcuts="Control+K Meta+K"
          className="flex h-10 items-center gap-2.5 rounded-full border border-line/[0.08] bg-line/[0.02] px-3 text-[13px] text-fg-faint transition-colors hover:border-line/20 hover:text-fg-subtle md:w-64 md:px-4"
        >
          <Search className="size-4" aria-hidden />
          <span className="hidden min-w-0 flex-1 truncate whitespace-nowrap text-left md:inline">Search {ws.clients.length ? 'clients & tools' : 'tools'}…</span>
          <kbd className="hidden rounded-md border border-line/10 px-1.5 py-0.5 text-[10.5px] md:inline">Ctrl K</kbd>
        </button>
        <NewAnalysisMenu />
        <NotificationsMenu />
        <UserMenu />
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  )
}

