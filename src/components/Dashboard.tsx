import { NavSection } from '../App'

interface DashboardProps {
  onNavigate: (s: NavSection) => void
}

function Badge({ variant, children }: { variant: 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'sync'; children: React.ReactNode }) {
  const styles = {
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    danger: 'bg-danger-bg text-danger',
    info: 'bg-info-bg text-info',
    muted: 'bg-muted text-muted-fg',
    sync: 'bg-sync-bg text-sync',
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}

const kpis = [
  {
    label: 'Total Products',
    value: '18,492',
    sub: '↑ 24 added this week',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    color: 'text-info',
    bg: 'bg-info-bg',
  },
  {
    label: 'Low Stock Items',
    value: '47',
    sub: '12 critically low',
    icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    color: 'text-warning',
    bg: 'bg-warning-bg',
  },
  {
    label: 'Pending Clover Sync',
    value: '3',
    sub: 'Will retry in ~1 min',
    icon: 'M4 4v5h5M20 20v-5h-5M4 20l5-5M20 4l-5 5',
    color: 'text-sync',
    bg: 'bg-sync-bg',
  },
  {
    label: "Today's Transactions",
    value: '124',
    sub: '↑ 18% vs yesterday',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    color: 'text-success',
    bg: 'bg-success-bg',
  },
]

const lowStockItems = [
  { name: 'Elf Bar BC5000 Blue Razz', sku: 'ELF-BC5000-BR', stock: 4, min: 20, vendor: 'Vapor Beast', status: 'critical' },
  { name: 'Hyde Retro RAVE Watermelon Ice', sku: 'HYD-RETRO-WI', stock: 7, min: 15, vendor: 'World Wide Wholesale', status: 'low' },
  { name: 'Backwoods Honey Bourbon (5pk)', sku: 'BW-HONEY-5PK', stock: 3, min: 24, vendor: 'McLane Company', status: 'critical' },
  { name: 'RAW Classic King Size Rolling Papers', sku: 'RAW-CLS-KS', stock: 8, min: 30, vendor: 'Standard Wholesale', status: 'low' },
  { name: 'Bic Classic Lighter – Assorted', sku: 'BIC-CLS-ASST', stock: 14, min: 50, vendor: 'McLane Company', status: 'low' },
  { name: 'Swisher Sweets Grape (2pk)', sku: 'SWI-GRP-2PK', stock: 5, min: 48, vendor: 'McLane Company', status: 'critical' },
]

const recentMovements = [
  { product: 'Elf Bar BC5000 Strawberry Mango', qty: -2, reason: 'Sale (Clover)', time: '9:44 PM', employee: 'Auto-sync' },
  { product: 'Grav Labs 7" Water Pipe', qty: -1, reason: 'Sale (Clover)', time: '9:31 PM', employee: 'Auto-sync' },
  { product: 'Hyde Rebel Pro 5000 Puffs', qty: +24, reason: 'Received from PO #1084', time: '4:12 PM', employee: 'Hassan M.' },
  { product: 'RAW Cone 1¼ (32pk)', qty: -3, reason: 'Sale (Clover)', time: '3:58 PM', employee: 'Auto-sync' },
  { product: 'Swisher Sweets Peach (2pk)', qty: -4, reason: 'Sale (Clover)', time: '3:22 PM', employee: 'Auto-sync' },
  { product: 'Bic Classic Lighter – Red', qty: +50, reason: 'Stock adjustment', time: '1:05 PM', employee: 'Marcus T.' },
  { product: 'Delta-8 THC Gummies 25mg (20ct)', qty: -1, reason: 'Sale (Clover)', time: '12:47 PM', employee: 'Auto-sync' },
  { product: 'Backwoods Honey Bourbon (5pk)', qty: -6, reason: 'Damaged – water', time: '11:30 AM', employee: 'Hassan M.' },
]

const pendingSync = [
  { id: 'SYN-4821', product: 'Elf Bar BC5000 Blue Razz', change: '+20', attempts: 2, error: 'API timeout', since: '8 min ago' },
  { id: 'SYN-4820', product: 'Hyde Retro RAVE Mango Ice', change: '+12', attempts: 1, error: 'Rate limit', since: '12 min ago' },
  { id: 'SYN-4819', product: 'Swisher Sweets Grape (2pk)', change: '-6', attempts: 3, error: 'Connection refused', since: '18 min ago' },
]

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg leading-tight">Dashboard</h1>
            <p className="text-sm text-muted-fg mt-0.5">Sep 8, 2026 · Hassan's Smoke Shop</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success-bg border border-success-bg text-success text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
              Clover Synced
            </div>
            <button
              onClick={() => onNavigate('scanner')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                <path d="M7 8h10M7 12h10M7 16h10" />
              </svg>
              Scan Product
            </button>
          </div>
        </div>
      </div>

      <div className="page-pad py-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-fg">{k.label}</span>
                <div className={`w-7 h-7 rounded-md ${k.bg} flex items-center justify-center`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={k.color}>
                    <path d={k.icon} />
                  </svg>
                </div>
              </div>
              <div className="font-mono text-[28px] font-semibold text-fg leading-none">{k.value}</div>
              <div className="text-[11px] text-muted-fg mt-1.5">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Pending sync alert */}
        {pendingSync.length > 0 && (
          <div className="bg-warning-bg border border-warning/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
                  <path d="M4 4v5h5M20 20v-5h-5M4 20l5-5M20 4l-5 5" />
                </svg>
                <span className="text-sm font-semibold text-warning">Clover sync pending — {pendingSync.length} items queued</span>
              </div>
              <button className="text-xs text-warning font-medium underline underline-offset-2 hover:no-underline">
                Retry All
              </button>
            </div>
            <div className="space-y-1.5">
              {pendingSync.map((s) => (
                <div key={s.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs">
                  <span className="font-mono text-warning/80">{s.id}</span>
                  <span className="flex-1 sm:px-3 text-warning/90">{s.product}</span>
                  <span className="font-mono text-warning font-medium">{s.change}</span>
                  <span className="sm:ml-4 text-warning/70">{s.attempts} attempts · {s.error}</span>
                  <span className="sm:ml-4 text-warning/60">{s.since}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* Low stock table */}
          <div className="xl:col-span-3 bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-display text-[15px] font-medium text-fg">Low Stock Alerts</h2>
                <p className="text-[11px] text-muted-fg mt-0.5">Items below minimum threshold</p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-primary font-medium hover:underline underline-offset-2"
              >
                View all →
              </button>
            </div>
            <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle/50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Product</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Stock</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Min</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Vendor</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item, i) => (
                  <tr key={i} className="border-b border-border hover:bg-subtle/40 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="font-medium text-fg text-sm">{item.name}</div>
                      <div className="font-mono text-[11px] text-muted-fg mt-0.5">{item.sku}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-danger text-sm">{item.stock}</td>
                    <td className="px-3 py-3 text-right font-mono text-muted-fg text-sm">{item.min}</td>
                    <td className="px-3 py-3 text-sm text-muted-fg">{item.vendor}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'critical' ? 'danger' : 'warning'}>
                        {item.status === 'critical' ? 'Critical' : 'Low'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Recent movements */}
          <div className="xl:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="font-display text-[15px] font-medium text-fg">Recent Movements</h2>
              <p className="text-[11px] text-muted-fg mt-0.5">Today's inventory activity</p>
            </div>
            <div className="divide-y divide-border">
              {recentMovements.map((m, i) => (
                <div key={i} className="px-5 py-3 hover:bg-subtle/40 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-fg truncate">{m.product}</div>
                      <div className="text-[11px] text-muted-fg mt-0.5">{m.reason}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono text-sm font-semibold ${m.qty > 0 ? 'text-success' : 'text-danger'}`}>
                        {m.qty > 0 ? `+${m.qty}` : m.qty}
                      </div>
                      <div className="text-[10px] text-muted-fg mt-0.5">{m.time}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-fg mt-1">{m.employee}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: 'Receive Stock', desc: 'Add incoming inventory', nav: 'receive' as NavSection, icon: 'M8 17l4 4 4-4m-4 4V3' },
            { label: 'Create PO', desc: 'New purchase order', nav: 'purchase-orders' as NavSection, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Stock Count', desc: 'Start physical count', nav: 'stock-counts' as NavSection, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
            { label: 'View Reports', desc: 'Analytics & insights', nav: 'reports' as NavSection, icon: 'M18 20V10M12 20V4M6 20v-6' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.nav)}
              className="bg-card border border-border rounded-lg p-4 text-left hover:border-border-strong hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-fg transition-colors text-muted-fg">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={action.icon} />
                </svg>
              </div>
              <div className="text-sm font-semibold text-fg">{action.label}</div>
              <div className="text-[11px] text-muted-fg mt-0.5">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
