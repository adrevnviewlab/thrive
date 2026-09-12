import { useState } from 'react'
import { useCategories, usePermissions, useProducts } from '../data/provider'
import { downloadCsv, toCsv } from '../lib/csv'
import { formatMoney, formatNumber } from '../lib/format'
import type { Product, StockStatus, SyncStatus } from '../types'
import ProductForm from './ProductForm'
import { EmptyState, ErrorState, LoadingRows } from './States'

const statusFilters = ['All', 'In Stock', 'Low Stock', 'Critical', 'Out of Stock']

function StockBadge({ status }: { status: StockStatus }) {
  const config: Record<StockStatus, { label: string; cls: string }> = {
    'in-stock': { label: 'In Stock', cls: 'bg-success-bg text-success' },
    low: { label: 'Low', cls: 'bg-warning-bg text-warning' },
    critical: { label: 'Critical', cls: 'bg-danger-bg text-danger' },
    out: { label: 'Out', cls: 'bg-muted text-muted-fg' },
  }
  const c = config[status]
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${c.cls}`}>{c.label}</span>
}

function SyncBadge({ status }: { status: SyncStatus }) {
  const config: Record<SyncStatus, { label: string; cls: string; dot: string }> = {
    synced: { label: 'Synced', cls: 'text-success', dot: 'bg-success' },
    pending: { label: 'Pending', cls: 'text-warning', dot: 'bg-warning' },
    failed: { label: 'Failed', cls: 'text-danger', dot: 'bg-danger' },
  }
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

export default function Inventory() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')

  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const { canManageInventory } = usePermissions()
  const { data, loading, error, refresh } = useProducts()
  const categoryQuery = useCategories()

  const products = data ?? []
  const categoryNames = (categoryQuery.data ?? []).map((category) => category.name)
  const categories = ['All Categories', ...categoryNames]

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.upc.includes(search)
    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'In Stock' && p.stockStatus === 'in-stock') ||
      (statusFilter === 'Low Stock' && p.stockStatus === 'low') ||
      (statusFilter === 'Critical' && p.stockStatus === 'critical') ||
      (statusFilter === 'Out of Stock' && p.stockStatus === 'out')
    const matchCat = categoryFilter === 'All Categories' || p.category === categoryFilter
    return matchSearch && matchStatus && matchCat
  })

  function openForm(product: Product | null) {
    setEditing(product)
    setFormOpen(true)
  }

  function handleExport() {
    downloadCsv(
      `stackr-inventory-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        ['Name', 'SKU', 'UPC', 'Category', 'Vendor', 'Stock', 'Min stock', 'Cost', 'Price', 'Status', 'Clover item'],
        filtered.map((product) => [
          product.name,
          product.sku,
          product.upc,
          product.category,
          product.vendor,
          product.stock,
          product.minStock,
          product.cost.toFixed(2),
          product.price.toFixed(2),
          product.stockStatus,
          product.cloverItemId ?? '',
        ]),
      ),
    )
  }

  const counts = {
    All: products.length,
    'In Stock': products.filter((p) => p.stockStatus === 'in-stock').length,
    'Low Stock': products.filter((p) => p.stockStatus === 'low').length,
    Critical: products.filter((p) => p.stockStatus === 'critical').length,
    'Out of Stock': products.filter((p) => p.stockStatus === 'out').length,
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Inventory</h1>
            <p className="text-sm text-muted-fg mt-0.5">
              {formatNumber(products.length)} products · {products.filter((p) => p.stockStatus === 'critical' || p.stockStatus === 'out').length} need attention
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-fg hover:text-fg hover:border-border-strong disabled:opacity-50 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
            {canManageInventory && (
              <button
                type="button"
                onClick={() => openForm(null)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                + Add Product
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mt-4">
          <div className="relative w-full lg:flex-1 lg:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search name, SKU, or UPC…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-fg cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <div className="flex rounded-md border border-border overflow-x-auto">
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium border-r border-border last:border-r-0 transition-colors ${
                  statusFilter === f
                    ? 'bg-primary text-primary-fg'
                    : 'bg-card text-muted-fg hover:text-fg hover:bg-subtle'
                }`}
              >
                {f}
                <span className={`ml-1 font-mono ${statusFilter === f ? 'text-primary-fg/70' : 'text-muted-fg'}`}>
                  {counts[f as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="page-pad py-5">
        {error && <ErrorState message={error} onRetry={refresh} />}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading && !data && <LoadingRows rows={8} label="Loading products" />}
          {!loading && filtered.length === 0 && (
            <EmptyState title="No products match these filters" detail="Clear the search or pick another category." />
          )}
          <div className="table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-subtle/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Product</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Category</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Stock</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Min</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Cost</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Price</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Vendor</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Clover</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-subtle/40 transition-colors cursor-pointer group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium text-fg flex items-center gap-1.5">
                          {p.name}
                          {p.ageRestricted && (
                            <span className="text-[9px] font-bold text-warning/80 bg-warning-bg px-1 py-0.5 rounded leading-none">21+</span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-muted-fg mt-0.5">
                          {p.sku} · {p.upc}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-muted-fg">{p.category}</td>
                  <td className="px-3 py-3.5 text-right font-mono font-semibold text-sm">
                    <span className={p.stockStatus === 'critical' || p.stockStatus === 'out' ? 'text-danger' : p.stockStatus === 'low' ? 'text-warning' : 'text-fg'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono text-sm text-muted-fg">{p.minStock}</td>
                  <td className="px-3 py-3.5 text-right font-mono text-sm text-muted-fg">{formatMoney(p.cost)}</td>
                  <td className="px-3 py-3.5 text-right font-mono text-sm text-fg font-medium">{formatMoney(p.price)}</td>
                  <td className="px-3 py-3.5 text-sm text-muted-fg">{p.vendor}</td>
                  <td className="px-3 py-3.5"><StockBadge status={p.stockStatus} /></td>
                  <td className="px-3 py-3.5"><SyncBadge status={p.syncStatus} /></td>
                  <td className="px-4 py-3.5">
                    {canManageInventory && (
                      <button
                        type="button"
                        onClick={() => openForm(p)}
                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs text-primary font-medium hover:underline underline-offset-2 transition-opacity"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="px-5 py-3 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-fg">
            <span>
              Showing {formatNumber(filtered.length)} of {formatNumber(products.length)} products
            </span>
            <button
              type="button"
              onClick={refresh}
              className="px-2 py-1 rounded border border-border hover:bg-subtle transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {formOpen && (
        <ProductForm
          product={editing}
          categories={categoryNames}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            refresh()
            categoryQuery.refresh()
          }}
        />
      )}
    </div>
  )
}
