import { useState } from 'react'
import type { NavSection } from '../App'
import { usePermissions, useVendors } from '../data/provider'
import { formatDate, formatMoneyCompact, formatNumber } from '../lib/format'
import type { Vendor } from '../types'
import { EmptyState, ErrorState, LoadingRows } from './States'
import VendorForm from './VendorForm'

export default function Vendors({ onNavigate }: { onNavigate: (section: NavSection) => void }) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { canManageInventory } = usePermissions()

  const { data, loading, error, refresh } = useVendors()
  const vendors = data ?? []
  const selected = vendors.find((vendor) => vendor.id === selectedId) ?? null

  function openForm(vendor: Vendor | null) {
    if (!canManageInventory) return
    setEditing(vendor)
    setFormOpen(true)
  }

  const filtered = vendors.filter(
    (v) =>
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.rep.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium text-fg">Vendors</h1>
            <p className="text-sm text-muted-fg mt-0.5">
              {vendors.filter((v) => v.status === 'active').length} active vendors
            </p>
          </div>
          {canManageInventory && (
            <button
              type="button"
              onClick={() => openForm(null)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              + Add Vendor
            </button>
          )}
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
          {error && <ErrorState message={error} onRetry={refresh} />}
          {loading && !data && <LoadingRows rows={5} label="Loading vendors" />}
          {!loading && filtered.length === 0 && (
            <EmptyState title="No vendors found" detail="Add a vendor or clear the search." />
          )}
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
                  onClick={() => setSelectedId(v.id === selectedId ? null : v.id)}
                  className={`border-b border-border hover:bg-subtle/40 transition-colors cursor-pointer ${selected?.id === v.id ? 'bg-subtle/60' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedId(v.id === selectedId ? null : v.id)
                          }}
                          className="font-medium text-fg text-left hover:text-primary"
                        >
                          {v.name}
                        </button>
                        <div className="text-[11px] text-muted-fg mt-0.5">{v.contactName || v.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-fg">{v.rep || '—'}</td>
                  <td className="px-3 py-3.5 text-right font-mono">
                    {v.activePurchaseOrders > 0 ? (
                      <span className="font-semibold text-info">{v.activePurchaseOrders}</span>
                    ) : (
                      <span className="text-muted-fg">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-sm text-muted-fg">{formatDate(v.lastOrderAt)}</td>
                  <td className="px-3 py-3.5 text-right font-mono font-medium text-fg">{formatMoneyCompact(v.totalSpend)}</td>
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
                    <div className="text-xs text-muted-fg">{selected.contactName || 'Vendor'}</div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { label: 'Contact Rep', value: selected.rep || '—' },
                  { label: 'Email', value: selected.email || '—' },
                  { label: 'Phone', value: selected.phone || '—' },
                  { label: 'Products', value: formatNumber(selected.productCount) },
                  { label: 'Active POs', value: formatNumber(selected.activePurchaseOrders) },
                  { label: 'Last Order', value: formatDate(selected.lastOrderAt) },
                  { label: 'Total Spend', value: formatMoneyCompact(selected.totalSpend) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-2 text-sm">
                    <span className="text-muted-fg shrink-0">{label}</span>
                    <span className="font-medium text-fg text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-border flex gap-2">
                {canManageInventory && (
                  <button
                    type="button"
                    onClick={() => onNavigate('purchase-orders')}
                    className="flex-1 py-2 rounded-md bg-primary text-primary-fg text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create PO
                  </button>
                )}
                {canManageInventory && (
                  <button
                    type="button"
                    onClick={() => openForm(selected)}
                    className="flex-1 py-2 rounded-md border border-border text-xs text-muted-fg hover:text-fg transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-fg text-sm">
              Select a vendor to view details
            </div>
          )}
        </div>
      </div>

      {formOpen && <VendorForm vendor={editing} onClose={() => setFormOpen(false)} onSaved={refresh} />}
    </div>
  )
}
