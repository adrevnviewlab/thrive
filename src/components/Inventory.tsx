import { useState } from 'react'

type StockStatus = 'in-stock' | 'low' | 'critical' | 'out'
type SyncStatus = 'synced' | 'pending' | 'failed'

interface Product {
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
  stockStatus: StockStatus
  syncStatus: SyncStatus
  ageRestricted: boolean
}

const products: Product[] = [
  { id: '12001', name: 'Elf Bar BC5000 Blue Razz', sku: 'ELF-BC5000-BR', upc: '850049765432', category: 'Disposable Vapes', stock: 4, minStock: 20, cost: 9.50, price: 19.99, vendor: 'Vapor Beast', stockStatus: 'critical', syncStatus: 'synced', ageRestricted: true },
  { id: '12002', name: 'Elf Bar BC5000 Strawberry Mango', sku: 'ELF-BC5000-SM', upc: '850049765433', category: 'Disposable Vapes', stock: 18, minStock: 20, cost: 9.50, price: 19.99, vendor: 'Vapor Beast', stockStatus: 'low', syncStatus: 'synced', ageRestricted: true },
  { id: '12003', name: 'Hyde Retro RAVE Watermelon Ice', sku: 'HYD-RETRO-WI', upc: '810046230891', category: 'Disposable Vapes', stock: 7, minStock: 15, cost: 8.75, price: 17.99, vendor: 'World Wide Wholesale', stockStatus: 'low', syncStatus: 'pending', ageRestricted: true },
  { id: '12004', name: 'Backwoods Honey Bourbon (5pk)', sku: 'BW-HONEY-5PK', upc: '077176506101', category: 'Cigars', stock: 3, minStock: 24, cost: 6.20, price: 13.99, vendor: 'McLane Company', stockStatus: 'critical', syncStatus: 'synced', ageRestricted: true },
  { id: '12005', name: 'Swisher Sweets Grape (2pk)', sku: 'SWI-GRP-2PK', upc: '072140003001', category: 'Cigars', stock: 5, minStock: 48, cost: 1.40, price: 2.99, vendor: 'McLane Company', stockStatus: 'critical', syncStatus: 'synced', ageRestricted: true },
  { id: '12006', name: 'Swisher Sweets Peach (2pk)', sku: 'SWI-PCH-2PK', upc: '072140003002', category: 'Cigars', stock: 44, minStock: 48, cost: 1.40, price: 2.99, vendor: 'McLane Company', stockStatus: 'low', syncStatus: 'synced', ageRestricted: true },
  { id: '12007', name: 'RAW Classic King Size Rolling Papers', sku: 'RAW-CLS-KS', upc: '716165175094', category: 'Rolling Papers', stock: 8, minStock: 30, cost: 1.10, price: 2.49, vendor: 'Standard Wholesale', stockStatus: 'low', syncStatus: 'synced', ageRestricted: false },
  { id: '12008', name: 'RAW Cone 1¼ (32pk)', sku: 'RAW-CONE-125', upc: '716165175100', category: 'Rolling Papers', stock: 32, minStock: 24, cost: 2.80, price: 5.99, vendor: 'Standard Wholesale', stockStatus: 'in-stock', syncStatus: 'synced', ageRestricted: false },
  { id: '12009', name: 'Bic Classic Lighter – Assorted', sku: 'BIC-CLS-ASST', upc: '070330608011', category: 'Lighters', stock: 14, minStock: 50, cost: 0.95, price: 2.29, vendor: 'McLane Company', stockStatus: 'low', syncStatus: 'synced', ageRestricted: false },
  { id: '12010', name: 'Clipper Refillable Lighter', sku: 'CLIP-STD-ASST', upc: '897511000012', category: 'Lighters', stock: 28, minStock: 30, cost: 1.20, price: 3.49, vendor: 'Standard Wholesale', stockStatus: 'low', syncStatus: 'synced', ageRestricted: false },
  { id: '12011', name: 'Grav Labs 7" Water Pipe', sku: 'GRAV-7WP-CLR', upc: '850010400174', category: 'Pipes & Glass', stock: 6, minStock: 4, cost: 18.00, price: 44.99, vendor: 'World Wide Wholesale', stockStatus: 'in-stock', syncStatus: 'synced', ageRestricted: false },
  { id: '12012', name: 'Santa Cruz Shredder 3pc Grinder Med.', sku: 'SCS-3PC-MED', upc: '850024291035', category: 'Accessories', stock: 11, minStock: 8, cost: 12.50, price: 29.99, vendor: 'World Wide Wholesale', stockStatus: 'in-stock', syncStatus: 'synced', ageRestricted: false },
  { id: '12013', name: 'Smoke Buddy Personal Air Filter', sku: 'SB-ORIG-BLK', upc: '855681002001', category: 'Accessories', stock: 0, minStock: 6, cost: 6.00, price: 14.99, vendor: 'Standard Wholesale', stockStatus: 'out', syncStatus: 'synced', ageRestricted: false },
  { id: '12014', name: 'Kratom Capsules Maeng Da 50ct', sku: 'KRA-MD-50CT', upc: '851294007123', category: 'Kratom', stock: 23, minStock: 12, cost: 11.00, price: 24.99, vendor: 'Coastal Wholesale', stockStatus: 'in-stock', syncStatus: 'failed', ageRestricted: false },
  { id: '12015', name: 'CBD Gummies 25mg Full Spectrum (30ct)', sku: 'CBD-GUM-FS30', upc: '860002345678', category: 'CBD', stock: 17, minStock: 10, cost: 14.00, price: 34.99, vendor: 'Coastal Wholesale', stockStatus: 'in-stock', syncStatus: 'synced', ageRestricted: false },
  { id: '12016', name: 'Zig-Zag Ultra Thin King Size', sku: 'ZZ-ULTRA-KS', upc: '076618000123', category: 'Rolling Papers', stock: 54, minStock: 36, cost: 0.80, price: 1.89, vendor: 'McLane Company', stockStatus: 'in-stock', syncStatus: 'synced', ageRestricted: false },
  { id: '12017', name: 'Elements Rice Papers 1¼', sku: 'ELM-RICE-125', upc: '040232021121', category: 'Rolling Papers', stock: 0, minStock: 18, cost: 0.90, price: 1.99, vendor: 'Standard Wholesale', stockStatus: 'out', syncStatus: 'synced', ageRestricted: false },
  { id: '12018', name: 'Juicy Jay Blueberry King Size', sku: 'JJ-BLUE-KS', upc: '040232030123', category: 'Rolling Papers', stock: 29, minStock: 24, cost: 0.85, price: 1.99, vendor: 'Standard Wholesale', stockStatus: 'in-stock', syncStatus: 'synced', ageRestricted: false },
]

