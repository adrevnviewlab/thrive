import { useState } from 'react'

type CountStatus = 'active' | 'pending-approval' | 'approved' | 'cancelled'

interface StockCount {
  id: string
  startedAt: string
  completedAt?: string
  employee: string
  category: string
  totalItems: number
  counted: number
  discrepancies: number
  status: CountStatus
}

const stockCounts: StockCount[] = [
  { id: 'SC-0042', startedAt: 'Sep 8, 2026 · 2:00 PM', employee: 'Hassan M.', category: 'Disposable Vapes', totalItems: 24, counted: 18, discrepancies: 2, status: 'active' },
  { id: 'SC-0041', startedAt: 'Sep 7, 2026 · 10:30 AM', completedAt: 'Sep 7, 2026 · 11:45 AM', employee: 'Marcus T.', category: 'Cigars', totalItems: 38, counted: 38, discrepancies: 3, status: 'pending-approval' },
  { id: 'SC-0040', startedAt: 'Sep 5, 2026 · 9:15 AM', completedAt: 'Sep 5, 2026 · 10:00 AM', employee: 'Aisha R.', category: 'Rolling Papers', totalItems: 22, counted: 22, discrepancies: 0, status: 'approved' },
  { id: 'SC-0039', startedAt: 'Sep 2, 2026 · 3:00 PM', completedAt: 'Sep 2, 2026 · 4:30 PM', employee: 'Hassan M.', category: 'Accessories', totalItems: 31, counted: 31, discrepancies: 5, status: 'approved' },
  { id: 'SC-0038', startedAt: 'Aug 30, 2026 · 11:00 AM', completedAt: 'Aug 30, 2026 · 12:00 PM', employee: 'Marcus T.', category: 'Lighters', totalItems: 15, counted: 15, discrepancies: 1, status: 'approved' },
]

const activeCountItems = [
  { name: 'Elf Bar BC5000 Blue Razz', sku: 'ELF-BC5000-BR', expected: 4, counted: 4, diff: 0 },
  { name: 'Elf Bar BC5000 Strawberry Mango', sku: 'ELF-BC5000-SM', expected: 18, counted: 16, diff: -2 },
  { name: 'Hyde Retro RAVE Watermelon Ice', sku: 'HYD-RETRO-WI', expected: 7, counted: 7, diff: 0 },
  { name: 'Hyde Retro RAVE Mango Ice', sku: 'HYD-RETRO-MI', expected: 12, counted: 14, diff: 2 },
  { name: 'Hyde Rebel Pro 5000 Puffs', sku: 'HYD-REBEL-5K', expected: 24, counted: null, diff: null },
  { name: 'Lost Mary MO5000 Watermelon', sku: 'LM-MO5000-WM', expected: 9, counted: null, diff: null },
  { name: 'Geek Bar Pulse Blue Razz Ice', sku: 'GB-PULSE-BRI', expected: 6, counted: null, diff: null },
]

