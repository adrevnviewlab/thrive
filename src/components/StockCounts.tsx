import { useState } from 'react'
import { useCategories, useDataSource, usePermissions, useStockCountItems, useStockCounts } from '../data/provider'
import { formatDateTime } from '../lib/format'
import type { StockCountStatus as CountStatus } from '../types'
import { EmptyState, ErrorState, LoadingRows } from './States'

function StatusBadge({ status }: { status: CountStatus }) {
  const config: Record<CountStatus, { label: string; cls: string }> = {
    open: { label: 'In Progress', cls: 'bg-info-bg text-info' },
    pending_approval: { label: 'Needs Approval', cls: 'bg-warning-bg text-warning' },
    closed: { label: 'Approved', cls: 'bg-success-bg text-success' },
    cancelled: { label: 'Cancelled', cls: 'bg-muted text-muted-fg' },
  }
  const c = config[status]
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${c.cls}`}>{c.label}</span>
}

export default function StockCounts() {
  const source = useDataSource()
  const { canApproveCounts: canApprove } = usePermissions()

  const [openId, setOpenId] = useState<string | null>(null)
  const [countValues, setCountValues] = useState<Record<string, string>>({})
  const [starting, setStarting] = useState(false)
  const [scope, setScope] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, loading, error, refresh } = useStockCounts()
  const categories = useCategories()
  const stockCounts = data ?? []
  const activeCount = stockCounts.find((count) => count.id === openId) ?? null
  // The API allows one open count per location, so the button follows that rule.
  const countInProgress = stockCounts.find((count) => count.status === 'open') ?? null
  const itemsQuery = useStockCountItems(activeCount?.id ?? null)
  const activeCountItems = itemsQuery.data ?? []

  /** Lines the user has typed a number into, mapped to the API shape. */
  const typedLines = activeCountItems
    .filter((item) => (countValues[item.id] ?? '').trim() !== '')
    .map((item) => ({ productId: item.productId, countedQty: Math.trunc(Number(countValues[item.id])) }))
    .filter((line) => Number.isFinite(line.countedQty) && line.countedQty >= 0)

  async function runAction(action: () => Promise<void>) {
    setBusy(true)
    setActionError(null)
    try {
      await action()
      refresh()
      itemsQuery.refresh()
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'That did not work')
    } finally {
      setBusy(false)
    }
  }

  /** Saving is a prerequisite for submitting, so both share it. */
  async function saveTyped() {
    if (typedLines.length === 0) return
    await source.setStockCountQuantities(activeCount!.id, typedLines)
    setCountValues({})
  }

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Stock Counts</h1>
            <p className="text-sm text-muted-fg mt-0.5">Physical inventory reconciliation</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {stockCounts
              .filter((count) => count.status === 'open' && count.id !== openId)
              .map((count) => (
                <button
                  key={count.id}
                  type="button"
                  onClick={() => setOpenId(count.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-info-bg border border-info/20 text-info text-sm font-medium hover:bg-info/20 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                  Active Count – {count.id.slice(0, 8)}
                </button>
              ))}
            <button
              type="button"
              disabled={Boolean(countInProgress)}
              title={countInProgress ? 'Finish or cancel the count already in progress first' : undefined}
              onClick={() => setStarting((current) => !current)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {starting ? 'Cancel' : '+ Start New Count'}
            </button>
          </div>
        </div>

        {starting && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-56">
              <label className="block text-xs font-medium text-muted-fg mb-1" htmlFor="count-scope">
                Category
              </label>
              <select
                id="count-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-primary"
              >
                <option value="">Everything</option>
                {(categories.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-fg mb-1" htmlFor="count-note">
                Note
              </label>
              <input
                id="count-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Monday morning shelf count"
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted-fg/70 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                runAction(async () => {
                  const created = await source.openStockCount({ note, categoryId: scope || null })
                  setStarting(false)
                  setNote('')
                  setScope('')
                  setOpenId(created.id)
                })
              }
              className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {busy ? 'Opening…' : 'Open count'}
            </button>
          </div>
        )}

        {actionError && <ErrorState title="That didn't go through" message={actionError} />}
      </div>

      {activeCount ? (
        <div className="page-pad py-6">
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setOpenId(null)
                setCountValues({})
                setActionError(null)
              }}
              className="text-sm text-muted-fg hover:text-fg flex items-center gap-1.5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All Counts
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="text-sm font-medium text-fg">
              {activeCount.id.slice(0, 8)} · {activeCount.scopeCategory ?? 'All categories'}
            </div>
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
              <p className="text-xs text-muted-fg mt-0.5">
                {activeCount.status === 'open'
                  ? 'Enter the physical count for each item, then submit for approval'
                  : 'Locked for review; approving writes the variances to the ledger'}
              </p>
            </div>
            {itemsQuery.loading && !itemsQuery.data && <LoadingRows rows={5} label="Loading count sheet" />}
            {itemsQuery.error && <ErrorState message={itemsQuery.error} onRetry={itemsQuery.refresh} />}
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
                {activeCountItems.map((item) => {
                  const inputVal = countValues[item.id] ?? (item.counted !== null ? item.counted.toString() : '')
                  const diff = inputVal !== '' ? parseInt(inputVal) - item.expected : item.variance
                  const hasDiff = diff !== null && diff !== 0
                  return (
                    <tr key={item.id} className="border-b border-border hover:bg-subtle/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-fg">{item.name}</div>
                        <div className="font-mono text-[11px] text-muted-fg mt-0.5">{item.sku}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm">{item.expected}</td>
                      <td className="px-3 py-3 text-right">
                        <label className="sr-only" htmlFor={`count-${item.id}`}>
                          Counted {item.name}
                        </label>
                        <input
                          id={`count-${item.id}`}
                          type="number"
                          min="0"
                          value={inputVal}
                          disabled={activeCount.status !== 'open'}
                          onChange={(e) => setCountValues({ ...countValues, [item.id]: e.target.value })}
                          placeholder="—"
                          className="w-20 text-right px-2 py-1 rounded border border-border text-sm font-mono bg-bg disabled:opacity-60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
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
                {activeCountItems.filter((i) => countValues[i.id] !== undefined || i.counted !== null).length} of{' '}
                {activeCountItems.length} items counted
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCount.status === 'open' && (
                  <>
                    <button
                      type="button"
                      disabled={busy || typedLines.length === 0}
                      onClick={() => runAction(saveTyped)}
                      className="px-4 py-2 rounded-md border border-border text-sm text-muted-fg hover:text-fg disabled:opacity-50 transition-colors"
                    >
                      {busy ? 'Saving…' : 'Save counts'}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        runAction(async () => {
                          await saveTyped()
                          await source.submitStockCount(activeCount.id)
                        })
                      }
                      className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      Submit for approval
                    </button>
                  </>
                )}

                {activeCount.status === 'pending_approval' && (
                  <button
                    type="button"
                    disabled={busy || !canApprove}
                    title={canApprove ? undefined : 'Only an owner or manager can approve a count'}
                    onClick={() => runAction(() => source.approveStockCount(activeCount.id))}
                    className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {busy ? 'Approving…' : 'Approve and adjust stock'}
                  </button>
                )}

                {(activeCount.status === 'open' || activeCount.status === 'pending_approval') && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => runAction(() => source.cancelStockCount(activeCount.id))}
                    className="px-4 py-2 rounded-md border border-border text-sm text-danger hover:bg-danger-bg disabled:opacity-50 transition-colors"
                  >
                    Cancel count
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="page-pad py-5">
          {error && <ErrorState message={error} onRetry={refresh} />}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading && !data && <LoadingRows rows={5} label="Loading stock counts" />}
            {!loading && stockCounts.length === 0 && (
              <EmptyState title="No stock counts yet" detail="Start one to reconcile shelf quantities." />
            )}
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
                    onClick={() => {
                      if (sc.status === 'open' || sc.status === 'pending_approval') setOpenId(sc.id)
                    }}
                    className={`border-b border-border hover:bg-subtle/40 transition-colors ${
                      sc.status === 'open' || sc.status === 'pending_approval' ? 'cursor-pointer' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 font-mono text-sm font-medium text-primary">{sc.id.slice(0, 8)}</td>
                    <td className="px-3 py-3.5 font-medium text-fg">{sc.scopeCategory ?? 'All categories'}</td>
                    <td className="px-3 py-3.5 text-muted-fg">{sc.openedBy || '—'}</td>
                    <td className="px-3 py-3.5 text-muted-fg text-xs">{formatDateTime(sc.openedAt)}</td>
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
                      {(sc.status === 'open' || sc.status === 'pending_approval') && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setOpenId(sc.id)
                          }}
                          className={`text-xs font-medium ${sc.status === 'open' ? 'text-primary' : 'text-warning'}`}
                        >
                          {sc.status === 'open' ? 'Continue' : 'Review'}
                          <span className="sr-only"> count {sc.id.slice(0, 8)}</span> →
                        </button>
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
