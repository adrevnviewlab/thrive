import { useState, useRef } from 'react'

interface ScannedProduct {
  id: string
  name: string
  sku: string
  upc: string
  category: string
  stock: number
  minStock: number
  cost: number
  price: number
  vendor: string
  ageRestricted: boolean
}

const sampleProducts: Record<string, ScannedProduct> = {
  '850049765432': {
    id: '12001',
    name: 'Elf Bar BC5000 Blue Razz',
    sku: 'ELF-BC5000-BR',
    upc: '850049765432',
    category: 'Disposable Vapes',
    stock: 4,
    minStock: 20,
    cost: 9.50,
    price: 19.99,
    vendor: 'Vapor Beast',
    ageRestricted: true,
  },
  '077176506101': {
    id: '12004',
    name: 'Backwoods Honey Bourbon (5pk)',
    sku: 'BW-HONEY-5PK',
    upc: '077176506101',
    category: 'Cigars',
    stock: 3,
    minStock: 24,
    cost: 6.20,
    price: 13.99,
    vendor: 'McLane Company',
    ageRestricted: true,
  },
  '716165175094': {
    id: '12007',
    name: 'RAW Classic King Size Rolling Papers',
    sku: 'RAW-CLS-KS',
    upc: '716165175094',
    category: 'Rolling Papers',
    stock: 8,
    minStock: 30,
    cost: 1.10,
    price: 2.49,
    vendor: 'Standard Wholesale',
    ageRestricted: false,
  },
  '850010400174': {
    id: '12011',
    name: 'Grav Labs 7" Water Pipe',
    sku: 'GRAV-7WP-CLR',
    upc: '850010400174',
    category: 'Pipes & Glass',
    stock: 6,
    minStock: 4,
    cost: 18.00,
    price: 44.99,
    vendor: 'World Wide Wholesale',
    ageRestricted: false,
  },
}

const demoScans = [
  { label: 'Elf Bar BC5000', upc: '850049765432' },
  { label: 'Backwoods', upc: '077176506101' },
  { label: 'RAW Papers', upc: '716165175094' },
  { label: 'Grav Labs Pipe', upc: '850010400174' },
]

type ActionType = 'receive' | 'remove' | 'damage' | 'return' | 'count' | null

