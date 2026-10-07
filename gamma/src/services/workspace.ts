/**
 * Firm workspace: clients and saved analyses.
 *
 * Stored per user in this browser today (see README → "Backend
 * dependencies"); the API mirrors what a REST resource would expose so the
 * persistence layer can be swapped without touching components.
 */

import { useSyncExternalStore } from 'react'
import type { ToolId } from '@/config/tools'
import type { FilingStatus } from '@/lib/tax/years'
import { buildSeedWorkspace } from './seed'
import { readJSON, uid, writeJSON } from './storage'
import type { AnalysisSummary } from './summaries'

export type ClientType = 'Individual' | 'Business'
export type EntityType = 'Individual' | 'Sole proprietor' | 'S corporation' | 'Partnership' | 'C corporation'

export interface Client {
  id: string
  name: string
  type: ClientType
  entity: EntityType
  filingStatus?: FilingStatus
  email?: string
  state?: string
  notes?: string
  createdAt: string
  sample?: boolean
}

export interface Analysis extends AnalysisSummary {
  id: string
  toolId: ToolId
  title: string
  clientId: string | null
  createdAt: string
  /** Snapshot of the tool inputs — reopening the analysis restores them. */
  input: unknown
  sample?: boolean
}

export interface WorkspaceState {
  clients: Client[]
  analyses: Analysis[]
  readNotifications: string[]
}

const EMPTY: WorkspaceState = { clients: [], analyses: [], readNotifications: [] }

let currentUserId: string | null = null
let state: WorkspaceState = EMPTY
const listeners = new Set<() => void>()

const key = (userId: string) => `workspace.${userId}`

function emit() {
  listeners.forEach((l) => l())
}

function commit(next: WorkspaceState) {
  state = next
  if (currentUserId) writeJSON(key(currentUserId), state)
  emit()
}

export const workspace = {
  /** Bind the store to the signed-in user (called by AuthProvider). */
  bind(userId: string | null) {
    if (userId === currentUserId) return
    currentUserId = userId
    if (!userId) {
      state = EMPTY
    } else {
      const stored = readJSON<WorkspaceState | null>(key(userId), null)
      if (stored) {
        state = { ...EMPTY, ...stored }
      } else {
        state = buildSeedWorkspace()
        writeJSON(key(userId), state)
      }
    }
    emit()
  },

  /** Re-read after another tab changed storage. */
  refresh() {
    if (!currentUserId) return
    const stored = readJSON<WorkspaceState | null>(key(currentUserId), null)
    if (stored) {
      state = { ...EMPTY, ...stored }
      emit()
    }
  },

  storageKey(): string | null {
    return currentUserId ? `tapreco.${key(currentUserId)}` : null
  },

  get(): WorkspaceState {
    return state
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  addClient(input: Omit<Client, 'id' | 'createdAt'>): Client {
    const client: Client = { ...input, id: uid(), createdAt: new Date().toISOString() }
    commit({ ...state, clients: [client, ...state.clients] })
    return client
  },

  updateClient(id: string, patch: Partial<Omit<Client, 'id' | 'createdAt'>>) {
    commit({ ...state, clients: state.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  },

  removeClient(id: string) {
    commit({
      ...state,
      clients: state.clients.filter((c) => c.id !== id),
      analyses: state.analyses.map((a) => (a.clientId === id ? { ...a, clientId: null } : a)),
    })
  },

  saveAnalysis(input: Omit<Analysis, 'id' | 'createdAt'>): Analysis {
    const analysis: Analysis = { ...input, id: uid(), createdAt: new Date().toISOString() }
    commit({ ...state, analyses: [analysis, ...state.analyses] })
    return analysis
  },

  removeAnalysis(id: string) {
    commit({ ...state, analyses: state.analyses.filter((a) => a.id !== id) })
  },

  markNotificationsRead(ids: string[]) {
    const set = new Set([...state.readNotifications, ...ids])
    commit({ ...state, readNotifications: [...set] })
  },

  clearSamples() {
    commit({
      ...state,
      clients: state.clients.filter((c) => !c.sample),
      analyses: state.analyses.filter((a) => !a.sample),
    })
  },

  reset() {
    commit(buildSeedWorkspace())
  },
}

export function useWorkspace(): WorkspaceState {
  return useSyncExternalStore(workspace.subscribe, workspace.get, workspace.get)
}

export function clientName(clients: Client[], id: string | null): string {
  if (!id) return 'Unassigned'
  return clients.find((c) => c.id === id)?.name ?? 'Unassigned'
}
