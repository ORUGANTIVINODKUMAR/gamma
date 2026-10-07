import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, FileText, Plus, ShieldAlert, Sparkles, UserPlus } from 'lucide-react'
import { lazy, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buildNotifications } from '@/components/dashboard/notifications'
import { DocumentPoster, SceneBoundary } from '@/components/three/core/SceneBoundary'
import type { StationId } from '@/components/three/scenes/DeskScene'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState, type Tone } from '@/components/ui/primitives'
import { upcomingDeadlines } from '@/config/deadlines'
import { TOOLS, TOOLS_BY_ID } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/cn'
import { formatCompactCurrency, formatCurrency, formatDate, formatRelative } from '@/lib/format'
import { EASE_PREMIUM } from '@/lib/motion'
import { riskLevel, type RiskLevel } from '@/lib/tax/auditRisk'
import { clientName, useWorkspace, workspace } from '@/services/workspace'

const DeskScene = lazy(() => import('@/components/three/scenes/DeskScene'))

const LEVEL_TONE: Record<RiskLevel, Tone> = { Low: 'good', Moderate: 'warning', Elevated: 'serious', High: 'critical' }

const STATION_PATH: Record<StationId, string> = {
  clients: '/app/clients',
  tools: '/app/tools',
  analyses: '/app/reports',
  reports: '/app/reports',
  deadlines: TOOLS_BY_ID['estimated-tax'].path,
}

