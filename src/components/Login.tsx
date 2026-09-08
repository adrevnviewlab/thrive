import ThemeToggle from '../theme'
import { useAuth } from '../auth'

const previewPoints = [
  { label: 'Dashboard', detail: 'KPIs, low stock, sync queue' },
  { label: 'Inventory', detail: '18 mock SKUs with stock states' },
  { label: 'Scanner', detail: 'Barcode lookup + stock actions' },
  { label: 'Ordering', detail: 'POs, vendors, receive flow' },
  { label: 'Ops', detail: 'Counts, reports, employees' },
]

export default function Login() {
  const { enterDemo } = useAuth()

  return (
    <div className="relative h-full overflow-auto bg-bg text-fg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 15% 10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 0%, color-mix(in srgb, var(--primary) 28%, transparent), transparent 50%), linear-gradient(165deg, color-mix(in srgb, var(--sidebar) 92%, black) 0%, var(--bg) 52%, var(--subtle) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)',
        }}
      />

      <div className="relative page-pad py-5 flex items-center justify-between pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-accent text-accent-fg flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-sm tracking-[0.14em] text-sidebar-fg sm:text-fg">STACKR</div>
            <div className="text-[10px] text-sidebar-muted sm:text-muted-fg leading-none mt-0.5">Inventory for smoke shops</div>
          </div>
        </div>
        <ThemeToggle compact />
      </div>

      <main className="relative page-pad pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 sm:pt-10">
        <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Frontend demo</p>
            <h1 className="font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-[1.05] font-medium text-sidebar-fg sm:text-fg max-w-xl">
              STACKR
            </h1>
            <p className="text-base sm:text-lg text-sidebar-muted sm:text-muted-fg max-w-md leading-relaxed">
              Explore the live inventory console with mock smoke-shop data—no email, password, or Clover account required.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg">
              {previewPoints.map((item) => (
                <li key={item.label} className="rounded-lg border border-sidebar-border/40 sm:border-border bg-sidebar/40 sm:bg-card/70 px-3 py-2.5 backdrop-blur-sm">
                  <div className="text-sm font-medium text-sidebar-fg sm:text-fg">{item.label}</div>
                  <div className="text-[11px] text-sidebar-muted sm:text-muted-fg mt-0.5">{item.detail}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card shadow-[0_24px_60px_color-mix(in_srgb,var(--fg)_12%,transparent)] p-5 sm:p-7">
            <div className="mb-5">
              <h2 className="font-display text-xl font-medium text-fg">Sign in</h2>
              <p className="text-sm text-muted-fg mt-1">Use demo access to walk the UI structure with seeded data points.</p>
            </div>

            <button
              type="button"
              onClick={enterDemo}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-fg px-4 py-3.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Enter demo — no credentials
            </button>

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-fg">
              <div className="h-px flex-1 bg-border" />
              <span>or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                enterDemo()
              }}
            >
              <div>
                <label className="block text-xs font-medium text-muted-fg mb-1" htmlFor="email">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="owner@store.com"
                  autoComplete="username"
                  className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-muted-fg/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-fg mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Any value works in demo"
                  autoComplete="current-password"
                  className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-muted-fg/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-fg hover:bg-subtle transition-colors"
              >
                Continue with demo account
              </button>
            </form>

            <p className="mt-4 text-[11px] leading-relaxed text-muted-fg">
              Demo session loads Hassan's Smoke Shop mock inventory, Clover sync states, POs, vendors, counts, and reports so you can inspect the frontend layout end to end.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
