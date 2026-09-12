import { useState } from 'react'
import { useAuditLog, useCategoryReport, useMovementSeries, useTopMovers } from '../data/provider'
import { downloadCsv, toCsv } from '../lib/csv'
import { formatDateTime, formatMoney, formatMoneyCompact, formatNumber } from '../lib/format'
import type { AuditEntry, CategoryReportRow, MovementSeriesPoint } from '../types'
import { EmptyState, ErrorState, LoadingRows } from './States'

function SimpleBarChart({ series }: { series: MovementSeriesPoint[] }) {
  const max = Math.max(1, ...series.map((point) => Math.max(point.received, point.removed)))
  return (
    <div>
      <div className="flex items-end gap-1.5 h-28">
        {series.map((point, index) => (
          <div key={`${point.label}-${index}`} className="flex-1 flex items-end gap-0.5">
            <div
              className="flex-1 rounded-sm bg-primary/85 transition-all"
              style={{ height: `${(point.removed / max) * 100}%` }}
              title={`Removed: ${point.removed}`}
            />
            <div
              className="flex-1 rounded-sm bg-accent/70 transition-all"
              style={{ height: `${(point.received / max) * 100}%` }}
              title={`Received: ${point.received}`}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-1">
        {series.map((point, index) => (
          <div key={`${point.label}-label-${index}`} className="flex-1 text-center text-[10px] text-muted-fg">
            {point.label}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-xs text-muted-fg">Units Out</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent/70" />
          <span className="text-xs text-muted-fg">Received</span>
        </div>
      </div>
    </div>
  )
}

function ShareBar({ share }: { share: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, share)}%` }} />
      </div>
      <span className="font-mono text-xs text-fg w-10 text-right">{share.toFixed(0)}%</span>
    </div>
  )
}

const tabs = ['Overview', 'Movements', 'Audit Log']

const auditChange = (entry: AuditEntry) => {
  const meta = entry.meta as { change?: number; delta?: number }
  return typeof meta.change === 'number' ? meta.change : typeof meta.delta === 'number' ? meta.delta : null
}

const auditProduct = (entry: AuditEntry) => {
  const meta = entry.meta as { productName?: string }
  return meta.productName ?? entry.entityType
}

export default function Reports() {
  const [tab, setTab] = useState('Overview')

  const series = useMovementSeries()
  const movers = useTopMovers()
  const byCategory = useCategoryReport()
  const audit = useAuditLog()

  const movementData = series.data ?? []
  const topMovers = movers.data ?? []
  const categoryData: CategoryReportRow[] = byCategory.data ?? []
  const auditLog = audit.data ?? []

  const totalRemoved = movementData.reduce((sum, point) => sum + point.removed, 0)
  const totalReceived = movementData.reduce((sum, point) => sum + point.received, 0)
  const totalRevenue = topMovers.reduce((sum, mover) => sum + mover.revenue, 0)
  const totalMargin = topMovers.reduce((sum, mover) => sum + mover.margin, 0)
  const avgMargin = totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 100) : 0
  const totalValue = categoryData.reduce((sum, row) => sum + row.value, 0)

  /** Exports whatever the visible tab is showing, so the file matches the screen. */
  function exportTab() {
    const stamp = new Date().toISOString().slice(0, 10)

    if (tab === 'Audit Log') {
      downloadCsv(
        `stackr-audit-log-${stamp}.csv`,
        toCsv(
          ['When', 'Action', 'Subject', 'Change', 'By'],
          auditLog.map((entry) => [
            entry.createdAt,
            entry.action,
            auditProduct(entry),
            auditChange(entry),
            entry.actor,
          ]),
        ),
      )
      return
    }

    if (tab === 'Movements') {
      downloadCsv(
        `stackr-movements-${stamp}.csv`,
        toCsv(
          ['Day', 'Units out', 'Units received', 'Net'],
          movementData.map((point) => [point.label, point.removed, point.received, point.received - point.removed]),
        ),
      )
      return
    }

    downloadCsv(
      `stackr-category-report-${stamp}.csv`,
      toCsv(
        ['Category', 'Products', 'On hand', 'Units sold', 'Stock value'],
        categoryData.map((row) => [row.category, row.products, row.onHand, row.unitsSold, row.value.toFixed(2)]),
      ),
    )
  }

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Reports</h1>
            <p className="text-sm text-muted-fg mt-0.5">Inventory analytics and audit trail</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                series.refresh()
                movers.refresh()
                byCategory.refresh()
                audit.refresh()
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-fg hover:text-fg hover:border-border-strong transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4v5h5M20 20v-5h-5M4 20l5-5M20 4l-5 5" />
              </svg>
              Refresh
            </button>
            <button
              type="button"
              onClick={exportTab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-fg hover:text-fg hover:border-border-strong transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
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
        {series.error && <ErrorState message={series.error} onRetry={series.refresh} />}

        {tab === 'Overview' && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Units Out', value: formatNumber(totalRemoved), sub: 'Last 7 days' },
                { label: 'Units Received', value: formatNumber(totalReceived), sub: 'Last 7 days' },
                { label: 'Est. Revenue', value: formatMoneyCompact(totalRevenue), sub: 'Last 30 days' },
                { label: 'Avg Margin', value: `${avgMargin}%`, sub: 'Across top movers' },
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
                <p className="text-xs text-muted-fg mb-5">Units out vs. received this week</p>
                {series.loading && !series.data ? (
                  <LoadingRows rows={3} label="Loading movements" />
                ) : movementData.length === 0 ? (
                  <EmptyState title="No movements in this window" />
                ) : (
                  <SimpleBarChart series={movementData} />
                )}
              </div>

              {/* Top movers */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border">
                  <h2 className="font-display text-[15px] font-medium text-fg">Top Movers</h2>
                  <p className="text-xs text-muted-fg mt-0.5">Most sold products in the last 30 days</p>
                </div>
                {movers.loading && !movers.data && <LoadingRows rows={5} label="Loading top movers" />}
                {!movers.loading && topMovers.length === 0 && <EmptyState title="No sales recorded yet" />}
                <div className="divide-y divide-border">
                  {topMovers.map((p, i) => (
                    <div key={p.id} className="px-5 py-3 hover:bg-subtle/40 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-sm font-semibold text-muted-fg w-4 shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-fg truncate">{p.name}</div>
                            <div className="font-mono text-[10px] text-muted-fg">{p.sku}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm font-semibold text-fg">{formatNumber(p.unitsSold)} sold</div>
                          <div className="text-[11px] text-muted-fg">{formatMoney(p.revenue)}</div>
                        </div>
                        <div className="shrink-0 text-right w-16">
                          <div className="font-mono text-[11px] text-success">+{formatNumber(p.unitsReceived)}</div>
                          <div className="text-[10px] text-muted-fg">received</div>
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
              {byCategory.loading && !byCategory.data && <LoadingRows rows={5} label="Loading categories" />}
              <div className="table-wrap">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-subtle/50">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Category</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Products</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">On Hand</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Units Sold</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Stock Value</th>
                    <th className="px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Share of Value</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((c) => (
                    <tr key={c.category} className="border-b border-border hover:bg-subtle/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-fg">{c.category}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-muted-fg">{formatNumber(c.products)}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm">{formatNumber(c.onHand)}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm">{formatNumber(c.unitsSold)}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm font-medium">{formatMoneyCompact(c.value)}</td>
                      <td className="px-5 py-3 w-48">
                        <ShareBar share={totalValue > 0 ? (c.value / totalValue) * 100 : 0} />
                      </td>
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
            {audit.loading && !audit.data && <LoadingRows rows={6} label="Loading audit log" />}
            {audit.error && <ErrorState message={audit.error} onRetry={audit.refresh} />}
            {!audit.loading && auditLog.length === 0 && <EmptyState title="Nothing recorded yet" />}
            <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle/50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Action</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Subject</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Change</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">By</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry) => {
                  const change = auditChange(entry)
                  return (
                    <tr key={entry.id} className="border-b border-border hover:bg-subtle/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-primary">{entry.action}</td>
                      <td className="px-3 py-3 font-medium text-fg">{auditProduct(entry)}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm font-semibold">
                        {change === null ? (
                          <span className="text-muted-fg">—</span>
                        ) : (
                          <span className={change > 0 ? 'text-success' : 'text-danger'}>
                            {change > 0 ? `+${change}` : change}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-fg">{entry.actor}</td>
                      <td className="px-3 py-3 text-sm text-muted-fg">{formatDateTime(entry.createdAt)}</td>
                    </tr>
                  )
                })}
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
            {series.loading && !series.data && <LoadingRows rows={5} label="Loading movements" />}
            <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle/50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Day</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Units Out</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Units Received</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody>
                {movementData.map((point, index) => {
                  const net = point.received - point.removed
                  return (
                    <tr key={`${point.label}-row-${index}`} className="border-b border-border hover:bg-subtle/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-fg">{point.label}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-danger">-{formatNumber(point.removed)}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-success">+{formatNumber(point.received)}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm font-semibold">
                        <span className={net >= 0 ? 'text-success' : 'text-danger'}>
                          {net > 0 ? `+${formatNumber(net)}` : formatNumber(net)}
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
