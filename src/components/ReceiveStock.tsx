import { useState } from 'react'
import { useDataSource, useMovements, usePermissions } from '../data/provider'
import { formatDate, formatDelta, formatTime } from '../lib/format'

interface ReceiveItem {
  id: string
  name: string
  sku: string
  currentStock: number
  qtyToAdd: string
  vendor: string
  cost: string
  note: string
}

const defaultItem: ReceiveItem = {
  id: '',
  name: '',
  sku: '',
  currentStock: 0,
  qtyToAdd: '',
  vendor: '',
  cost: '',
  note: '',
}

export default function ReceiveStock() {
  const source = useDataSource()
  const { canManageInventory } = usePermissions()
  const movements = useMovements(40)

  const [items, setItems] = useState<ReceiveItem[]>([{ ...defaultItem }])
  const [scannedInput, setScannedInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recentReceives = (movements.data ?? []).filter((movement) => movement.reason === 'receive').slice(0, 6)

  function addItem() {
    setItems([...items, { ...defaultItem }])
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i))
  }

  function updateItem(i: number, field: keyof ReceiveItem, value: string) {
    setItems((current) => current.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)))
  }

  async function handleAddByCode() {
    const code = scannedInput.trim()
    if (!code) return
    setError(null)
    try {
      const result = await source.lookup(code)
      if (!result.found || !result.product) {
        setError(`Nothing matched "${code}"`)
        return
      }
      const product = result.product
      const row: ReceiveItem = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        currentStock: product.stock,
        qtyToAdd: '',
        vendor: product.vendor,
        cost: product.cost.toFixed(2),
        note: '',
      }
      setItems((current) => {
        const blankIndex = current.findIndex((item) => !item.id)
        if (blankIndex === -1) return [...current, row]
        return current.map((item, idx) => (idx === blankIndex ? row : item))
      })
      setScannedInput('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Lookup failed')
    }
  }

  async function handleSubmit() {
    if (!canManageInventory) {
      setError('You do not have permission to receive stock')
      return
    }
    const payload = items.filter((item) => item.id && Number(item.qtyToAdd) > 0)
    if (payload.length === 0) return

    setSaving(true)
    setError(null)
    try {
      for (const item of payload) {
        await source.receive({ productId: item.id, quantity: Number(item.qtyToAdd), note: item.note })
      }
      setItems([{ ...defaultItem }])
      setSubmitted(true)
      movements.refresh()
      setTimeout(() => setSubmitted(false), 3000)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not record this receipt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Receive Stock</h1>
            <p className="text-sm text-muted-fg mt-0.5">Add incoming inventory from vendors or shipments</p>
          </div>
        </div>
      </div>

      <div className="page-pad py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Receive form */}
        <div className="xl:col-span-2 space-y-5">
          {submitted && (
            <div className="flex items-center gap-3 p-4 bg-success-bg border border-success/20 rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <div>
                <div className="text-sm font-semibold text-success">Stock received</div>
                <div className="text-xs text-success/80 mt-0.5">Inventory updated · Clover sync queued</div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-danger-bg border border-danger/20 rounded-lg text-sm text-danger">{error}</div>
          )}

          {/* Scan to add */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-display text-[15px] font-medium text-fg mb-4">Scan or Search Product</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Scan barcode or search by name / SKU…"
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void handleAddByCode()
                    }
                  }}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono"
                />
              </div>
              <button
                onClick={() => void handleAddByCode()}
                className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Items table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-[15px] font-medium text-fg">Items to Receive</h2>
              <button onClick={addItem} className="text-xs text-primary font-medium hover:underline underline-offset-2">
                + Add row
              </button>
            </div>
            <div className="table-wrap">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle/50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Product</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Current</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Qty to Add</th>
                  <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Cost/Unit</th>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Note</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-5 py-3">
                      {item.name ? (
                        <div>
                          <div className="font-medium text-fg text-sm">{item.name}</div>
                          <div className="font-mono text-[11px] text-muted-fg">{item.sku}</div>
                        </div>
                      ) : (
                        <span className="text-muted-fg text-sm italic">Scan a product above</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-sm text-muted-fg">
                      {item.currentStock || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.qtyToAdd}
                        onChange={(e) => updateItem(i, 'qtyToAdd', e.target.value)}
                        placeholder="0"
                        className="w-20 text-right px-2 py-1 rounded border border-border text-sm font-mono bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-muted-fg text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.cost}
                          onChange={(e) => updateItem(i, 'cost', e.target.value)}
                          placeholder="0.00"
                          className="w-20 text-right px-2 py-1 rounded border border-border text-sm font-mono bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => updateItem(i, 'note', e.target.value)}
                        placeholder="Optional note…"
                        className="w-full px-2 py-1 rounded border border-border text-sm bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => removeItem(i)} className="text-muted-fg hover:text-danger transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="px-5 py-3.5 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-fg">
                {items.length} item{items.length !== 1 ? 's' : ''} ·{' '}
                {items.reduce((sum, item) => sum + (parseInt(item.qtyToAdd) || 0), 0)} units total
              </div>
              <button
                onClick={() => void handleSubmit()}
                disabled={!canManageInventory || saving || !items.some((item) => item.id && Number(item.qtyToAdd) > 0)}
                className="px-5 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title={canManageInventory ? undefined : 'Manager access required'}
              >
                {saving ? 'Recording…' : 'Confirm Receipt'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: recent */}
        <div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="font-display text-[15px] font-medium text-fg">Recent Receives</h2>
            </div>
            <div className="divide-y divide-border">
              {recentReceives.length === 0 && (
                <div className="px-5 py-8 text-center text-xs text-muted-fg">No receipts recorded yet.</div>
              )}
              {recentReceives.map((r) => (
                <div key={r.id} className="px-5 py-3.5 hover:bg-subtle/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-primary">{formatDelta(r.delta)} units</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Done
                    </span>
                  </div>
                  <div className="text-sm font-medium text-fg mt-1">{r.productName}</div>
                  <div className="text-xs text-muted-fg mt-0.5">
                    {formatDate(r.createdAt)} · {formatTime(r.createdAt)} · now {r.quantityAfter}
                  </div>
                  <div className="text-xs text-muted-fg mt-0.5">{r.actor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