function greeting(d = new Date()) {
  const h = d.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

/** A dashboard section: serif title over a hairline — typography, not a box. */
function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('border-t border-line/[0.1] pt-6', className)} aria-label={title}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-[1.65rem] leading-none tracking-[-0.02em] text-fg">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function StationLink({
  id,
  value,
  label,
  sub,
  hovered,
  onHover,
}: {
  id: StationId
  value: string
  label: string
  sub: string
  hovered: boolean
  onHover: (id: StationId | null) => void
}) {
  return (
    <Link
      to={STATION_PATH[id]}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(id)}
      onBlur={() => onHover(null)}
      className={cn(
        'group relative block rounded-2xl px-4 py-4 text-left outline-none transition-colors duration-300 ease-premium sm:text-center',
        hovered ? 'bg-white/70' : 'hover:bg-white/50',
      )}
    >
      <span className="t-numeral block text-[clamp(2.4rem,4.4vw,3.75rem)] text-fg">{value}</span>
      <span className="mt-2 flex items-center gap-1.5 text-[13.5px] font-semibold text-fg sm:justify-center">
        {label}
        <ArrowUpRight aria-hidden className="size-3.5 text-accent-400 opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
      </span>
      <span className="mt-0.5 block truncate text-[12px] text-fg-faint">{sub}</span>
    </Link>
  )
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const ws = useWorkspace()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<StationId | null>(null)
  const now = new Date()
  const isNew = user ? now.getTime() - new Date(user.createdAt).getTime() < 15 * 60_000 : false

  const stats = useMemo(() => {
    const monthAgo = now.getTime() - 30 * 86_400_000
    const recent = ws.analyses.filter((a) => new Date(a.createdAt).getTime() >= monthAgo)
    const plans = ws.analyses.filter((a) => a.toolId === 'tax-planner')
    const audits = ws.analyses.filter((a) => a.toolId === 'audit-risk')
    const avgRisk = audits.length ? Math.round(audits.reduce((s, a) => s + (a.metrics.score ?? 0), 0) / audits.length) : null
    const savings = ws.analyses
      .filter((a) => a.toolId === 'tax-planner' || a.toolId === 'entity-comparison')
      .reduce((s, a) => s + Math.max(0, a.metrics.savings ?? 0), 0)
    return { recent: recent.length, plans: plans.length, avgRisk, savings }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws])

  const payments = useMemo(
    () =>
      ws.analyses
        .filter((a) => a.toolId === 'estimated-tax' && (a.metrics.nextDueAmount ?? 0) > 0 && (a.metrics.nextDueTime ?? 0) >= now.getTime() - 86_400_000)
        .sort((a, b) => (a.metrics.nextDueTime ?? 0) - (b.metrics.nextDueTime ?? 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ws],
  )

  const risks = useMemo(() => {
    const latest = new Map<string, (typeof ws.analyses)[number]>()
    for (const a of ws.analyses) {
      if (a.toolId !== 'audit-risk') continue
      const key = a.clientId ?? a.id
      if (!latest.has(key)) latest.set(key, a)
    }
    return [...latest.values()].sort((a, b) => (b.metrics.score ?? 0) - (a.metrics.score ?? 0)).slice(0, 5)
  }, [ws])

  const savingsByClient = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of ws.analyses) {
      if ((a.toolId === 'tax-planner' || a.toolId === 'entity-comparison') && (a.metrics.savings ?? 0) > 0) {
        const name = clientName(ws.clients, a.clientId)
        map.set(name, (map.get(name) ?? 0) + (a.metrics.savings ?? 0))
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [ws])

  const deadlines = upcomingDeadlines(now, 4)
  const notes = useMemo(() => buildNotifications(ws), [ws])
  const unread = notes.filter((n) => !ws.readNotifications.includes(n.id))
  const firstName = user?.name.split(' ')[0] ?? ''
  const next = deadlines[0]
  const toolCounts = Object.fromEntries(TOOLS.map((t) => [t.id, ws.analyses.filter((a) => a.toolId === t.id).length]))

  const stations: { id: StationId; value: string; label: string; sub: string }[] = [
    { id: 'clients', value: String(ws.clients.length), label: ws.clients.length === 1 ? 'Client' : 'Clients', sub: `${ws.clients.filter((c) => c.type === 'Business').length} businesses` },
    { id: 'tools', value: String(TOOLS.length), label: 'Tax Tools', sub: 'Open the gallery' },
    { id: 'analyses', value: String(stats.recent), label: 'Analyses this month', sub: `${ws.analyses.length} saved in total` },
    { id: 'reports', value: String(ws.analyses.length), label: ws.analyses.length === 1 ? 'Report ready' : 'Reports ready', sub: `${stats.plans} tax plan${stats.plans === 1 ? '' : 's'}` },
    { id: 'deadlines', value: next ? String(next.daysAway) : '—', label: next ? (next.daysAway === 1 ? 'Day to next deadline' : 'Days to next deadline') : 'No deadlines', sub: next?.title ?? 'Everything is up to date' },
  ]

  return (
    <div className="flex flex-col gap-10">
      {/* Welcome */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[13px] text-fg-faint">
            {user?.firm} · {formatDate(now, 'long')}
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[1] tracking-[-0.03em] text-fg">
            {isNew ? 'Welcome to Tapreco, ' : `${greeting(now)}, `}
            <em className="text-accent-400">{firstName}</em>
          </h1>
          <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-fg-subtle">
            {isNew
              ? 'Your desk includes sample clients and analyses so you can explore every tool. Remove them anytime in Settings.'
              : next
                ? `Next deadline: ${next.title} — ${next.daysAway === 0 ? 'today' : `in ${next.daysAway} days`}.`
                : 'Everything is up to date.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button to="/app/clients?new=1" variant="secondary" size="sm" icon={<UserPlus className="size-4" aria-hidden />}>
            New client
          </Button>
          <Button to="/app/reports" variant="secondary" size="sm" icon={<FileText className="size-4" aria-hidden />}>
            Reports
          </Button>
          <Button to={TOOLS_BY_ID['tax-planner'].path} size="sm" icon={<Plus className="size-4" aria-hidden />} magnetic>
            New tax plan
          </Button>
        </div>
      </header>

      {/* The desk: five stations in 3D, each with its number */}
      <section aria-label="Your tax desk" className="studio-bg overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_40px_90px_-56px_rgba(15,23,42,0.4)]">
        <SceneBoundary className="relative h-[330px] sm:h-[310px]" fallback={<DocumentPoster />}>
          <DeskScene hovered={hovered} onHover={setHovered} onSelect={(id) => navigate(STATION_PATH[id])} className="absolute inset-0" />
        </SceneBoundary>
        <div className="grid grid-cols-2 gap-1 px-3 pb-4 sm:grid-cols-5 sm:px-4">
          {stations.map((s, i) => (
            <div key={s.id} className={cn(i === stations.length - 1 && 'col-span-2 sm:col-span-1')}>
              <StationLink {...s} hovered={hovered === s.id} onHover={setHovered} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-x-12 gap-y-10 xl:grid-cols-[1.35fr_1fr]">
        {/* Recent analyses */}
        <Section
          title="Recent analyses"
          action={
            <Link to="/app/reports" className="text-[12.5px] font-semibold text-accent-300 hover:text-accent-200">
              All reports
            </Link>
          }
        >
          {ws.analyses.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="size-5" />}
              title="No analyses yet"
              description="Run any tool and save the result to see it here."
              action={<Button to={TOOLS[0]!.path} size="sm">Open a tool</Button>}
            />
          ) : (
            <ul className="flex flex-col divide-y divide-line/[0.07]">
              {ws.analyses.slice(0, 6).map((a) => {
                const t = TOOLS_BY_ID[a.toolId]
                return (
                  <li key={a.id}>
                    <Link to={`${t.path}?analysis=${a.id}`} className="group flex items-center gap-4 py-3.5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-accent-400 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_8px_16px_-10px_rgba(15,23,42,0.3)] transition-transform duration-300 ease-premium group-hover:-translate-y-0.5">
                        <t.icon className="size-[18px]" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-fg group-hover:text-accent-200">{a.title}</span>
                        <span className="block truncate text-[12px] text-fg-faint">
                          {clientName(ws.clients, a.clientId)} · {t.shortName} · {formatRelative(a.createdAt)}
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-right sm:block">
                        <span className="block text-[11px] text-fg-faint">{a.headline.label}</span>
                        <span className="tabular block font-serif text-[1.35rem] leading-none text-fg">{a.headline.value}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        {/* Deadlines & alerts */}
        <Section
          title="Deadlines & alerts"
          action={
            unread.length > 0 && (
              <button type="button" onClick={() => workspace.markNotificationsRead(notes.map((n) => n.id))} className="text-[12px] font-medium text-accent-300 hover:text-accent-200">
                Mark all read
              </button>
            )
          }
        >
          <ul className="flex flex-col divide-y divide-line/[0.07]">
            {notes.slice(0, 6).map((n, i) => (
              <motion.li key={n.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.35, ease: EASE_PREMIUM }}>
                <Link to={n.href} onClick={() => workspace.markNotificationsRead([n.id])} className="flex items-start gap-3 py-3 transition-colors hover:bg-line/[0.025]">
                  <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg', n.kind === 'risk' ? 'bg-serious/10 text-serious' : 'bg-accent-500/10 text-accent-300')}>
                    {n.kind === 'risk' ? <ShieldAlert className="size-4" aria-hidden /> : <CalendarDays className="size-4" aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium leading-snug text-fg">{n.title}</span>
                    <span className="mt-0.5 block text-[11.5px] text-fg-faint">{n.detail}</span>
                  </span>
                  {!ws.readNotifications.includes(n.id) && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-400" aria-label="Unread" />}
                </Link>
              </motion.li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="grid gap-x-12 gap-y-10 xl:grid-cols-3">
        {/* Audit risk watchlist — ranked by level, not drawn as a gauge */}
        <Section
          title="Audit risk watchlist"
          action={
            <Link to={TOOLS_BY_ID['audit-risk'].path} className="text-[12.5px] font-semibold text-accent-300 hover:text-accent-200">
              New review
            </Link>
          }
        >
          {risks.length === 0 ? (
            <p className="text-[13px] text-fg-faint">Run the Audit Risk Analyzer to build a watchlist.</p>
          ) : (
            <>
              {stats.avgRisk !== null && (
                <p className="mb-3 text-[12.5px] text-fg-faint">
                  Average score <span className="tabular font-semibold text-fg">{stats.avgRisk}</span> · {riskLevel(stats.avgRisk)}
                </p>
              )}
              <ol className="flex flex-col divide-y divide-line/[0.07]">
                {risks.map((a, i) => {
                  const score = a.metrics.score ?? 0
                  const level = riskLevel(score)
                  return (
                    <li key={a.id}>
                      <Link to={`${TOOLS_BY_ID['audit-risk'].path}?analysis=${a.id}`} className="group flex items-center gap-3 py-3">
                        <span className="tabular w-5 text-[12px] text-fg-faint">{i + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-[13.5px] text-fg-muted group-hover:text-fg">{clientName(ws.clients, a.clientId)}</span>
                        <Badge tone={LEVEL_TONE[level]}>{level}</Badge>
                        <span className="tabular w-8 text-right font-serif text-[1.35rem] leading-none text-fg">{score}</span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </>
          )}
        </Section>

        <Section title="Savings identified">
          {savingsByClient.length === 0 ? (
            <p className="text-[13px] text-fg-faint">Save a tax plan or entity comparison to track savings.</p>
          ) : (
            <>
              <p className="t-numeral text-[2.6rem] text-accent-400">{formatCompactCurrency(stats.savings)}</p>
              <ul className="mt-4 flex flex-col divide-y divide-line/[0.07]" aria-label="Savings identified by client">
                {savingsByClient.map(([name, value]) => (
                  <li key={name} className="flex items-baseline justify-between gap-3 py-2.5 text-[13px]">
                    <span className="truncate text-fg-muted">{name}</span>
                    <span className="tabular shrink-0 font-semibold text-fg">{formatCurrency(value)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>

        <Section title="Upcoming payments">
          {payments.length === 0 ? (
            <p className="text-[13px] text-fg-faint">No upcoming payments from saved estimated tax plans.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line/[0.07]">
              {payments.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link to={`${TOOLS_BY_ID['estimated-tax'].path}?analysis=${a.id}`} className="group flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-fg group-hover:text-accent-200">{clientName(ws.clients, a.clientId)}</span>
                      <span className="block text-[11.5px] text-fg-faint">Due {formatDate(new Date(a.metrics.nextDueTime ?? 0))}</span>
                    </span>
                    <span className="tabular shrink-0 font-serif text-[1.35rem] leading-none text-fg">{formatCurrency(a.metrics.nextDueAmount ?? 0)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-fg-faint">By tool</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-fg-subtle">
            {TOOLS.map((t) => (
              <li key={t.id}>
                {t.shortName} <span className="tabular font-semibold text-fg">{toolCounts[t.id]}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
