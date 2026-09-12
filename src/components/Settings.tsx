import { useEffect, useState } from 'react'
import { useDataSource, usePermissions, useSettings, useViewer } from '../data/provider'
import { formatNumber, formatRelative } from '../lib/format'
import { useTheme, type ThemePreference } from '../theme'
import { ErrorState } from './States'

export default function Settings() {
  const source = useDataSource()
  const { canManageSettings: canEdit, canManageInventory: canRunJobs } = usePermissions()

  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState<'retry' | 'reconcile' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const { preference, setPreference } = useTheme()
  const { data: settings, error, refresh } = useSettings()
  const viewer = useViewer()

  // Seed the store fields once the merchant loads, without stomping edits after.
  useEffect(() => {
    if (!settings) return
    setName(settings.merchant.name)
    setTimezone(settings.merchant.timezone)
  }, [settings])

  const clover = settings?.clover
  const sync = settings?.sync
  const dirty = Boolean(settings) && (name !== settings?.merchant.name || timezone !== settings?.merchant.timezone)

  async function handleSave() {
    setSaving(true)
    setActionError(null)
    try {
      await source.updateSettings({ name: name.trim(), timezone: timezone.trim() })
      refresh()
      // The sidebar reads the store name off the viewer, so re-read that too.
      viewer.refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  async function runJob(job: 'retry' | 'reconcile') {
    setRunning(job)
    setActionError(null)
    try {
      await source.runSyncJob(job)
      refresh()
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not start that job')
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Settings</h1>
            <p className="text-sm text-muted-fg mt-0.5">System configuration and Clover integration</p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success-bg border border-success/20 rounded-md text-success text-sm font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Saved
            </div>
          )}
        </div>
      </div>

      <div className="page-pad py-6 max-w-3xl space-y-6">
        {error && <ErrorState message={error} onRetry={refresh} />}
        {actionError && <ErrorState title="That didn't go through" message={actionError} />}

        {/* Clover Connection */}
        <section>
          <h2 className="font-display text-[16px] font-medium text-fg mb-3">Clover Integration</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-success-bg border border-success/20 flex items-center justify-center">
                  <span className="text-success font-bold text-sm">C</span>
                </div>
                <div>
                  <div className="font-medium text-fg">Clover POS</div>
                  <div className="text-xs text-muted-fg">
                    {clover
                      ? clover.mode === 'mock'
                        ? 'Mock adapter — no live merchant yet'
                        : clover.connected
                          ? `Connected (${clover.environment})`
                          : 'Not connected — run the OAuth flow'
                      : 'Loading…'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 text-xs font-medium ${clover?.connected ? 'text-success' : 'text-warning'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${clover?.connected ? 'bg-success' : 'bg-warning'}`} />
                  {clover?.connected ? 'Connected' : 'Not configured'}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: 'Store Name', value: settings?.merchant.name || '—' },
                { label: 'Clover Merchant ID', value: clover?.merchantId ?? '—', mono: true },
                { label: 'Mode', value: clover ? clover.mode : '—' },
                { label: 'Webhooks', value: clover?.webhooksConfigured ? 'Configured' : 'Not configured' },
                { label: 'Last Push', value: formatRelative(sync?.lastSyncedAt ?? null) },
                { label: 'Last Reconciliation', value: formatRelative(sync?.lastReconciledAt ?? null) },
                { label: 'Pending Sync', value: `${formatNumber(sync?.pending ?? 0)} items` },
                { label: 'Failed Sync', value: `${formatNumber(sync?.failed ?? 0)} items` },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-fg">{label}</span>
                  <span className={`font-medium text-fg ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-border bg-subtle/30">
              <div className="text-xs text-muted-fg">
                Clover credentials live on the API, never in this app. Connect a merchant by sending them through
                <span className="font-mono text-fg"> /oauth/clover/start</span>.
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-[16px] font-medium text-fg mb-3">Appearance</h2>
          <div className="bg-card border border-border rounded-lg p-5">
            <p className="text-xs text-muted-fg mb-4">Colors follow theme tokens so light and dark stay consistent across browsers and devices.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { id: 'light' as ThemePreference, label: 'Light', desc: 'Warm paper palette' },
                { id: 'dark' as ThemePreference, label: 'Dark', desc: 'Forest night palette' },
                { id: 'system' as ThemePreference, label: 'System', desc: 'Match device setting' },
              ]).map((option) => {
                const selected = preference === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPreference(option.id)}
                    className={`text-left rounded-lg border px-4 py-3 transition-colors ${
                      selected
                        ? 'border-primary bg-primary/10 text-fg'
                        : 'border-border bg-bg text-muted-fg hover:text-fg hover:border-border-strong'
                    }`}
                  >
                    <div className="text-sm font-medium text-fg">{option.label}</div>
                    <div className="text-xs mt-0.5">{option.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Sync schedule */}
        <section>
          <h2 className="font-display text-[16px] font-medium text-fg mb-3">Sync Schedule</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {[
              {
                label: 'Push pending changes to Clover',
                desc: 'Retry worker drains the sync queue every 5 minutes with exponential backoff',
                job: 'retry' as const,
                cta: 'Run retry now',
              },
              {
                label: 'Reconcile quantities against Clover',
                desc: 'Hourly pass that records every mismatch and heals the ones our ledger owns',
                job: 'reconcile' as const,
                cta: 'Reconcile now',
              },
            ].map((row) => (
              <div key={row.job} className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-fg">{row.label}</div>
                  <div className="text-xs text-muted-fg mt-0.5">{row.desc}</div>
                </div>
                <button
                  type="button"
                  disabled={!canRunJobs || running !== null}
                  title={canRunJobs ? undefined : 'Only an owner or manager can run sync jobs'}
                  onClick={() => runJob(row.job)}
                  className="px-4 py-2 rounded-md border border-border text-sm font-medium text-muted-fg hover:text-fg disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {running === row.job ? 'Running…' : row.cta}
                </button>
              </div>
            ))}
            <div className="px-5 py-3 bg-subtle/30 text-xs text-muted-fg">
              The catalog pull runs nightly and resumes from a cursor, so a large merchant never trips the function
              timeout. Schedules are deployment configuration, not per-store settings.
            </div>
          </div>
        </section>

        {/* Store Info */}
        <section>
          <h2 className="font-display text-[16px] font-medium text-fg mb-3">Store Information</h2>
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-fg mb-1" htmlFor="store-name">Store name</label>
                <input
                  id="store-name"
                  type="text"
                  value={name}
                  disabled={!canEdit}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Store name"
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-fg disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-fg mb-1" htmlFor="store-timezone">Timezone</label>
                <input
                  id="store-timezone"
                  type="text"
                  value={timezone}
                  disabled={!canEdit}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="America/New_York"
                  className="w-full px-3 py-2 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-fg disabled:opacity-60"
                />
              </div>
            </div>
            {!canEdit && <p className="text-xs text-muted-fg">Store details are owner-only.</p>}
          </div>
        </section>

        <div className="flex justify-end pt-2 pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canEdit || !dirty || saving}
            className="px-6 py-2.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
