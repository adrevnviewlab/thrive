import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'stackr-demo-session'
const LIVE_STORAGE_KEY = 'stackr-session'

/** Refresh a little before expiry so mid-request 401s are rare. */
const REFRESH_SKEW_MS = 60_000

export interface DemoSession {
  mode: 'demo'
  storeName: string
  userName: string
  role: string
  startedAt: string
}

export interface LiveSession {
  mode: 'live'
  storeName: string
  userName: string
  role: string
  startedAt: string
  accessToken: string
  refreshToken: string | null
  expiresAt: number
  /**
   * Set only in the local sandbox, where the API runs with AUTH_DISABLED and
   * identifies the caller by email instead of a verified token.
   */
  sandboxUser?: string
}

export type Session = DemoSession | LiveSession

interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  /** True when signing in can do real work: a Supabase project, or the local sandbox. */
  liveAuthAvailable: boolean
  /** False in the sandbox, where the API trusts the email alone. */
  passwordRequired: boolean
  /** Always true — visitors can explore with mock data without credentials. */
  demoAllowed: boolean
  enterDemo: () => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  /** Returns a usable access token, refreshing when close to expiry. */
  ensureAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''
const supabaseAuthAvailable = Boolean(supabaseUrl && supabaseKey)
/**
 * `pnpm dev:sandbox` in stackr-api serves the real endpoints against an
 * in-process Postgres with auth switched off. Never honour this in a
 * production build — a mis-set env must not ship trust-by-email.
 */
const sandboxAuth = import.meta.env.VITE_API_SANDBOX === 'true' && !import.meta.env.PROD

export const liveAuthAvailable = supabaseAuthAvailable || sandboxAuth

/** Demo mock data is always available so visitors can tour the product. */
const demoAllowed = true

function readSession(): Session | null {
  try {
    const live = localStorage.getItem(LIVE_STORAGE_KEY)
    if (live) {
      const parsed = JSON.parse(live) as LiveSession
      if (parsed?.mode === 'live') {
        // Keep an expired session in memory long enough for ensureAccessToken to refresh.
        if (parsed.refreshToken || parsed.expiresAt > Date.now() || parsed.sandboxUser) {
          return parsed
        }
      }
      localStorage.removeItem(LIVE_STORAGE_KEY)
    }

    const demo = localStorage.getItem(STORAGE_KEY)
    if (demo) {
      const parsed = JSON.parse(demo) as DemoSession
      if (parsed?.mode === 'demo') {
        if (!demoAllowed) {
          localStorage.removeItem(STORAGE_KEY)
          return null
        }
        return parsed
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

function createDemoSession(): DemoSession {
  return {
    mode: 'demo',
    storeName: "Hassan's Smoke Shop",
    userName: 'Demo Owner',
    role: 'Owner',
    startedAt: new Date().toISOString(),
  }
}

const persist = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

const forget = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function sessionFromGrant(
  email: string,
  payload: {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    user?: { email?: string; user_metadata?: { full_name?: string } }
  },
): LiveSession {
  if (!payload.access_token) throw new Error('Sign in failed')
  return {
    mode: 'live',
    storeName: 'STACKR',
    userName: payload.user?.user_metadata?.full_name ?? payload.user?.email ?? email,
    role: 'Staff',
    startedAt: new Date().toISOString(),
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  }
}

/**
 * Password grant straight against Supabase Auth. Keeps the SPA dependency free;
 * the token is only ever forwarded to stackr-api as a bearer.
 */
async function passwordGrant(email: string, password: string): Promise<LiveSession> {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', apikey: supabaseKey },
    body: JSON.stringify({ email, password }),
  })

  const payload = (await response.json()) as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    user?: { email?: string; user_metadata?: { full_name?: string } }
    error_description?: string
    msg?: string
  }

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.msg ?? 'Sign in failed')
  }

  return sessionFromGrant(email, payload)
}

async function refreshGrant(refreshToken: string): Promise<LiveSession> {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', apikey: supabaseKey },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  const payload = (await response.json()) as {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    user?: { email?: string; user_metadata?: { full_name?: string } }
    error_description?: string
    msg?: string
  }

  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.msg ?? 'Session expired')
  }

  return sessionFromGrant(payload.user?.email ?? 'user', payload)
}

function sandboxSession(email: string): LiveSession {
  return {
    mode: 'live',
    storeName: 'Sandbox',
    userName: email,
    role: 'Staff',
    startedAt: new Date().toISOString(),
    accessToken: '',
    refreshToken: null,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
    sandboxUser: email,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    typeof window === 'undefined' ? null : readSession(),
  )
  const sessionRef = useRef(session)
  sessionRef.current = session
  const refreshLock = useRef<Promise<string | null> | null>(null)

  const signOut = useCallback(() => {
    forget(STORAGE_KEY)
    forget(LIVE_STORAGE_KEY)
    setSession(null)
  }, [])

  const applyLive = useCallback((next: LiveSession) => {
    persist(LIVE_STORAGE_KEY, next)
    forget(STORAGE_KEY)
    setSession(next)
  }, [])

  const ensureAccessToken = useCallback(async (): Promise<string | null> => {
    const current = sessionRef.current
    if (!current || current.mode !== 'live') return null
    if (current.sandboxUser) return current.accessToken || null
    if (current.expiresAt > Date.now() + REFRESH_SKEW_MS) return current.accessToken

    if (!current.refreshToken || !supabaseAuthAvailable) {
      signOut()
      return null
    }

    if (!refreshLock.current) {
      refreshLock.current = (async () => {
        try {
          const next = await refreshGrant(current.refreshToken!)
          // Preserve store name / display name from the prior session when the
          // refresh payload is thin.
          const merged: LiveSession = {
            ...next,
            storeName: current.storeName || next.storeName,
            userName: current.userName || next.userName,
            startedAt: current.startedAt,
          }
          applyLive(merged)
          return merged.accessToken
        } catch {
          signOut()
          return null
        } finally {
          refreshLock.current = null
        }
      })()
    }

    return refreshLock.current
  }, [applyLive, signOut])

  // Proactively refresh while the tab is open.
  useEffect(() => {
    if (!session || session.mode !== 'live' || !session.refreshToken) return
    const delay = Math.max(session.expiresAt - Date.now() - REFRESH_SKEW_MS, 5_000)
    const timer = window.setTimeout(() => {
      void ensureAccessToken()
    }, delay)
    return () => window.clearTimeout(timer)
  }, [session, ensureAccessToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      liveAuthAvailable,
      passwordRequired: supabaseAuthAvailable,
      demoAllowed,
      enterDemo: () => {
        if (!demoAllowed) return
        const next = createDemoSession()
        persist(STORAGE_KEY, next)
        setSession(next)
      },
      signIn: async (email: string, password: string) => {
        if (!supabaseAuthAvailable && !sandboxAuth) {
          throw new Error('No Supabase project is configured for this build')
        }
        const next = supabaseAuthAvailable ? await passwordGrant(email, password) : sandboxSession(email)
        applyLive(next)
      },
      signOut,
      ensureAccessToken,
    }),
    [session, applyLive, signOut, ensureAccessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
