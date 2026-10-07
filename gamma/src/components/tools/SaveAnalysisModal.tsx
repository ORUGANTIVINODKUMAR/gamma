import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, Select, TextInput } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import type { ToolId } from '@/config/tools'
import { formatDate } from '@/lib/format'
import { TOOL_SUMMARY_LABEL, type AnalysisSummary } from '@/services/summaries'
import { useWorkspace, workspace } from '@/services/workspace'

const NEW_CLIENT = '__new__'
const NONE = ''

interface SaveProps {
  onClose: () => void
  toolId: ToolId
  input: unknown
  summary: AnalysisSummary
  defaultClientId?: string | null
}

/** Rendered only while the modal is open, so its fields start fresh each time. */
function SaveForm({ onClose, toolId, input, summary, defaultClientId }: SaveProps) {
  const { clients } = useWorkspace()
  const ids = { title: useId(), client: useId(), newClient: useId() }
  const [title, setTitle] = useState(() => `${TOOL_SUMMARY_LABEL[toolId]} · ${formatDate(new Date())}`)
  const [clientId, setClientId] = useState<string>(defaultClientId ?? NONE)
  const [newClient, setNewClient] = useState('')
  const [error, setError] = useState<{ field: 'title' | 'client'; message: string } | null>(null)

  const save = () => {
    if (!title.trim()) return setError({ field: 'title', message: 'Give this analysis a title.' })
    let finalClient: string | null = clientId || null
    if (clientId === NEW_CLIENT) {
      if (!newClient.trim()) return setError({ field: 'client', message: 'Enter the new client’s name.' })
      finalClient = workspace.addClient({ name: newClient.trim(), type: 'Individual', entity: 'Individual' }).id
    }
    const saved = workspace.saveAnalysis({ toolId, title: title.trim(), clientId: finalClient, input, ...summary })
    onClose()
    toast('Analysis saved to your workspace', { action: { label: 'View report', to: `/app/reports?analysis=${saved.id}` } })
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <Field label="Title" htmlFor={ids.title} error={error?.field === 'title' ? error.message : undefined}>
        <TextInput id={ids.title} data-autofocus value={title} invalid={error?.field === 'title'} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Client" htmlFor={ids.client}>
        <Select
          id={ids.client}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          options={[{ value: NONE, label: 'Unassigned' }, ...clients.map((c) => ({ value: c.id, label: c.name })), { value: NEW_CLIENT, label: '+ Add a new client…' }]}
        />
      </Field>
      {clientId === NEW_CLIENT && (
        <Field label="New client name" htmlFor={ids.newClient} error={error?.field === 'client' ? error.message : undefined}>
          <TextInput id={ids.newClient} value={newClient} invalid={error?.field === 'client'} onChange={(e) => setNewClient(e.target.value)} placeholder="e.g. Jordan & Sam Rivera" />
        </Field>
      )}
      <div className="rounded-xl border border-line/[0.07] bg-line/[0.02] p-4">
        <p className="text-[12px] text-fg-faint">{summary.headline.label}</p>
        <p className="mt-0.5 font-display text-xl font-semibold text-fg">{summary.headline.value}</p>
      </div>
      <div className="-mx-6 -mb-4 mt-1 flex flex-col-reverse gap-2 border-t border-line/[0.06] px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save analysis</Button>
      </div>
    </form>
  )
}

export function SaveAnalysisModal({ open, ...props }: SaveProps & { open: boolean }) {
  return (
    <Modal open={open} onClose={props.onClose} title="Save analysis" description="Saved analyses appear on your dashboard and in Reports, attached to the client you choose.">
      <SaveForm {...props} />
    </Modal>
  )
}
