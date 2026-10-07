import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, FileText, Printer, Search, Trash2, X } from 'lucide-react'
import { lazy, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SceneBoundary } from '@/components/three/core/SceneBoundary'
import { Button } from '@/components/ui/Button'
import { Select, TextInput } from '@/components/ui/fields'
import { LogoMark } from '@/components/ui/Logo'
import { Modal } from '@/components/ui/Modal'
import { Badge, EmptyState } from '@/components/ui/primitives'
import { toast } from '@/components/ui/Toast'
import { TOOLS, TOOLS_BY_ID, type ToolId } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/cn'
import { formatDate, formatRelative } from '@/lib/format'
import { EASE_PREMIUM } from '@/lib/motion'
import { clientName, useWorkspace, workspace, type Analysis } from '@/services/workspace'

const ReportShelfScene = lazy(() => import('@/components/three/scenes/ReportShelfScene'))

function ReportView({ analysis, onClose }: { analysis: Analysis; onClose: () => void }) {
  const { user } = useAuth()
  const { clients } = useWorkspace()
  const tool = TOOLS_BY_ID[analysis.toolId]
  return (
    <motion.section
      // the report opens like a page turning toward you
      initial={{ opacity: 0, rotateY: -16, x: -28, transformPerspective: 1800 }}
      animate={{ opacity: 1, rotateY: 0, x: 0, transformPerspective: 1800, transition: { duration: 0.6, ease: EASE_PREMIUM } }}
      exit={{ opacity: 0, rotateY: 10, x: 16, transformPerspective: 1800, transition: { duration: 0.22 } }}
      style={{ transformOrigin: 'left center' }}
      aria-label="Report preview"
      className="flex flex-col gap-4"
    >
      <div data-print-hide className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[16px] font-semibold text-fg">Report preview</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="subtle" icon={<Printer className="size-4" aria-hidden />} onClick={() => window.print()}>
            Print / PDF
          </Button>
          <Button size="sm" variant="ghost" icon={<X className="size-4" aria-hidden />} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      <article
        data-print-region
        className="relative rounded-[1.25rem] bg-[linear-gradient(100deg,#ece9e1_0,#fbfaf6_28px)] p-6 pl-9 text-fg shadow-[0_1px_0_#fff_inset,0_2px_4px_rgba(15,23,42,0.06),0_44px_70px_-34px_rgba(15,23,42,0.35)] sm:p-10 sm:pl-14"
      >
        <header className="flex items-center justify-between border-b border-black/10 pb-4">
          <span className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="font-display text-[13px] font-semibold tracking-[0.3em]">TAPRECO</span>
          </span>
          <span className="text-right text-[11.5px] text-black/55">
            {tool.name}
            <br />
            Prepared {formatDate(new Date(), 'long')}
          </span>
        </header>
        <h3 className="mt-6 font-display text-[24px] font-semibold tracking-[-0.02em]">{analysis.title}</h3>
        <p className="mt-1 text-[13px] text-black/60">
          Client: {clientName(clients, analysis.clientId)} · Analysis date {formatDate(analysis.createdAt, 'long')}
        </p>
        <div className="mt-6 rounded-xl border border-black/10 bg-line/60 p-5">
          <p className="text-[12px] uppercase tracking-[0.12em] text-black/50">{analysis.headline.label}</p>
          <p className="mt-1 font-display text-[32px] font-semibold">{analysis.headline.value}</p>
        </div>
        <table className="mt-6 w-full text-[13.5px]">
          <caption className="sr-only">Key results</caption>
          <tbody>
            {analysis.details.map((d) => (
              <tr key={d.label} className="border-b border-black/10 last:border-0">
                <th scope="row" className="py-2.5 text-left font-normal text-black/65">{d.label}</th>
                <td className="tabular py-2.5 text-right font-semibold">{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-8 border-t border-black/10 pt-4 text-[11px] leading-relaxed text-black/50">
          Prepared {user ? `by ${user.name}, ${user.firm}` : ''} using Tapreco. Results are estimates based on the information provided and current federal
          law, intended for review by a licensed tax professional. Not tax or legal advice.
        </p>
      </article>
      <Link data-print-hide to={`${tool.path}?analysis=${analysis.id}`} className="group inline-flex items-center gap-1.5 self-start text-[13.5px] font-semibold text-accent-300 hover:text-accent-200">
        Open the full analysis in {tool.shortName}
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </motion.section>
  )
}

export default function ReportsPage() {
  useDocumentTitle('Reports')
  const ws = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [toolFilter, setToolFilter] = useState<'all' | ToolId>('all')
  const [confirm, setConfirm] = useState<Analysis | null>(null)
  const openId = params.get('analysis')
  const open = ws.analyses.find((a) => a.id === openId) ?? null

  const list = useMemo(
    () =>
      ws.analyses.filter(
        (a) =>
          (toolFilter === 'all' || a.toolId === toolFilter) &&
          `${a.title} ${clientName(ws.clients, a.clientId)} ${TOOLS_BY_ID[a.toolId].name}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [ws, toolFilter, query],
  )

  const setOpen = (id: string | null) =>
    setParams((p) => {
      if (id) p.set('analysis', id)
      else p.delete('analysis')
      return p
    })

  return (
    <div className="flex flex-col gap-6">
      <header data-print-hide className="studio-bg relative overflow-hidden rounded-[2rem] border border-white/80 px-6 py-7 shadow-[0_40px_90px_-60px_rgba(15,23,42,0.4)] sm:px-9 sm:py-8">
        <div className="relative z-10 max-w-md">
          <p className="eyebrow">Workspace</p>
          <h1 className="mt-2 font-serif text-[clamp(2.4rem,4.4vw,3.6rem)] leading-none tracking-[-0.03em] text-fg">Reports</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-fg-subtle">
            Every saved analysis, ready to reopen, print or share as PDF.
            <span className="tabular ml-1 font-semibold text-fg">{ws.analyses.length}</span> on file.
          </p>
        </div>
        <SceneBoundary className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] sm:block" fallback={null}>
          <ReportShelfScene open={!!open} count={ws.analyses.length} className="absolute inset-0" />
        </SceneBoundary>
      </header>

      <div data-print-hide className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-sm">
          <TextInput aria-label="Search reports" type="search" placeholder="Search by title, client or tool" value={query} leading={<Search className="size-4" aria-hidden />} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-full sm:w-64">
          <Select
            aria-label="Filter by tool"
            value={toolFilter}
            onChange={(e) => setToolFilter(e.target.value as 'all' | ToolId)}
            options={[{ value: 'all', label: 'All tools' }, ...TOOLS.map((t) => ({ value: t.id, label: t.name }))]}
          />
        </div>
      </div>

      <div className={cn('grid items-start gap-6', open && '2xl:grid-cols-[1fr_1fr]')}>
        <div data-print-hide>
          {list.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-5" />}
              title={ws.analyses.length === 0 ? 'No reports yet' : 'No reports match'}
              description={ws.analyses.length === 0 ? 'Run a tool and choose “Save analysis” to create your first report.' : 'Try a different search or tool filter.'}
              action={ws.analyses.length === 0 && <Button to={TOOLS[0]!.path} size="sm">Open a tool</Button>}
            />
          ) : (
            <ul className="flex flex-col gap-3.5">
              {list.map((a, i) => {
                const t = TOOLS_BY_ID[a.toolId]
                const active = a.id === openId
                return (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 10) * 0.03, duration: 0.4, ease: EASE_PREMIUM }}
                    className={cn(
                      // a sheet on a stack: two thin pages beneath, lifts when hovered or open
                      'group/doc relative flex flex-col gap-3 rounded-2xl border bg-[linear-gradient(180deg,#fff,#fcfbf8)] px-4 py-4 transition-[transform,box-shadow,border-color] duration-300 ease-premium sm:flex-row sm:items-center sm:px-5',
                      'before:pointer-events-none before:absolute before:inset-x-2 before:-bottom-[5px] before:-z-10 before:h-3 before:rounded-b-2xl before:border before:border-t-0 before:border-line/[0.07] before:bg-white',
                      'after:pointer-events-none after:absolute after:inset-x-4 after:-bottom-[9px] after:-z-20 after:h-3 after:rounded-b-2xl after:border after:border-t-0 after:border-line/[0.05] after:bg-white/80',
                      active
                        ? 'z-10 -translate-y-0.5 border-accent-500/35 shadow-[0_26px_44px_-26px_rgba(37,99,235,0.45)]'
                        : 'border-line/[0.08] shadow-[0_1px_2px_rgba(15,23,42,0.05),0_14px_26px_-22px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 hover:shadow-[0_26px_40px_-26px_rgba(15,23,42,0.4)]',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent-500/20 bg-accent-500/[0.07] text-accent-300">
                        <t.icon className="size-[18px]" aria-hidden />
                      </span>
                      <button type="button" onClick={() => setOpen(active ? null : a.id)} className="min-w-0 flex-1 text-left">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-semibold text-fg">{a.title}</span>
                          {a.sample && <Badge tone="neutral" withIcon={false} className="hidden sm:inline-flex">Sample</Badge>}
                        </span>
                        <span className="block truncate text-[12px] text-fg-faint">
                          {clientName(ws.clients, a.clientId)} · {t.shortName} · {formatRelative(a.createdAt)}
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-4 pl-[54px] sm:pl-0">
                      <span className="text-right">
                        <span className="block text-[11px] text-fg-faint">{a.headline.label}</span>
                        <span className="tabular block text-[14px] font-semibold text-fg">{a.headline.value}</span>
                      </span>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => setOpen(a.id)} aria-label={`Preview report: ${a.title}`} className="grid size-9 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-line/[0.06] hover:text-accent-200">
                          <Printer className="size-4" />
                        </button>
                        <Link to={`${t.path}?analysis=${a.id}`} aria-label={`Open ${a.title} in ${t.shortName}`} className="grid size-9 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-line/[0.06] hover:text-accent-200">
                          <ArrowRight className="size-4" />
                        </Link>
                        <button type="button" onClick={() => setConfirm(a)} aria-label={`Delete ${a.title}`} className="grid size-9 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-critical/10 hover:text-critical-soft">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </ul>
          )}
        </div>

        <AnimatePresence mode="wait">{open && <ReportView key={open.id} analysis={open} onClose={() => setOpen(null)} />}</AnimatePresence>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title="Delete report?"
        description={confirm ? `“${confirm.title}” will be permanently removed.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm) {
                  workspace.removeAnalysis(confirm.id)
                  if (openId === confirm.id) setOpen(null)
                  toast('Report deleted', { tone: 'info' })
                }
                setConfirm(null)
              }}
            >
              Delete report
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-fg-subtle">This can’t be undone.</p>
      </Modal>
    </div>
  )
}