const categories = ['All Categories', 'Disposable Vapes', 'Cigars', 'Rolling Papers', 'Lighters', 'Pipes & Glass', 'Accessories', 'Kratom', 'CBD']
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
              {products.length.toLocaleString()} products · {products.filter(p => p.stockStatus === 'critical' || p.stockStatus === 'out').length} need attention
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted-fg hover:text-fg hover:border-border-strong transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">
              + Add Product
            </button>
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
            {categories.map((c) => <option key={c}>{c}</option>)}
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
        <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                  <td className="px-3 py-3.5 text-right font-mono text-sm text-muted-fg">${p.cost.toFixed(2)}</td>
                  <td className="px-3 py-3.5 text-right font-mono text-sm text-fg font-medium">${p.price.toFixed(2)}</td>
                  <td className="px-3 py-3.5 text-sm text-muted-fg">{p.vendor}</td>
                  <td className="px-3 py-3.5"><StockBadge status={p.stockStatus} /></td>
                  <td className="px-3 py-3.5"><SyncBadge status={p.syncStatus} /></td>
                  <td className="px-4 py-3.5">
                    <button className="opacity-0 group-hover:opacity-100 text-xs text-primary font-medium hover:underline underline-offset-2 transition-opacity">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="px-5 py-3 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-fg">
            <span>Showing {filtered.length} of {products.length} products</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 rounded border border-border hover:bg-subtle transition-colors">← Prev</button>
              <button className="px-2 py-1 rounded border border-border bg-primary text-primary-fg">1</button>
              <button className="px-2 py-1 rounded border border-border hover:bg-subtle transition-colors">2</button>
              <button className="px-2 py-1 rounded border border-border hover:bg-subtle transition-colors">3</button>
              <button className="px-2 py-1 rounded border border-border hover:bg-subtle transition-colors">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
