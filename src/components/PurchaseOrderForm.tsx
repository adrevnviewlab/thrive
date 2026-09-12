import { useMemo, useState } from 'react'
import { useDataSource, useProducts, useVendors } from '../data/provider'
import { formatMoney } from '../lib/format'
import type { Product } from '../types'

interface PurchaseOrderFormProps {
  onClose: () => void
  onCreated: (created: { id: string; number: string }) => void
}

interface Line {
  product: Product
  qtyOrdered: number
  unitCost: number
}

export default function PurchaseOrderForm({ onClose, onCreated }: PurchaseOrderFormProps) {
  const source = useDataSource()
  const vendors = useVendors()
  const products = useProducts()

  const [vendorId, setVendorId] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const catalogue = products.data ?? []

  // Suggest what this vendor supplies and is short of before anything else.
  const suggestions = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const pool = catalogue.filter((product) => {
      if (lines.some((line) => line.product.id === product.id)) return false
      if (needle) return `${product.name} ${product.sku} ${product.upc}`.toLowerCase().includes(needle)
      return vendorId ? product.vendorId === vendorId : false
    })
    return pool
      .sort((a, b) => a.stock - a.minStock - (b.stock - b.minStock))
      .slice(0, 8)
  }, [catalogue, lines, search, vendorId])

  const total = lines.reduce((sum, line) => sum + line.qtyOrdered * line.unitCost, 0)

  function addLine(product: Product) {
    const suggested = Math.max(product.minStock - product.stock, 1)
    setLines((current) => [...current, { product, qtyOrdered: suggested, unitCost: product.cost }])
    setSearch('')
  }

  function updateLine(productId: string, patch: Partial<Omit<Line, 'product'>>) {
    setLines((current) => current.map((line) => (line.product.id === productId ? { ...line, ...patch } : line)))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!vendorId) {
      setError('Pick a vendor')
      return
    }
    if (lines.length === 0) {
      setError('Add at least one product')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const created = await source.createPurchaseOrder({
        vendorId,
        expectedDate: expectedDate || null,
        notes,
        lines: lines.map((line) => ({
          productId: line.product.id,
          qtyOrdered: line.qtyOrdered,
          unitCost: line.unitCost,
        })),
      })
      onCreated(created)
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create this order')
    } finally {
      setSaving(false)
    }
  }

  const field = 'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted-fg/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20'
  const label = 'block text-xs font-medium text-muted-fg mb-1'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-overlay" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg h-full overflow-y-auto bg-card border-l border-border p-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-medium text-fg">New purchase order</h2>
            <p className="text-xs text-muted-fg mt-0.5">Opens as a draft; mark it sent once the vendor has it.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-fg hover:bg-subtle hover:text-fg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <label className={label} htmlFor="po-vendor">Vendor</label>
          <select id="po-vendor" value={vendorId} onChange={(e) => setVendorId(e.target.value)} className={field} required>
            <option value="">Select a vendor</option>
            {(vendors.data ?? []).map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="po-expected">Expected date</label>
            <input id="po-expected" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="po-notes">Notes</label>
            <input id="po-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={field} placeholder="Optional" />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="po-search">Add products</label>
          <input
            id="po-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={field}
            placeholder={vendorId ? 'Search, or pick a suggestion below' : 'Search name, SKU or UPC'}
          />
          {suggestions.length > 0 && (
            <div className="mt-2 border border-border rounded-md divide-y divide-border max-h-56 overflow-y-auto">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addLine(product)}
                  className="w-full text-left px-3 py-2 hover:bg-subtle transition-colors"
                >
                  <div className="text-sm text-fg">{product.name}</div>
                  <div className="text-[11px] text-muted-fg font-mono mt-0.5">
                    {product.sku} · on hand {product.stock} / min {product.minStock}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border border-border rounded-md">
          <div className="px-3 py-2 border-b border-border text-xs font-semibold text-muted-fg uppercase tracking-wider">
            Lines
          </div>
          {lines.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-fg">Nothing added yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {lines.map((line) => (
                <div key={line.product.id} className="px-3 py-2.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm text-fg truncate">{line.product.name}</div>
                      <div className="text-[11px] text-muted-fg font-mono">{line.product.sku}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLines((current) => current.filter((entry) => entry.product.id !== line.product.id))}
                      className="text-[11px] text-danger hover:underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`qty-${line.product.id}`}>Quantity</label>
                    <input
                      id={`qty-${line.product.id}`}
                      value={line.qtyOrdered}
                      onChange={(e) => updateLine(line.product.id, { qtyOrdered: Math.max(1, Number(e.target.value) || 0) })}
                      inputMode="numeric"
                      className="w-20 rounded-md border border-border bg-bg px-2 py-1.5 text-sm font-mono text-fg"
                    />
                    <span className="text-xs text-muted-fg">×</span>
                    <label className="sr-only" htmlFor={`cost-${line.product.id}`}>Unit cost</label>
                    <input
                      id={`cost-${line.product.id}`}
                      value={line.unitCost}
                      onChange={(e) => updateLine(line.product.id, { unitCost: Number(e.target.value) || 0 })}
                      inputMode="decimal"
                      className="w-24 rounded-md border border-border bg-bg px-2 py-1.5 text-sm font-mono text-fg"
                    />
                    <span className="ml-auto text-sm font-mono text-fg">{formatMoney(line.qtyOrdered * line.unitCost)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-3 py-2 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-fg">Order total</span>
            <span className="font-mono font-medium text-fg">{formatMoney(total)}</span>
          </div>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-md bg-primary text-primary-fg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Creating…' : 'Create draft order'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2.5 text-sm text-muted-fg hover:text-fg hover:bg-subtle transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
