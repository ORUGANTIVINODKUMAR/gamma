/**
 * HTTP client for the Tapreco backend.
 *
 * Configure with VITE_API_BASE_URL. When it is not set the app runs in demo
 * mode and services use their in-browser adapters instead of this client.
 */

const rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
export const API_BASE_URL = rawBase.replace(/\/+$/, '')
export const IS_DEMO_MODE = API_BASE_URL === ''

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

let tokenProvider: () => string | null = () => null
let unauthorizedHandler: (() => void) | null = null

/** Auth registers how to read the current token (avoids a circular import). */
export function setTokenProvider(fn: () => string | null): void {
  tokenProvider = fn
}

/** Called once per 401 so the app can sign the user out cleanly. */
export function onUnauthorized(fn: () => void): void {
  unauthorizedHandler = fn
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  /** Skip the Authorization header (login, signup, password reset). */
  anonymous?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const token = options.anonymous ? null : tokenProvider()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      credentials: 'include',
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError('Unable to reach Tapreco. Check your connection and try again.', 0, null)
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data: unknown = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    if (response.status === 401 && token && unauthorizedHandler) unauthorizedHandler()
    const serverMessage =
      data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : null
    const message =
      serverMessage ?? (response.status === 401 ? 'Your session has expired. Please sign in again.' : `Request failed (${response.status}).`)
    throw new ApiError(message, response.status, data)
  }
  return data as T
}
