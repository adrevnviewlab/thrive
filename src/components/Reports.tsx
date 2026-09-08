import { useState } from 'react'

const movementData = [
  { day: 'Mon', received: 48, sold: 67, adjustments: 3 },
  { day: 'Tue', received: 0, sold: 82, adjustments: 0 },
  { day: 'Wed', received: 120, sold: 74, adjustments: 5 },
  { day: 'Thu', received: 0, sold: 91, adjustments: 2 },
  { day: 'Fri', received: 0, sold: 108, adjustments: 1 },
  { day: 'Sat', received: 36, sold: 134, adjustments: 0 },
  { day: 'Sun', received: 0, sold: 112, adjustments: 4 },
]

const categoryData = [
  { category: 'Disposable Vapes', sold: 284, revenue: 5680, margin: 52 },
  { category: 'Cigars', sold: 198, revenue: 594, margin: 53 },
  { category: 'Rolling Papers', sold: 143, revenue: 286, margin: 54 },
  { category: 'Lighters', sold: 97, revenue: 222, margin: 58 },
  { category: 'Pipes & Glass', sold: 12, revenue: 540, margin: 61 },
  { category: 'Accessories', sold: 34, revenue: 680, margin: 58 },
  { category: 'Kratom', sold: 28, revenue: 700, margin: 55 },
  { category: 'CBD', sold: 19, revenue: 665, margin: 60 },
]

const topMovers = [
  { name: 'Elf Bar BC5000 Strawberry Mango', sku: 'ELF-BC5000-SM', sold: 48, revenue: 959.52, trend: 'up' },
  { name: 'Swisher Sweets Grape (2pk)', sku: 'SWI-GRP-2PK', sold: 44, revenue: 131.56, trend: 'up' },
  { name: 'Bic Classic Lighter – Assorted', sku: 'BIC-CLS-ASST', sold: 38, revenue: 87.02, trend: 'steady' },
  { name: 'Hyde Retro RAVE Watermelon Ice', sku: 'HYD-RETRO-WI', sold: 31, revenue: 557.69, trend: 'down' },
  { name: 'RAW Classic King Size', sku: 'RAW-CLS-KS', sold: 29, revenue: 72.21, trend: 'up' },
  { name: 'Swisher Sweets Peach (2pk)', sku: 'SWI-PCH-2PK', sold: 27, revenue: 80.73, trend: 'steady' },
]

const auditLog = [
  { id: 'AUD-9902', time: '9:44 PM', product: 'Elf Bar BC5000 Blue Razz', oldQty: 6, newQty: 4, change: -2, reason: 'Sale (Clover #CLV-88210)', employee: 'Auto-sync' },
  { id: 'AUD-9901', time: '9:31 PM', product: 'Grav Labs 7" Water Pipe', oldQty: 7, newQty: 6, change: -1, reason: 'Sale (Clover #CLV-88195)', employee: 'Auto-sync' },
  { id: 'AUD-9900', time: '4:12 PM', product: 'Hyde Rebel Pro 5000 Puffs', oldQty: 0, newQty: 24, change: 24, reason: 'Received – PO-1084', employee: 'Hassan M.' },
  { id: 'AUD-9899', time: '1:05 PM', product: 'Bic Classic Lighter – Red', oldQty: 0, newQty: 50, change: 50, reason: 'Stock adjustment', employee: 'Marcus T.' },
  { id: 'AUD-9898', time: '11:30 AM', product: 'Backwoods Honey Bourbon (5pk)', oldQty: 9, newQty: 3, change: -6, reason: 'Damaged – water', employee: 'Hassan M.' },
]

