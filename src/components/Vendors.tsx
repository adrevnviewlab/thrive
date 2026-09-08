import { useState } from 'react'

interface Vendor {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  rep: string
  activePOs: number
  lastOrder: string
  totalSpend: string
  categories: string[]
  status: 'active' | 'inactive'
}

const vendors: Vendor[] = [
  {
    id: 'VEN-01',
    name: 'McLane Company',
    contact: 'Distribution',
    email: 'orders@mclane.com',
    phone: '(254) 771-7500',
    rep: 'Mike Patterson',
    activePOs: 1,
    lastOrder: 'Sep 4, 2026',
    totalSpend: '$24,800',
    categories: ['Cigars', 'Lighters', 'Snacks', 'Beverages'],
    status: 'active',
  },
  {
    id: 'VEN-02',
    name: 'Vapor Beast',
    contact: 'Vape Wholesale',
    email: 'wholesale@vaporbeast.com',
    phone: '(602) 900-8000',
    rep: 'Jamie Chen',
    activePOs: 1,
    lastOrder: 'Sep 6, 2026',
    totalSpend: '$11,250',
    categories: ['Disposable Vapes', 'E-Liquids', 'Devices'],
    status: 'active',
  },
  {
    id: 'VEN-03',
    name: 'World Wide Wholesale',
    contact: 'General Wholesale',
    email: 'orders@wwwholesale.com',
    phone: '(888) 224-6639',
    rep: 'Sarah Kovacs',
    activePOs: 0,
    lastOrder: 'Sep 2, 2026',
    totalSpend: '$8,940',
    categories: ['Disposable Vapes', 'Pipes & Glass', 'Accessories'],
    status: 'active',
  },
  {
    id: 'VEN-04',
    name: 'Standard Wholesale',
    contact: 'Paper Goods',
    email: 'orders@standardwholesale.com',
    phone: '(800) 555-0142',
    rep: 'Tom Guerrero',
    activePOs: 0,
    lastOrder: 'Aug 30, 2026',
    totalSpend: '$5,620',
    categories: ['Rolling Papers', 'Accessories', 'Lighters'],
    status: 'active',
  },
  {
    id: 'VEN-05',
    name: 'Coastal Wholesale',
    contact: 'Alt Products',
    email: 'orders@coastalwholesale.com',
    phone: '(855) 202-7830',
    rep: 'Diana Flores',
    activePOs: 0,
    lastOrder: 'Aug 28, 2026',
    totalSpend: '$4,100',
    categories: ['Kratom', 'CBD', 'Supplements'],
    status: 'active',
  },
  {
    id: 'VEN-06',
    name: 'Southeast Tobacco',
    contact: 'Tobacco Distributor',
    email: 'se.tobacco@seltobacco.com',
    phone: '(800) 555-0188',
    rep: 'James O\'Brien',
    activePOs: 0,
    lastOrder: 'Jul 14, 2026',
    totalSpend: '$2,300',
    categories: ['Cigars', 'Pipe Tobacco'],
    status: 'inactive',
  },
]

export default function Vendors() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Vendor | null>(null)

  const filtered = vendors.filter(
    (v) =>
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.rep.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Vendors</h1>
            <p className="text-sm text-muted-fg mt-0.5">{vendors.filter(v => v.status === 'active').length} active vendors</p>
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">
            + Add Vendor
          </button>
        </div>
        <div className="mt-4 relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border bg-bg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="page-pad py-5 grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Vendor list */}
        <div className="xl:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-subtle/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Vendor</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Rep</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Active POs</th>
                <th className="text-left px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Last Order</th>
                <th className="text-right px-3 py-3 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Total Spend</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSelected(v === selected ? null : v)}
                  className={`border-b border-border hover:bg-subtle/40 transition-colors cursor-pointer ${selected?.id === v.id ? 'bg-subtle/60' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-fg">{v.name}</div>
                        <div className="text-[11px] text-muted-fg mt-0.5">{v.contact}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-fg">{v.rep}</td>
                  <td className="px-3 py-3.5 text-right font-mono">
                    {v.activePOs > 0 ? (
                      <span className="font-semibold text-info">{v.activePOs}</span>
                    ) : (
                      <span className="text-muted-fg">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-sm text-muted-fg">{v.lastOrder}</td>
                  <td className="px-3 py-3.5 text-right font-mono font-medium text-fg">{v.totalSpend}</td>
                  <td className="px-3 py-3.5">
                    <span className={`text-[11px] font-medium ${v.status === 'active' ? 'text-success' : 'text-muted-fg'}`}>
                      {v.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-display text-[15px] font-medium text-fg">{selected.name}</div>
                    <div className="text-xs text-muted-fg">{selected.id}</div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { label: 'Contact Rep', value: selected.rep },
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone },
                  { label: 'Active POs', value: selected.activePOs.toString() },
                  { label: 'Last Order', value: selected.lastOrder },
                  { label: 'Total Spend', value: selected.totalSpend },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-muted-fg shrink-0">{label}</span>
                    <span className="font-medium text-fg text-right">{value}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-muted-fg uppercase tracking-wider mb-2">Categories</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.categories.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-fg">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-border flex gap-2">
                <button className="flex-1 py-2 rounded-md bg-primary text-primary-fg text-xs font-medium hover:bg-primary/90 transition-colors">
                  Create PO
                </button>
                <button className="flex-1 py-2 rounded-md border border-border text-xs text-muted-fg hover:text-fg transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-fg text-sm">
              Select a vendor to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
