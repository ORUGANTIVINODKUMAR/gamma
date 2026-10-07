import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FileText, Layers, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Settings, UserRound, UsersRound, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Logo, LogoMark } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/primitives'
import { Tooltip, type TooltipTriggerProps } from '@/components/ui/Tooltip'
import { TOOLS } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'
import { readJSON, writeJSON } from '@/services/storage'

interface Item {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const PRIMARY: Item[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/clients', label: 'Clients', icon: UsersRound },
  { to: '/app/reports', label: 'Reports', icon: FileText },
]

const SECONDARY: Item[] = [
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
]

function SideLink({ item, collapsed, layoutGroup }: { item: Item; collapsed: boolean; layoutGroup: string }) {
  const render = (extra?: TooltipTriggerProps) => (
    <NavLink
      to={item.to}
      end={item.end}
      aria-label={collapsed ? item.label : undefined}
      {...extra}
      className={({ isActive }) =>
        cn(
          'group/side relative flex h-10 items-center gap-3 rounded-xl text-[13.5px] font-medium outline-none transition-colors duration-200',
          collapsed ? 'w-full justify-center px-0' : 'px-3',
          isActive ? 'bg-line/[0.06] text-fg' : 'text-fg-subtle hover:bg-line/[0.035] hover:text-fg focus-visible:bg-line/[0.05]',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={`${layoutGroup}-active`}
              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-accent-300 to-accent-600"
            />
          )}
          <item.icon
            aria-hidden
            className={cn(
              'size-[18px] shrink-0 transition-[color,transform] duration-300 ease-premium group-hover/side:scale-110',
              isActive ? 'text-accent-300' : 'text-fg-faint group-hover/side:text-accent-200',
            )}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
  if (!collapsed) return render()
  return (
    <Tooltip content={item.label} side="top" className="w-full">
      {(p) => render(p)}
    </Tooltip>
  )
}

export function SidebarContent({
  collapsed = false,
  onToggleCollapse,
  layoutGroup = 'sidebar',
}: {
  collapsed?: boolean
  onToggleCollapse?: () => void
  layoutGroup?: string
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [toolsOpen, setToolsOpen] = useState(() => readJSON('sidebar.toolsOpen', true))
  const toolActive = pathname.startsWith('/app/tools')

  const toggleTools = () => {
    setToolsOpen((o) => {
      writeJSON('sidebar.toolsOpen', !o)
      return !o
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 shrink-0 items-center', collapsed ? 'justify-center' : 'justify-between px-4')}>
        <Link to="/app" aria-label="Tapreco dashboard" className="rounded-lg">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="grid size-8 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-line/[0.06] hover:text-fg"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      <nav aria-label="App" className="flex-1 overflow-y-auto px-3 pb-4" data-lenis-prevent>
        {!collapsed && <p className="px-3 pb-2 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-fg-faint">Workspace</p>}
        <ul className={cn('flex flex-col gap-0.5', collapsed && 'pt-3')}>
          {PRIMARY.map((item) => (
            <li key={item.to}>
              <SideLink item={item} collapsed={collapsed} layoutGroup={layoutGroup} />
            </li>
          ))}
        </ul>

        <div className="mt-5">
          {collapsed ? (
            <div aria-hidden className="mx-auto mb-2 h-px w-8 bg-line/10" />
          ) : (
            <button
              type="button"
              onClick={toggleTools}
              aria-expanded={toolsOpen}
              aria-controls="sidebar-tools"
              className={cn(
                'group/tools flex w-full items-center justify-between rounded-xl px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] transition-colors hover:bg-line/[0.035]',
                toolActive ? 'text-accent-300' : 'text-fg-faint hover:text-fg-subtle',
              )}
            >
              <span className="flex items-center gap-2">
                <Layers className="size-3.5" aria-hidden /> Tax Tools
              </span>
              <ChevronDown className={cn('size-3.5 transition-transform duration-300 ease-premium', !toolsOpen && '-rotate-90')} aria-hidden />
            </button>
          )}
          <AnimatePresence initial={false}>
            {(toolsOpen || collapsed) && (
              <motion.ul
                id="sidebar-tools"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.32, ease: EASE_PREMIUM }}
                className="flex flex-col gap-0.5 overflow-hidden"
              >
                {TOOLS.map((tool, i) => (
                  <motion.li
                    key={tool.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.25, ease: EASE_PREMIUM }}
                  >
                    <SideLink item={{ to: tool.path, label: tool.shortName, icon: tool.icon }} collapsed={collapsed} layoutGroup={layoutGroup} />
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <ul className="mt-5 flex flex-col gap-0.5 border-t border-line/[0.06] pt-4">
          {SECONDARY.map((item) => (
            <li key={item.to}>
              <SideLink item={item} collapsed={collapsed} layoutGroup={layoutGroup} />
            </li>
          ))}
        </ul>
      </nav>

      <div className={cn('shrink-0 border-t border-line/[0.06] p-3', collapsed && 'flex flex-col items-center gap-2')}>
        {onToggleCollapse && collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="grid size-9 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-line/[0.06] hover:text-fg"
          >
            <PanelLeftOpen className="size-4" />
          </button>
        )}
        <div className={cn('flex items-center gap-3', !collapsed && 'rounded-xl bg-line/[0.025] p-2.5')}>
          <Link to="/app/profile" aria-label="Your profile" className="rounded-full">
            <Avatar name={user?.name ?? ''} />
          </Link>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-fg">{user?.name}</p>
              <p className="truncate text-[11.5px] text-fg-faint">{user?.firm}</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/login', { replace: true })
              }}
              aria-label="Log out"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-line/[0.06] hover:text-critical-soft"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