function StatusBadge({ status }: { status: CountStatus }) {
  const config: Record<CountStatus, { label: string; cls: string }> = {
    active: { label: 'In Progress', cls: 'bg-info-bg text-info' },
    'pending-approval': { label: 'Needs Approval', cls: 'bg-warning-bg text-warning' },
    approved: { label: 'Approved', cls: 'bg-success-bg text-success' },
    cancelled: { label: 'Cancelled', cls: 'bg-muted text-muted-fg' },
  }
  const c = config[status]
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${c.cls}`}>{c.label}</span>
}

export default function StockCounts() {
  const [view, setView] = useState<'list' | 'active'>('list')
  const [countValues, setCountValues] = useState<Record<string, string>>({})

  const activeCount = stockCounts.find(s => s.status === 'active')

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Stock Counts</h1>
            <p className="text-sm text-muted-fg mt-0.5">Physical inventory reconciliation</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeCount && (
              <button
                onClick={() => setView(view === 'active' ? 'list' : 'active')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-info-bg border border-info/20 text-info text-sm font-medium hover:bg-info/20 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                Active Count – {activeCount.id}
              </button>
            )}
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">
              + Start New Count
            </button>
          </div>
        </div>
      </div>

      {view === 'active' && activeCount ? (
        <div className="page-pad py-6">
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <button onClick={() => setView('list')} className="text-sm text-muted-fg hover:text-fg flex items-center gap-1.5 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All Counts
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="text-sm font-medium text-fg">{activeCount.id} · {activeCount.category}</div>
            <StatusBadge status={activeCount.status} />
          </div>

          {/* Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Items', value: activeCount.totalItems.toString() },
              { label: 'Counted', value: activeCount.counted.toString() },
              { label: 'Remaining', value: (activeCount.totalItems - activeCount.counted).toString() },
              { label: 'Discrepancies', value: activeCount.discrepancies.toString() },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-lg p-4">
                <div className="text-xs text-muted-fg mb-1">{s.label}</div>
                <div className="font-mono text-2xl font-semibold text-fg">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="font-display text-[15px] font-medium text-fg">Count Sheet</h2>
              <p className="text-xs text-muted-fg mt-0.5">Scan each item and enter the physical count</p>
            </div>
            <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle/50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Product</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Expected</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Counted</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Difference</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {activeCountItems.map((item, i) => {
                  const inputVal = countValues[item.sku] ?? (item.counted !== null ? item.counted.toString() : '')
                  const diff = inputVal !== '' ? parseInt(inputVal) - item.expected : item.diff
                  const hasDiff = diff !== null && diff !== 0
                  return (
                    <tr key={i} className="border-b border-border hover:bg-subtle/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-fg">{item.name}</div>
                        <div className="font-mono text-[11px] text-muted-fg mt-0.5">{item.sku}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm">{item.expected}</td>
                      <td className="px-3 py-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={inputVal}
                          onChange={(e) => setCountValues({ ...countValues, [item.sku]: e.target.value })}
                          placeholder="—"
                          className="w-20 text-right px-2 py-1 rounded border border-border text-sm font-mono bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm font-semibold">
                        {diff !== null ? (
                          <span className={diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-muted-fg'}>
                            {diff > 0 ? `+${diff}` : diff === 0 ? '✓' : diff}
                          </span>
                        ) : (
                          <span className="text-muted-fg">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {hasDiff && (
                          <span className="text-[11px] text-warning font-medium">Flag</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
            <div className="px-5 py-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-fg">
                {activeCountItems.filter(i => countValues[i.sku] !== undefined || i.counted !== null).length} of {activeCountItems.length} items counted
              </span>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-md border border-border text-sm text-muted-fg hover:text-fg transition-colors">Save Draft</button>
                <button className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">Submit for Approval</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="page-pad py-5">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle/50">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Count ID</th>
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Category</th>
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Employee</th>
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Started</th>
                  <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Items</th>
                  <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Discrepancies</th>
                  <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {stockCounts.map((sc) => (
                  <tr
                    key={sc.id}
                    onClick={() => sc.status === 'active' && setView('active')}
                    className={`border-b border-border hover:bg-subtle/40 transition-colors ${sc.status === 'active' ? 'cursor-pointer' : ''}`}
                  >
                    <td className="px-5 py-3.5 font-mono text-sm font-medium text-primary">{sc.id}</td>
                    <td className="px-3 py-3.5 font-medium text-fg">{sc.category}</td>
                    <td className="px-3 py-3.5 text-muted-fg">{sc.employee}</td>
                    <td className="px-3 py-3.5 text-muted-fg text-xs">{sc.startedAt}</td>
                    <td className="px-3 py-3.5 text-right font-mono">
                      <span className="text-fg">{sc.counted}</span>
                      <span className="text-muted-fg">/{sc.totalItems}</span>
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono">
                      <span className={sc.discrepancies > 0 ? 'text-warning font-semibold' : 'text-success'}>
                        {sc.discrepancies > 0 ? sc.discrepancies : '✓'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5"><StatusBadge status={sc.status} /></td>
                    <td className="px-4 py-3.5">
                      {sc.status === 'active' && (
                        <span className="text-xs text-primary font-medium">Continue →</span>
                      )}
                      {sc.status === 'pending-approval' && (
                        <button className="text-xs font-medium text-warning hover:underline underline-offset-2">Review</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
