import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Pencil, Search, Trash2, UserPlus, UsersRound, X } from 'lucide-react'
import { lazy, useEffect, useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SceneBoundary } from '@/components/three/core/SceneBoundary'
import { Button } from '@/components/ui/Button'
import { Field, Segmented, Select, TextInput } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Modal'
import { Avatar, Badge, EmptyState } from '@/components/ui/primitives'
import { toast } from '@/components/ui/Toast'
import { TOOLS, TOOLS_BY_ID } from '@/config/tools'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/cn'
import { formatDate, formatRelative } from '@/lib/format'
import { EASE_PREMIUM } from '@/lib/motion'
import { FILING_STATUS_LABELS, type FilingStatus } from '@/lib/tax/years'
import { useWorkspace, workspace, type Client, type ClientType, type EntityType } from '@/services/workspace'

const ENTITIES: EntityType[] = ['Individual', 'Sole proprietor', 'S corporation', 'Partnership', 'C corporation']

const ClientFolderScene = lazy(() => import('@/components/three/scenes/ClientFolderScene'))

type Draft = Omit<Client, 'id' | 'createdAt' | 'sample'>

const EMPTY_DRAFT: Draft = { name: '', type: 'Individual', entity: 'Individual', filingStatus: 'mfj', email: '', state: '', notes: '' }

function draftFrom(editing: Client | null): Draft {
  return editing
    ? { name: editing.name, type: editing.type, entity: editing.entity, filingStatus: editing.filingStatus, email: editing.email ?? '', state: editing.state ?? '', notes: editing.notes ?? '' }
    : EMPTY_DRAFT
}

/** Rendered only while the modal is open, so it always starts from `editing`. */
function ClientFormBody({ onClose, editing }: { onClose: () => void; editing: Client | null }) {
  const ids = { name: useId(), entity: useId(), status: useId(), state: useId(), email: useId() }
  const [d, setD] = useState<Draft>(() => draftFrom(editing))
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    if (!d.name.trim()) {
      setError('Enter the client’s name.')
      return
    }
    const clean: Draft = { ...d, name: d.name.trim(), state: d.state?.trim().toUpperCase().slice(0, 2), email: d.email?.trim() }
    if (editing) {
      workspace.updateClient(editing.id, clean)
      toast('Client updated')
    } else {
      workspace.addClient(clean)
      toast(`${clean.name} added to your clients`)
    }
    onClose()
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <Field label="Client name" htmlFor={ids.name} error={error ?? undefined}>
        <TextInput id={ids.name} data-autofocus value={d.name} invalid={!!error} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="e.g. Rivera Family or Rivera Design LLC" />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-fg-muted">Client type</span>
        <Segmented
          label="Client type"
          value={d.type}
          onChange={(t: ClientType) => setD({ ...d, type: t, entity: t === 'Individual' ? 'Individual' : d.entity === 'Individual' ? 'Sole proprietor' : d.entity })}
          options={[
            { value: 'Individual', label: 'Individual' },
            { value: 'Business', label: 'Business' },
          ]}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Entity" htmlFor={ids.entity}>
          <Select id={ids.entity} value={d.entity} onChange={(e) => setD({ ...d, entity: e.target.value as EntityType })} options={ENTITIES.map((x) => ({ value: x, label: x }))} />
        </Field>
        <Field label="Filing status" htmlFor={ids.status}>
          <Select
            id={ids.status}
            value={d.filingStatus ?? 'mfj'}
            onChange={(e) => setD({ ...d, filingStatus: e.target.value as FilingStatus })}
            options={(Object.keys(FILING_STATUS_LABELS) as FilingStatus[]).map((s) => ({ value: s, label: FILING_STATUS_LABELS[s] }))}
          />
        </Field>
        <Field label="State" htmlFor={ids.state} optional>
          <TextInput id={ids.state} value={d.state ?? ''} maxLength={2} onChange={(e) => setD({ ...d, state: e.target.value })} placeholder="e.g. TX" />
        </Field>
        <Field label="Email" htmlFor={ids.email} optional>
          <TextInput id={ids.email} type="email" value={d.email ?? ''} onChange={(e) => setD({ ...d, email: e.target.value })} />
        </Field>
      </div>
      <div className="-mx-6 -mb-4 mt-1 flex flex-col-reverse gap-2 border-t border-line/[0.06] px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{editing ? 'Save changes' : 'Add client'}</Button>
      </div>
    </form>
  )
}

