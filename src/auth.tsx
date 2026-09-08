import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'stackr-demo-session'

export interface DemoSession {
  mode: 'demo'
  storeName: string
  userName: string
  role: string
  startedAt: string
}

interface AuthContextValue {
  session: DemoSession | null
  isAuthenticated: boolean
  enterDemo: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoSession
    if (parsed?.mode === 'demo') return parsed
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(() =>
    typeof window === 'undefined' ? null : readSession(),
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      enterDemo: () => {
        const next = createDemoSession()
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        setSession(next)
      },
      signOut: () => {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
        setSession(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