export default function Scanner() {
  const [input, setInput] = useState('')
  const [product, setProduct] = useState<ScannedProduct | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const [actionQty, setActionQty] = useState('')
  const [actionNote, setActionNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleScan(upc: string) {
    setActiveAction(null)
    setConfirmed(false)
    setActionQty('')
    setActionNote('')
    const found = sampleProducts[upc]
    if (found) {
      setProduct(found)
      setNotFound(false)
    } else {
      setProduct(null)
      setNotFound(true)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) handleScan(input.trim())
  }

  function handleActionSubmit() {
    setConfirmed(true)
    setActiveAction(null)
  }

  const stockStatusLabel = product
    ? product.stock === 0
      ? 'Out of Stock'
      : product.stock < product.minStock / 2
      ? 'Critical'
      : product.stock < product.minStock
      ? 'Low Stock'
      : 'In Stock'
    : null

  const stockStatusCls = product
    ? product.stock === 0
      ? 'text-muted-fg bg-muted'
      : product.stock < product.minStock / 2
      ? 'text-danger bg-danger-bg'
      : product.stock < product.minStock
      ? 'text-warning bg-warning-bg'
      : 'text-success bg-success-bg'
    : ''

  const actions: { id: ActionType; label: string; color: string; icon: string }[] = [
    { id: 'receive', label: 'Receive', color: 'text-success bg-success-bg border-success/20 hover:bg-success hover:text-success-fg', icon: 'M8 17l4 4 4-4m-4 4V3' },
    { id: 'remove', label: 'Remove', color: 'text-warning bg-warning-bg border-warning/20 hover:bg-warning hover:text-warning-fg', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
    { id: 'damage', label: 'Damage', color: 'text-danger bg-danger-bg border-danger/20 hover:bg-danger hover:text-danger-fg', icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
    { id: 'return', label: 'Return', color: 'text-info bg-info-bg border-info/20 hover:bg-info hover:text-info-fg', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
    { id: 'count', label: 'Count', color: 'text-sync bg-sync-bg border-sync/20 hover:bg-sync hover:text-sync-fg', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ]

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Scanner</h1>
            <p className="text-sm text-muted-fg mt-0.5">Scan a barcode to look up or manage inventory</p>
          </div>
          {product && (
            <button
              onClick={() => { setProduct(null); setInput(''); setNotFound(false); setActiveAction(null); setConfirmed(false); setTimeout(() => inputRef.current?.focus(), 50) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-fg hover:text-fg hover:border-border-strong transition-colors"
            >
              Clear & Rescan
            </button>
          )}
        </div>
      </div>

      <div className="page-pad py-8 max-w-2xl mx-auto">
        {/* Scan input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block text-xs font-semibold text-muted-fg uppercase tracking-wider mb-2">
            Barcode / UPC
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                <path d="M7 8h1M11 8h1M15 8h1M7 12h1M11 12h1M15 12h1M7 16h1M11 16h1M15 16h1" strokeWidth="2" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Scan or type UPC here…"
                value={input}
                onChange={(e) => { setInput(e.target.value); setNotFound(false) }}
                autoFocus
                className="w-full pl-11 pr-4 py-3 text-base rounded-lg border border-border bg-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-lg bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Lookup
            </button>
          </div>

          {/* Quick demo buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[11px] text-muted-fg">Try a demo scan:</span>
            {demoScans.map((s) => (
              <button
                type="button"
                key={s.upc}
                onClick={() => { setInput(s.upc); handleScan(s.upc) }}
                className="text-[11px] px-2 py-1 rounded border border-border text-muted-fg hover:text-fg hover:border-border-strong transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="bg-muted border border-border rounded-lg p-5 text-center">
            <div className="text-muted-fg text-sm">No product found for <span className="font-mono font-medium text-fg">{input}</span></div>
            <button className="mt-3 text-sm text-primary font-medium hover:underline underline-offset-2">
              + Create New Product
            </button>
          </div>
        )}

        {/* Confirmed */}
        {confirmed && product && (
          <div className="bg-success-bg border border-success/20 rounded-lg p-4 mb-4 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-success">Action recorded</div>
              <div className="text-xs text-success/80 mt-0.5">Inventory updated · Clover sync queued</div>
            </div>
          </div>
        )}

        {/* Product card */}
        {product && (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Product header */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-medium text-fg">{product.name}</h2>
                    {product.ageRestricted && (
                      <span className="text-[10px] font-bold text-warning bg-warning-bg border border-warning/20 px-1.5 py-0.5 rounded">21+</span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-muted-fg mt-1">{product.sku} · UPC {product.upc}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${stockStatusCls}`}>
                  {stockStatusLabel}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
              {[
                { label: 'Current Stock', value: product.stock.toString(), mono: true },
                { label: 'Min Stock', value: product.minStock.toString(), mono: true },
                { label: 'Cost', value: `$${product.cost.toFixed(2)}`, mono: true },
                { label: 'Price', value: `$${product.price.toFixed(2)}`, mono: true },
              ].map((stat) => (
                <div key={stat.label} className="px-4 py-4">
                  <div className="text-[11px] text-muted-fg uppercase tracking-wider font-semibold mb-1">{stat.label}</div>
                  <div className={`text-xl font-semibold ${stat.mono ? 'font-mono' : ''} ${stat.label === 'Current Stock' ? (product.stock < product.minStock ? 'text-danger' : 'text-success') : 'text-fg'}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Vendor row */}
            <div className="px-5 py-3 border-t border-border bg-subtle/30">
              <span className="text-xs text-muted-fg">Vendor: </span>
              <span className="text-xs font-medium text-fg">{product.vendor}</span>
              <span className="mx-2 text-border-strong">·</span>
              <span className="text-xs text-muted-fg">Category: </span>
              <span className="text-xs font-medium text-fg">{product.category}</span>
              <span className="mx-2 text-border-strong">·</span>
              <span className="text-xs text-muted-fg">Clover ID: </span>
              <span className="font-mono text-xs text-fg">CLV-{product.id}</span>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-border">
              <div className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-3">Actions</div>
              <div className="flex flex-wrap gap-2">
                {actions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveAction(activeAction === a.id ? null : a.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                      activeAction === a.id
                        ? a.color.replace('hover:', '')
                        : a.color
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={a.icon} />
                    </svg>
                    {a.label}
                  </button>
                ))}
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm font-medium text-muted-fg hover:text-fg hover:border-border-strong transition-all">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              </div>

              {/* Action form */}
              {activeAction && (
                <div className="mt-4 p-4 bg-subtle rounded-lg border border-border">
                  <div className="text-sm font-semibold text-fg mb-3 capitalize">{activeAction} – {product.name}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-fg mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={actionQty}
                        onChange={(e) => setActionQty(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-fg mb-1">Note (optional)</label>
                      <input
                        type="text"
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        placeholder="Add a note…"
                        className="w-full px-3 py-2 text-sm rounded-md border border-border bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleActionSubmit}
                      disabled={!actionQty}
                      className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Confirm {activeAction}
                    </button>
                    <button
                      onClick={() => setActiveAction(null)}
                      className="px-4 py-2 rounded-md border border-border text-sm text-muted-fg hover:text-fg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
