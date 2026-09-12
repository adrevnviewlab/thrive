export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Replay protection for mutations; the API stores it alongside the movement. */
  idempotencyKey?: string
  query?: Record<string, string | number | boolean | undefined | null>
}

export interface ApiClient {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>
  baseUrl: string
}

function parseJsonBody(text: string): Record<string, unknown> {
  if (!text) return {}
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return { error: text.slice(0, 200) || 'Non-JSON response' }
  }
}

export function createApiClient(options: {
  baseUrl: string
  getToken: () => string | null | Promise<string | null>
  /** Sandbox only: acts as this account on an API started with AUTH_DISABLED. */
  getSandboxUser?: () => string | null
  /** Fired once when the API rejects the session so the SPA can sign out. */
  onUnauthorized?: () => void
}): ApiClient {
  const baseUrl = options.baseUrl.replace(/\/$/, '')

  return {
    baseUrl,
    async request<T>(path: string, request: ApiRequestOptions = {}): Promise<T> {
      const url = new URL(`${baseUrl}${path}`)
      for (const [key, value] of Object.entries(request.query ?? {})) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value))
        }
      }

      const headers: Record<string, string> = { 'content-type': 'application/json' }
      const token = await options.getToken()
      if (token) headers.authorization = `Bearer ${token}`
      const sandboxUser = options.getSandboxUser?.()
      if (!token && sandboxUser) headers['x-test-user'] = sandboxUser
      if (request.idempotencyKey) headers['idempotency-key'] = request.idempotencyKey

      let response: Response
      try {
        response = await fetch(url.toString(), {
          method: request.method ?? 'GET',
          headers,
          body: request.body === undefined ? undefined : JSON.stringify(request.body),
        })
      } catch (error) {
        throw new ApiError(
          error instanceof Error ? `Cannot reach the API: ${error.message}` : 'Cannot reach the API',
          0,
        )
      }

      const text = await response.text()
      const payload = parseJsonBody(text)

      if (!response.ok) {
        if (response.status === 401) options.onUnauthorized?.()
        const message = typeof payload.error === 'string' ? payload.error : `Request failed (${response.status})`
        throw new ApiError(message, response.status, payload.details)
      }

      return payload as T
    },
  }
}

/** Stable-ish key so a double click or a flaky connection cannot double count. */
export function newIdempotencyKey(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}-${random}`
}

export const centsToDollars = (cents: number | null | undefined): number => Math.round(cents ?? 0) / 100
export const dollarsToCents = (dollars: number): number => Math.round(dollars * 100)