function ClientForm({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Client | null }) {
  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit client' : 'Add client'} description="Clients organize saved analyses and reports.">
      <ClientFormBody onClose={onClose} editing={editing} />
    </Modal>
  )
}

export default function ClientsPage() {
  useDocumentTitle('Clients')
  const ws = useWorkspace()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'Individual' | 'Business'>('all')
  const [formOpen, setFormOpen] = useState(params.get('new') === '1')
  const [editing, setEditing] = useState<Client | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null)
  const selectedId = params.get('client')
  const selected = ws.clients.find((c) => c.id === selectedId) ?? null

  // "New client" deep link (/app/clients?new=1) opens the form once, then cleans the URL.
  useEffect(() => {
    if (params.get('new') !== '1') return
    setParams(
      (p) => {
        p.delete('new')
        return p
      },
      { replace: true },
    )
  }, [params, setParams])

  const counts = useMemo(() => {
    const m = new Map<string, { n: number; last?: string }>()
    for (const a of ws.analyses) {
      if (!a.clientId) continue
      const cur = m.get(a.clientId) ?? { n: 0 }
      m.set(a.clientId, { n: cur.n + 1, last: !cur.last || a.createdAt > cur.last ? a.createdAt : cur.last })
    }
    return m
  }, [ws.analyses])

  const list = ws.clients.filter(
    (c) => (filter === 'all' || c.type === filter) && `${c.name} ${c.entity} ${c.state ?? ''} ${c.email ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const select = (id: string | null) =>
    setParams((p) => {
      if (id) p.set('client', id)
      else p.delete('client')
      return p
    })

  const clientAnalyses = selected ? ws.analyses.filter((a) => a.clientId === selected.id) : []

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 className="mt-2 font-serif text-[clamp(2.4rem,4.4vw,3.6rem)] leading-none tracking-[-0.03em] text-fg">Clients</h1>
          <p className="mt-3 text-[14px] text-fg-subtle">
            <span className="tabular font-semibold text-fg">{ws.clients.length}</span> clients · <span className="tabular font-semibold text-fg">{ws.analyses.length}</span> saved analyses
          </p>
        </div>
        <Button
          icon={<UserPlus className="size-4" aria-hidden />}
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          Add client
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <TextInput
            aria-label="Search clients"
            type="search"
            placeholder="Search by name, entity or state"
            value={query}
            leading={<Search className="size-4" aria-hidden />}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Segmented
          label="Filter clients"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Individual', label: 'Individuals' },
            { value: 'Business', label: 'Businesses' },
          ]}
        />
      </div>

      <div className={cn('grid gap-6', selected && 'xl:grid-cols-[1fr_380px]')}>
        <div className="surface-card overflow-hidden rounded-panel">
          {list.length === 0 ? (
            <EmptyState
              icon={<UsersRound className="size-5" />}
              title={ws.clients.length === 0 ? 'No clients yet' : 'No clients match'}
              description={ws.clients.length === 0 ? 'Add your first client to organize analyses and reports.' : 'Try a different search or filter.'}
              action={ws.clients.length === 0 && <Button size="sm" onClick={() => setFormOpen(true)}>Add client</Button>}
            />
          ) : (
            <ul className="divide-y divide-line/[0.05]">
              {list.map((c, i) => {
                const meta = counts.get(c.id)
                const active = c.id === selectedId
                return (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 10) * 0.025, duration: 0.3, ease: EASE_PREMIUM }}
                    // a file in a drawer: it slides forward a touch when you reach for it
                    className={cn(
                      'relative flex items-center gap-4 px-4 py-3.5 transition-[background-color,transform,box-shadow] duration-300 ease-premium sm:px-5',
                      active ? 'bg-accent-500/[0.06]' : 'hover:translate-x-1 hover:bg-white hover:shadow-[0_14px_24px_-20px_rgba(15,23,42,0.4)]',
                    )}
                  >
                    {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent-400" />}
                    <Avatar name={c.name} />
                    <button type="button" onClick={() => select(active ? null : c.id)} className="min-w-0 flex-1 text-left" aria-expanded={active}>
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-semibold text-fg">{c.name}</span>
                        {c.sample && <Badge tone="neutral" withIcon={false} className="hidden sm:inline-flex">Sample</Badge>}
                      </span>
                      <span className="block truncate text-[12px] text-fg-faint">
                        {c.entity}
                        {c.filingStatus && c.type === 'Individual' ? ` · ${FILING_STATUS_LABELS[c.filingStatus]}` : ''}
                        {c.state ? ` · ${c.state}` : ''}
                      </span>
                    </button>
                    <span className="hidden w-28 text-right text-[12px] text-fg-faint md:block">
                      {meta ? `${meta.n} analys${meta.n === 1 ? 'is' : 'es'}` : 'No analyses'}
                      {meta?.last && <span className="block">{formatRelative(meta.last)}</span>}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${c.name}`}
                        onClick={() => {
                          setEditing(c)
                          setFormOpen(true)
                        }}
                        className="grid size-9 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-line/[0.06] hover:text-fg"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${c.name}`}
                        onClick={() => setConfirmDelete(c)}
                        className="grid size-9 place-items-center rounded-lg text-fg-faint transition-colors hover:bg-critical/10 hover:text-critical-soft"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </motion.li>
                )
              })}
            </ul>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.aside
              key={selected.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
              className="surface-card h-fit rounded-panel p-5 sm:p-6 xl:sticky xl:top-24"
              aria-label={`${selected.name} details`}
            >
              <SceneBoundary className="pointer-events-none -mx-2 -mt-2 mb-2 h-40" fallback={null}>
                <ClientFolderScene tone={selected.type === 'Business' ? 'pearl' : 'sapphire'} sheets={clientAnalyses.length || 1} className="absolute inset-0" />
              </SceneBoundary>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.name} size="lg" />
                  <div>
                    <h2 className="font-display text-[17px] font-semibold text-fg">{selected.name}</h2>
                    <p className="text-[12.5px] text-fg-faint">Client since {formatDate(selected.createdAt)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => select(null)} aria-label="Close client details" className="grid size-8 place-items-center rounded-lg text-fg-faint hover:bg-line/[0.06] hover:text-fg">
                  <X className="size-4" />
                </button>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-[12.5px]">
                {[
                  ['Type', selected.type],
                  ['Entity', selected.entity],
                  ['Filing status', selected.filingStatus ? FILING_STATUS_LABELS[selected.filingStatus] : '—'],
                  ['State', selected.state || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-line/[0.06] bg-line/[0.02] p-3">
                    <dt className="text-fg-faint">{k}</dt>
                    <dd className="mt-0.5 font-medium text-fg">{v}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-fg-faint">Analyses</h3>
              {clientAnalyses.length === 0 ? (
                <p className="mt-3 text-[13px] text-fg-faint">No saved analyses for this client yet.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {clientAnalyses.map((a) => {
                    const t = TOOLS_BY_ID[a.toolId]
                    return (
                      <li key={a.id}>
                        <Link to={`${t.path}?analysis=${a.id}`} className="group flex items-center gap-3 rounded-xl border border-line/[0.05] p-3 transition-colors hover:border-accent-500/30">
                          <t.icon className="size-4 shrink-0 text-accent-300" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-fg">{a.title}</span>
                            <span className="block text-[11.5px] text-fg-faint">{a.headline.label}: {a.headline.value}</span>
                          </span>
                          <ArrowRight className="size-4 text-fg-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent-300" aria-hidden />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}

              <h3 className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-fg-faint">Start an analysis</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {TOOLS.map((t) => (
                  <Link key={t.id} to={t.path} className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/20 bg-accent-500/[0.05] px-3 py-1.5 text-[12px] text-accent-200 transition-colors hover:border-accent-400/50">
                    <t.icon className="size-3.5" aria-hidden /> {t.shortName}
                  </Link>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ClientForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete client?"
        size="sm"
        description={confirmDelete ? `${confirmDelete.name} will be removed. Their saved analyses are kept and become unassigned.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDelete) {
                  workspace.removeClient(confirmDelete.id)
                  if (selectedId === confirmDelete.id) select(null)
                  toast(`${confirmDelete.name} deleted`, { tone: 'info' })
                }
                setConfirmDelete(null)
              }}
            >
              Delete client
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-fg-subtle">This can’t be undone.</p>
      </Modal>
    </div>
  )
}
