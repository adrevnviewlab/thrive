import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Catches render failures so a single screen bug cannot blank the whole app. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('STACKR render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-[100dvh] bg-bg text-fg flex items-center justify-center page-pad">
        <div className="max-w-md w-full rounded-lg border border-border bg-card p-6 space-y-3">
          <h1 className="font-display text-xl font-medium text-fg">Something went wrong</h1>
          <p className="text-sm text-muted-fg leading-relaxed">
            The console hit an unexpected error. Reload to continue; if it keeps happening, sign out and
            try again.
          </p>
          <p className="text-xs font-mono text-danger break-words">{this.state.error.message}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3.5 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('stackr-session')
                  localStorage.removeItem('stackr-demo-session')
                } catch {
                  /* ignore */
                }
                window.location.assign('/')
              }}
              className="px-3.5 py-2 rounded-md border border-border text-sm text-muted-fg hover:text-fg"
            >
              Sign out and reset
            </button>
          </div>
        </div>
      </div>
    )
  }
}
