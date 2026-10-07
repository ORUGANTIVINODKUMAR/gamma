import { upcomingDeadlines } from '@/config/deadlines'
import { formatCurrency, formatDate } from '@/lib/format'
import { clientName, type WorkspaceState } from '@/services/workspace'

export interface AppNotification {
  id: string
  kind: 'deadline' | 'risk' | 'payment'
  title: string
  detail: string
  date: string
  href: string
}

/** Notifications derived from the calendar and the workspace — nothing is invented. */
export function buildNotifications(ws: WorkspaceState, today: Date = new Date()): AppNotification[] {
  const out: AppNotification[] = []

  for (const d of upcomingDeadlines(today, 3)) {
    out.push({
      id: `deadline-${d.date}`,
      kind: 'deadline',
      title: d.title,
      detail: d.daysAway === 0 ? 'Due today' : `Due ${formatDate(d.date)} · in ${d.daysAway} day${d.daysAway === 1 ? '' : 's'}`,
      date: d.date,
      href: '/app',
    })
  }

  for (const a of ws.analyses) {
    if (a.toolId === 'audit-risk' && (a.metrics.score ?? 0) >= 40) {
      out.push({
        id: `risk-${a.id}`,
        kind: 'risk',
        title: `${clientName(ws.clients, a.clientId)}: ${a.headline.value} audit risk`,
        detail: a.details.find((d) => d.label === 'Top indicator')?.value ?? 'Review flagged indicators',
        date: a.createdAt,
        href: `/app/tools/audit-risk?analysis=${a.id}`,
      })
    }
    if (a.toolId === 'estimated-tax' && (a.metrics.nextDueAmount ?? 0) > 0 && (a.metrics.nextDueTime ?? 0) > today.getTime()) {
      out.push({
        id: `payment-${a.id}`,
        kind: 'payment',
        title: `${clientName(ws.clients, a.clientId)}: estimate of ${formatCurrency(a.metrics.nextDueAmount ?? 0)} due`,
        detail: `Due ${formatDate(new Date(a.metrics.nextDueTime ?? 0))}`,
        date: new Date(a.metrics.nextDueTime ?? 0).toISOString(),
        href: `/app/tools/estimated-tax?analysis=${a.id}`,
      })
    }
  }
  return out
}
