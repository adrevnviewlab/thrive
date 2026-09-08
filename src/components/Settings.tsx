import { useState } from 'react'
import { useTheme, type ThemePreference } from '../theme'

export default function Settings() {
  const [syncInterval, setSyncInterval] = useState('5')
  const [reconcileInterval, setReconcileInterval] = useState('60')
  const [lowStockNotif, setLowStockNotif] = useState(true)
  const [syncFailNotif, setSyncFailNotif] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const { preference, setPreference } = useTheme()

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const cloverStatus = {
    connected: true,
    merchantName: "Hassan's Smoke Shop",
    merchantId: 'MCHT_9V2K4X8P',
    lastSync: '2 minutes ago',
    webhookStatus: 'receiving',
    itemsInClover: 18441,
    syncedItems: 18492,
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
                  <div className="text-xs text-muted-fg">OAuth connected</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Connected
                </span>
                <button className="ml-2 text-xs text-danger hover:underline underline-offset-2">Disconnect</button>
              </div>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: 'Merchant Name', value: cloverStatus.merchantName },
                { label: 'Merchant ID', value: cloverStatus.merchantId, mono: true },
                { label: 'Last Sync', value: cloverStatus.lastSync },
                { label: 'Webhook Status', value: 'Receiving events' },
                { label: 'Clover Inventory', value: `${cloverStatus.itemsInClover.toLocaleString()} items` },
                { label: 'Our Inventory', value: `${cloverStatus.syncedItems.toLocaleString()} items` },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-fg">{label}</span>
                  <span className={`font-medium text-fg ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-border bg-subtle/30">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-0.5">Clover API Key</div>
                  <div className="font-mono text-xs text-fg">
                    {showApiKey ? 'tok_live_8Kp2mNvQxR4ZaL9wCjSf3Y7b' : '••••••••••••••••••••••••••'}
                  </div>
                </div>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-xs text-primary font-medium hover:underline underline-offset-2"
                >
                  {showApiKey ? 'Hide' : 'Reveal'}
                </button>
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

        {/* Sync Settings */}
        <section>
          <h2 className="font-display text-[16px] font-medium text-fg mb-3">Sync Configuration</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-fg">Webhook reconciliation interval</div>
                <div className="text-xs text-muted-fg mt-0.5">How often to cross-check Clover vs. our inventory</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={reconcileInterval}
                  onChange={(e) => setReconcileInterval(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary text-fg cursor-pointer"
                >
                  <option value="30">Every 30 min</option>
                  <option value="60">Every 60 min</option>
                  <option value="120">Every 2 hours</option>
                  <option value="360">Every 6 hours</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-fg">Push inventory to Clover</div>
                <div className="text-xs text-muted-fg mt-0.5">Interval for pushing our changes back to Clover POS</div>
              </div>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary text-fg cursor-pointer"
              >
                <option value="1">Every 1 min</option>
                <option value="5">Every 5 min</option>
                <option value="15">Every 15 min</option>
                <option value="30">Every 30 min</option>
              </select>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-fg">Max sync retry attempts</div>
                <div className="text-xs text-muted-fg mt-0.5">Before marking a sync as permanently failed</div>
              </div>
              <select className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary text-fg cursor-pointer">
                <option>5 attempts</option>
                <option>10 attempts</option>
                <option>20 attempts</option>
              </select>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-fg">Webhook idempotency window</div>
                <div className="text-xs text-muted-fg mt-0.5">Deduplication window for Clover webhook events</div>
              </div>
              <select className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary text-fg cursor-pointer">
                <option>24 hours</option>
                <option>48 hours</option>
                <option>7 days</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="font-display text-[16px] font-medium text-fg mb-3">Notifications</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {[
              { label: 'Low stock alerts', desc: 'Notify when items fall below minimum threshold', state: lowStockNotif, set: setLowStockNotif },
              { label: 'Clover sync failures', desc: 'Notify when inventory fails to sync to Clover', state: syncFailNotif, set: setSyncFailNotif },
            ].map((item) => (
              <div key={item.label} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-fg">{item.label}</div>
                  <div className="text-xs text-muted-fg mt-0.5">{item.desc}</div>
                </div>
                <button
                  onClick={() => item.set(!item.state)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${item.state ? 'bg-primary' : 'bg-muted'}`}
                  style={{ height: '22px', width: '40px' }}
                >
                  <span
                    className="absolute top-0.5 w-4.5 h-4.5 bg-knob rounded-full shadow-sm transition-transform"
                    style={{
                      width: '18px',
                      height: '18px',
                      top: '2px',
                      left: item.state ? '20px' : '2px',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Store Info */}
        <section>
          <h2 className="font-display text-[16px] font-medium text-fg mb-3">Store Information</h2>
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Store Name', placeholder: "Hassan's Smoke Shop", value: "Hassan's Smoke Shop" },
                { label: 'Timezone', placeholder: 'America/New_York', value: 'America/New_York' },
                { label: 'Address', placeholder: '123 Main St', value: '123 Main St, Atlanta, GA 30301' },
                { label: 'Contact Email', placeholder: 'owner@store.com', value: 'hassan@hassansmokeshop.com' },
              ].map(({ label, placeholder, value }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-muted-fg mb-1">{label}</label>
                  <input
                    type="text"
                    defaultValue={value}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-fg"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="font-display text-[16px] font-medium text-danger mb-3">Danger Zone</h2>
          <div className="bg-card border border-danger/20 rounded-lg divide-y divide-border">
            <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-fg">Force full reconciliation</div>
                <div className="text-xs text-muted-fg mt-0.5">Re-sync all 18,492 products with Clover. May take several minutes.</div>
              </div>
              <button className="px-4 py-2 rounded-md border border-warning/30 text-warning text-sm font-medium hover:bg-warning-bg transition-colors">
                Run Now
              </button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-danger">Clear pending sync queue</div>
                <div className="text-xs text-muted-fg mt-0.5">Remove all pending Clover sync operations. This cannot be undone.</div>
              </div>
              <button className="px-4 py-2 rounded-md border border-danger/30 text-danger text-sm font-medium hover:bg-danger-bg transition-colors">
                Clear Queue
              </button>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
