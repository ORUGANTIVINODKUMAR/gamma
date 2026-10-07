import { apiRequest, IS_DEMO_MODE } from './api'
import { readJSON, writeJSON } from './storage'

export interface ContactMessage {
  name: string
  email: string
  firm: string
  firmSize: string
  topic: 'Sales' | 'Support' | 'Partnerships' | 'Other'
  message: string
}

/**
 * Delivers a contact request. With a backend configured it POSTs to
 * /contact; in demo mode it is kept locally and the caller offers a
 * prefilled email so the message can still be sent.
 */
export async function submitContact(msg: ContactMessage): Promise<'sent' | 'stored'> {
  if (!IS_DEMO_MODE) {
    await apiRequest('/contact', { method: 'POST', body: msg, anonymous: true })
    return 'sent'
  }
  await new Promise((r) => setTimeout(r, 500))
  const outbox = readJSON<(ContactMessage & { at: string })[]>('contact.outbox', [])
  writeJSON('contact.outbox', [...outbox, { ...msg, at: new Date().toISOString() }].slice(-20))
  return 'stored'
}