function SimpleBarChart() {
  const max = Math.max(...movementData.map(d => Math.max(d.received, d.sold)))
  return (
    <div>
      <div className="flex items-end gap-1.5 h-28">
        {movementData.map((d) => (
          <div key={d.day} className="flex-1 flex items-end gap-0.5">
            <div
              className="flex-1 rounded-sm bg-primary/85 transition-all"
              style={{ height: `${(d.sold / max) * 100}%` }}
              title={`Sold: ${d.sold}`}
            />
            <div
              className="flex-1 rounded-sm bg-accent/70 transition-all"
              style={{ height: `${(d.received / max) * 100}%` }}
              title={`Received: ${d.received}`}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-1">
        {movementData.map((d) => (
          <div key={d.day} className="flex-1 text-center text-[10px] text-muted-fg">{d.day}</div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-xs text-muted-fg">Units Sold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent/70" />
          <span className="text-xs text-muted-fg">Received</span>
        </div>
      </div>
    </div>
  )
}

function MarginBar({ margin }: { margin: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${margin}%` }} />
      </div>
      <span className="font-mono text-xs text-fg w-8 text-right">{margin}%</span>
    </div>
  )
}

const tabs = ['Overview', 'Movements', 'Audit Log']

export default function Reports() {
  const [tab, setTab] = useState('Overview')
  const [dateRange, setDateRange] = useState('7d')

  const totalSold = movementData.reduce((s, d) => s + d.sold, 0)
  const totalReceived = movementData.reduce((s, d) => s + d.received, 0)
  const totalRevenue = categoryData.reduce((s, d) => s + d.revenue, 0)
  const avgMargin = Math.round(categoryData.reduce((s, d) => s + d.margin, 0) / categoryData.length)

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Reports</h1>
            <p className="text-sm text-muted-fg mt-0.5">Inventory analytics and audit trail</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary text-fg cursor-pointer"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="ytd">Year to date</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-fg hover:text-fg hover:border-border-strong transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className="flex gap-1 mt-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-primary-fg' : 'text-muted-fg hover:text-fg hover:bg-subtle'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="page-pad py-6 space-y-5">
        {tab === 'Overview' && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Units Sold', value: totalSold.toString(), sub: 'This week' },
                { label: 'Units Received', value: totalReceived.toString(), sub: 'This week' },
                { label: 'Est. Revenue', value: `$${totalRevenue.toLocaleString()}`, sub: 'This week' },
                { label: 'Avg Margin', value: `${avgMargin}%`, sub: 'Across categories' },
              ].map((k) => (
                <div key={k.label} className="bg-card border border-border rounded-lg p-4">
                  <div className="text-xs text-muted-fg mb-1">{k.label}</div>
                  <div className="font-mono text-2xl font-semibold text-fg">{k.value}</div>
                  <div className="text-[11px] text-muted-fg mt-1">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Movement chart */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-display text-[15px] font-medium text-fg mb-1">Daily Inventory Movements</h2>
                <p className="text-xs text-muted-fg mb-5">Units sold vs. received this week</p>
                <SimpleBarChart />
              </div>

              {/* Top movers */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                  <h2 className="font-display text-[15px] font-medium text-fg">Top Movers</h2>
                  <p className="text-xs text-muted-fg mt-0.5">Most sold products this week</p>
                </div>
                <div className="divide-y divide-border">
                  {topMovers.map((p, i) => (
                    <div key={i} className="px-5 py-3 hover:bg-subtle/40 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-sm font-semibold text-muted-fg w-4 shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-fg truncate">{p.name}</div>
                            <div className="font-mono text-[10px] text-muted-fg">{p.sku}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm font-semibold text-fg">{p.sold} sold</div>
                          <div className="text-[11px] text-muted-fg">${p.revenue.toFixed(0)}</div>
                        </div>
                        <div className="shrink-0">
                          {p.trend === 'up' && <span className="text-success text-sm">↑</span>}
                          {p.trend === 'down' && <span className="text-danger text-sm">↓</span>}
                          {p.trend === 'steady' && <span className="text-muted-fg text-sm">→</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h2 className="font-display text-[15px] font-medium text-fg">By Category</h2>
              </div>
              <div className="table-wrap">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-subtle/50">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Category</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Units Sold</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Revenue</th>
                    <th className="px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Avg Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((c) => (
                    <tr key={c.category} className="border-b border-border hover:bg-subtle/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-fg">{c.category}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm">{c.sold}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm font-medium">${c.revenue.toLocaleString()}</td>
                      <td className="px-5 py-3 w-48"><MarginBar margin={c.margin} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}

        {tab === 'Audit Log' && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-[15px] font-medium text-fg">Inventory Audit Log</h2>
              <span className="text-xs text-muted-fg">Every change is recorded</span>
            </div>
            <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle/50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">ID</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Product</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Before</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">After</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Change</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Reason</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">By</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((e) => (
                  <tr key={e.id} className="border-b border-border hover:bg-subtle/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-primary">{e.id}</td>
                    <td className="px-3 py-3 font-medium text-fg">{e.product}</td>
                    <td className="px-3 py-3 text-right font-mono text-sm text-muted-fg">{e.oldQty}</td>
                    <td className="px-3 py-3 text-right font-mono text-sm text-fg font-medium">{e.newQty}</td>
                    <td className="px-3 py-3 text-right font-mono text-sm font-semibold">
                      <span className={e.change > 0 ? 'text-success' : 'text-danger'}>
                        {e.change > 0 ? `+${e.change}` : e.change}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-fg">{e.reason}</td>
                    <td className="px-3 py-3 text-sm text-fg">{e.employee}</td>
                    <td className="px-3 py-3 text-sm text-muted-fg">{e.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {tab === 'Movements' && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="font-display text-[15px] font-medium text-fg">Daily Movement Breakdown</h2>
            </div>
            <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle/50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Day</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Units Sold</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Units Received</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Adjustments</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody>
                {movementData.map((d) => {
                  const net = d.received - d.sold - d.adjustments
                  return (
                    <tr key={d.day} className="border-b border-border hover:bg-subtle/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-fg">{d.day}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-danger">-{d.sold}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-success">+{d.received}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-muted-fg">{d.adjustments > 0 ? `-${d.adjustments}` : '—'}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm font-semibold">
                        <span className={net >= 0 ? 'text-success' : 'text-danger'}>
                          {net > 0 ? `+${net}` : net}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
