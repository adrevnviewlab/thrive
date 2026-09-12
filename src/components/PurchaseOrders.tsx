import { useState } from 'react'
import { useDataSource, usePermissions, usePurchaseOrderItems, usePurchaseOrders } from '../data/provider'
import { formatDate, formatMoney, formatNumber } from '../lib/format'
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus as POStatus } from '../types'
import PurchaseOrderForm from './PurchaseOrderForm'
import { EmptyState, ErrorState, LoadingRows } from './States'

function StatusBadge({ status }: { status: POStatus }) {
  const config: Record<POStatus, { label: string; cls: string }> = {
    draft: { label: 'Draft', cls: 'bg-muted text-muted-fg' },
    sent: { label: 'Sent', cls: 'bg-info-bg text-info' },
    partial: { label: 'Partial', cls: 'bg-warning-bg text-warning' },
    received: { label: 'Received', cls: 'bg-success-bg text-success' },
    cancelled: { label: 'Cancelled', cls: 'bg-danger-bg text-danger' },
  }
  const c = config[status]
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${c.cls}`}>{c.label}</span>
}

const statusFilters: Array<{ key: string; label: string }> = [
  { key: 'All', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'partial', label: 'Partial' },
  { key: 'received', label: 'Received' },
]

/** Quantities typed into the receive panel, keyed by product. */
type ReceiveDraft = Record<string, string>

export default function PurchaseOrders() {
  const source = useDataSource()
  const { canManageInventory } = usePermissions()
  const [filter, setFilter] = useState('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [receiving, setReceiving] = useState(false)
  const [draft, setDraft] = useState<ReceiveDraft>({})
  const [scan, setScan] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, loading, error, refresh } = usePurchaseOrders()
  const itemsQuery = usePurchaseOrderItems(selectedId)

  const purchaseOrders = data ?? []
  const filtered = filter === 'All' ? purchaseOrders : purchaseOrders.filter((p) => p.status === filter)
  const selectedPO = purchaseOrders.find((order) => order.id === selectedId) ?? null

  function closeDetail() {
    setSelectedId(null)
    setReceiving(false)
    setDraft({})
    setScan('')
    setActionError(null)
  }

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

  if (selectedPO) {
    const poItems = itemsQuery.data ?? []
    const outstanding = (item: PurchaseOrderItem) => Math.max(item.qtyOrdered - item.qtyReceived, 0)
    const draftedLines = poItems
      .map((item) => ({ item, quantity: Number(draft[item.productId] ?? 0) }))
      .filter((entry) => entry.quantity > 0)
    const closed = selectedPO.status === 'received' || selectedPO.status === 'cancelled'

    const applyScan = (code: string) => {
      const trimmed = code.trim()
      if (!trimmed) return
      const match = poItems.find(
        (item) => item.upc === trimmed || item.sku.toLowerCase() === trimmed.toLowerCase(),
      )
      setScan('')
      if (!match) {
        setActionError(`Nothing on ${selectedPO.number} matches ${trimmed}`)
        return
      }
      setActionError(null)
      setDraft((current) => ({
        ...current,
        [match.productId]: String(Number(current[match.productId] ?? 0) + 1),
      }))
    }

    return (
      <div className="min-h-full">
        <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={closeDetail} className="text-muted-fg hover:text-fg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-display text-[22px] font-medium text-fg">{selectedPO.number}</h1>
              <p className="text-sm text-muted-fg mt-0.5">
                {selectedPO.vendorName} · {formatDate(selectedPO.createdAt)}
              </p>
            </div>
            <div className="ml-3">
              <StatusBadge status={selectedPO.status} />
            </div>
          </div>
        </div>

        <div className="page-pad py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-[15px] font-medium text-fg">Order Items</h2>
                <span className="text-xs text-muted-fg">
                  {poItems.length} items · {formatMoney(selectedPO.totalCost)} total
                </span>
              </div>
              {itemsQuery.loading && !itemsQuery.data && <LoadingRows rows={4} label="Loading order items" />}
              {itemsQuery.error && <ErrorState message={itemsQuery.error} onRetry={itemsQuery.refresh} />}
              <div className="table-wrap">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-subtle/50">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Product</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Ordered</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Received</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Cost/Unit</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Total</th>
                    <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Status</th>
                    {receiving && (
                      <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Receiving</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {poItems.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-subtle/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-fg">{item.name}</div>
                        <div className="font-mono text-[11px] text-muted-fg mt-0.5">{item.sku}</div>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-sm">{item.qtyOrdered}</td>
                      <td className="px-3 py-3.5 text-right font-mono text-sm">
                        <span className={item.qtyReceived === item.qtyOrdered ? 'text-success' : item.qtyReceived > 0 ? 'text-warning' : 'text-muted-fg'}>
                          {item.qtyReceived}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-sm text-muted-fg">{formatMoney(item.unitCost)}</td>
                      <td className="px-3 py-3.5 text-right font-mono text-sm font-medium">{formatMoney(item.lineTotal)}</td>
                      <td className="px-3 py-3.5">
                        <span className={`text-[11px] font-medium ${item.status === 'received' ? 'text-success' : item.status === 'partial' ? 'text-warning' : 'text-muted-fg'}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      {receiving && (
                        <td className="px-3 py-3.5 text-right">
                          <label className="sr-only" htmlFor={`receive-${item.productId}`}>
                            Receiving {item.name}
                          </label>
                          <input
                            id={`receive-${item.productId}`}
                            value={draft[item.productId] ?? ''}
                            onChange={(e) => setDraft((current) => ({ ...current, [item.productId]: e.target.value }))}
                            placeholder={String(outstanding(item))}
                            inputMode="numeric"
                            className="w-20 rounded-md border border-border bg-bg px-2 py-1 text-sm font-mono text-right text-fg focus:outline-none focus:border-primary"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="px-5 py-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-fg">
                  <span className="font-medium text-fg">{formatNumber(selectedPO.unitsReceived)}</span> of{' '}
                  <span className="font-medium text-fg">{formatNumber(selectedPO.unitsOrdered)}</span> units received
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPO.status === 'draft' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => source.setPurchaseOrderStatus(selectedPO.id, 'sent'))}
                      className="px-4 py-2 rounded-md border border-border text-sm text-muted-fg hover:text-fg disabled:opacity-50 transition-colors"
                    >
                      Mark as sent
                    </button>
                  )}
                  {!closed && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(() => source.setPurchaseOrderStatus(selectedPO.id, 'cancelled'))}
                      className="px-4 py-2 rounded-md border border-border text-sm text-danger hover:bg-danger-bg disabled:opacity-50 transition-colors"
                    >
                      Cancel order
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-md border border-border text-sm text-muted-fg hover:text-fg transition-colors"
                  >
                    Print PO
                  </button>
                  <button
                    type="button"
                    disabled={closed}
                    onClick={() => {
                      setReceiving((current) => !current)
                      setActionError(null)
                    }}
                    className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {receiving ? 'Close receiving' : 'Receive items'}
                  </button>
                </div>
              </div>

              {receiving && (
                <div className="px-5 py-4 border-t border-border space-y-3 bg-subtle/30">
                  <div>
                    <label className="block text-xs font-medium text-muted-fg mb-1" htmlFor="po-scan">
                      Scan a barcode or SKU
                    </label>
                    <input
                      id="po-scan"
                      value={scan}
                      autoFocus
                      onChange={(e) => setScan(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          applyScan(scan)
                        }
                      }}
                      placeholder="Each scan adds one unit to the line"
                      className="w-full max-w-sm rounded-md border border-border bg-bg px-3 py-2 text-sm font-mono text-fg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy || draftedLines.length === 0}
                      onClick={() =>
                        runAction(async () => {
                          await source.receivePurchaseOrder(
                            selectedPO.id,
                            draftedLines.map((entry) => ({
                              productId: entry.item.productId,
                              quantity: entry.quantity,
                            })),
                            `Received against ${selectedPO.number}`,
                          )
                          setDraft({})
                        })
                      }
                      className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {busy
                        ? 'Receiving…'
                        : `Confirm ${formatNumber(draftedLines.reduce((sum, entry) => sum + entry.quantity, 0))} units`}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft(Object.fromEntries(poItems.map((item) => [item.productId, String(outstanding(item))])))
                      }
                      className="px-3 py-2 rounded-md border border-border text-sm text-muted-fg hover:text-fg transition-colors"
                    >
                      Fill outstanding
                    </button>
                    {Object.keys(draft).length > 0 && (
                      <button
                        type="button"
                        onClick={() => setDraft({})}
                        className="px-3 py-2 text-sm text-muted-fg hover:text-fg transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-fg">
                    Each confirmation writes receive movements through the ledger and queues the new quantity for Clover.
                  </p>
                </div>
              )}

              {actionError && <ErrorState title="That didn't go through" message={actionError} />}
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="font-display text-[14px] font-medium text-fg">Order Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'PO Number', value: selectedPO.number },
                  { label: 'Vendor', value: selectedPO.vendorName },
                  { label: 'Order Date', value: formatDate(selectedPO.createdAt) },
                  { label: 'Expected Date', value: formatDate(selectedPO.expectedDate) },
                  { label: 'Items', value: `${formatNumber(selectedPO.lineCount)} products` },
                  { label: 'Total Cost', value: formatMoney(selectedPO.totalCost) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-fg">{label}</span>
                    <span className="font-medium text-fg text-right">{value}</span>
                  </div>
                ))}
              </div>
              {selectedPO.notes && (
                <div className="pt-3 border-t border-border">
                  <div className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-1">Notes</div>
                  <div className="text-sm text-fg">{selectedPO.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Purchase Orders</h1>
            <p className="text-sm text-muted-fg mt-0.5">
              {purchaseOrders.filter((p) => p.status === 'sent' || p.status === 'partial').length} active orders
            </p>
          </div>
          {canManageInventory && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              + New Purchase Order
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex rounded-md border border-border overflow-x-auto mt-4 w-fit max-w-full">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 text-xs font-medium border-r border-border last:border-r-0 transition-colors ${
                filter === f.key ? 'bg-primary text-primary-fg' : 'bg-card text-muted-fg hover:text-fg hover:bg-subtle'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-pad py-5">
        {error && <ErrorState message={error} onRetry={refresh} />}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading && !data && <LoadingRows rows={6} label="Loading purchase orders" />}
          {!loading && filtered.length === 0 && (
            <EmptyState title="No purchase orders here" detail="Create one, or switch the status filter." />
          )}
          <div className="table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-subtle/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">PO #</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Vendor</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Order Date</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Expected</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Items</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Total</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => (
                <tr
                  key={po.id}
                  onClick={() => setSelectedId(po.id)}
                  className="border-b border-border hover:bg-subtle/40 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5 font-mono text-sm font-medium text-primary">{po.number}</td>
                  <td className="px-3 py-3.5 font-medium text-fg">{po.vendorName}</td>
                  <td className="px-3 py-3.5 text-muted-fg">{formatDate(po.createdAt)}</td>
                  <td className="px-3 py-3.5 text-muted-fg">{formatDate(po.expectedDate)}</td>
                  <td className="px-3 py-3.5 text-right font-mono">{po.lineCount}</td>
                  <td className="px-3 py-3.5 text-right font-mono font-medium">{formatMoney(po.totalCost)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={po.status} /></td>
                  <td className="px-4 py-3.5">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedId(po.id)
                      }}
                      className="text-xs text-primary font-medium opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      View<span className="sr-only"> {po.number}</span> →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {creating && (
        <PurchaseOrderForm
          onClose={() => setCreating(false)}
          onCreated={(created) => {
            refresh()
            setSelectedId(created.id)
          }}
        />
      )}
    </div>
  )
}
