import { useState } from 'react'

type POStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'

interface PO {
  id: string
  vendor: string
  date: string
  expectedDate: string
  items: number
  totalCost: number
  status: POStatus
  notes: string
}

const purchaseOrders: PO[] = [
  { id: 'PO-1084', vendor: 'Vapor Beast', date: 'Sep 6, 2026', expectedDate: 'Sep 10, 2026', items: 8, totalCost: 412.50, status: 'sent', notes: 'Expedited shipping requested' },
  { id: 'PO-1083', vendor: 'McLane Company', date: 'Sep 4, 2026', expectedDate: 'Sep 9, 2026', items: 22, totalCost: 1840.00, status: 'partial', notes: '' },
  { id: 'PO-1082', vendor: 'World Wide Wholesale', date: 'Sep 2, 2026', expectedDate: 'Sep 7, 2026', items: 14, totalCost: 728.40, status: 'received', notes: '' },
  { id: 'PO-1081', vendor: 'Standard Wholesale', date: 'Aug 30, 2026', expectedDate: 'Sep 4, 2026', items: 10, totalCost: 198.50, status: 'received', notes: '' },
  { id: 'PO-1080', vendor: 'Coastal Wholesale', date: 'Aug 28, 2026', expectedDate: 'Sep 2, 2026', items: 5, totalCost: 310.00, status: 'received', notes: '' },
  { id: 'PO-1079', vendor: 'Vapor Beast', date: 'Aug 25, 2026', expectedDate: 'Aug 30, 2026', items: 12, totalCost: 624.00, status: 'received', notes: '' },
  { id: 'PO-1078', vendor: 'McLane Company', date: 'Aug 22, 2026', expectedDate: 'Aug 27, 2026', items: 18, totalCost: 1560.20, status: 'received', notes: '' },
  { id: 'PO-1077', vendor: 'Standard Wholesale', date: 'Aug 18, 2026', expectedDate: 'Aug 23, 2026', items: 7, totalCost: 142.80, status: 'cancelled', notes: 'Vendor out of stock' },
]

const poItems = [
  { sku: 'ELF-BC5000-BR', name: 'Elf Bar BC5000 Blue Razz', qty: 24, received: 0, cost: 9.50, total: 228.00, status: 'pending' as const },
  { sku: 'ELF-BC5000-SM', name: 'Elf Bar BC5000 Strawberry Mango', qty: 24, received: 12, cost: 9.50, total: 228.00, status: 'partial' as const },
  { sku: 'HYD-RETRO-WI', name: 'Hyde Retro RAVE Watermelon Ice', qty: 18, received: 0, cost: 8.75, total: 157.50, status: 'pending' as const },
  { sku: 'HYD-RETRO-MI', name: 'Hyde Retro RAVE Mango Ice', qty: 18, received: 18, cost: 8.75, total: 157.50, status: 'received' as const },
]

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

export default function PurchaseOrders() {
  const [filter, setFilter] = useState('All')
  const [selectedPO, setSelectedPO] = useState<PO | null>(null)

  const filtered = filter === 'All' ? purchaseOrders : purchaseOrders.filter((p) => p.status === filter)

  if (selectedPO) {
    return (
      <div className="min-h-full">
        <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedPO(null)} className="text-muted-fg hover:text-fg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="font-display text-[22px] font-medium text-fg">{selectedPO.id}</h1>
              <p className="text-sm text-muted-fg mt-0.5">{selectedPO.vendor} · {selectedPO.date}</p>
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
                <span className="text-xs text-muted-fg">{poItems.length} items · ${selectedPO.totalCost.toFixed(2)} total</span>
              </div>
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
                  </tr>
                </thead>
                <tbody>
                  {poItems.map((item, i) => (
                    <tr key={i} className="border-b border-border hover:bg-subtle/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-fg">{item.name}</div>
                        <div className="font-mono text-[11px] text-muted-fg mt-0.5">{item.sku}</div>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-sm">{item.qty}</td>
                      <td className="px-3 py-3.5 text-right font-mono text-sm">
                        <span className={item.received === item.qty ? 'text-success' : item.received > 0 ? 'text-warning' : 'text-muted-fg'}>
                          {item.received}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-sm text-muted-fg">${item.cost.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-right font-mono text-sm font-medium">${item.total.toFixed(2)}</td>
                      <td className="px-3 py-3.5">
                        <span className={`text-[11px] font-medium ${item.status === 'received' ? 'text-success' : item.status === 'partial' ? 'text-warning' : 'text-muted-fg'}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="px-5 py-4 border-t border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-fg">
                  <span className="font-medium text-fg">30</span> of{' '}
                  <span className="font-medium text-fg">84</span> units received
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-md border border-border text-sm text-muted-fg hover:text-fg transition-colors">
                    Print PO
                  </button>
                  <button className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">
                    Receive Items
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="font-display text-[14px] font-medium text-fg">Order Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'PO Number', value: selectedPO.id },
                  { label: 'Vendor', value: selectedPO.vendor },
                  { label: 'Order Date', value: selectedPO.date },
                  { label: 'Expected Date', value: selectedPO.expectedDate },
                  { label: 'Items', value: `${selectedPO.items} products` },
                  { label: 'Total Cost', value: `$${selectedPO.totalCost.toFixed(2)}` },
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
              {purchaseOrders.filter(p => p.status === 'sent' || p.status === 'partial').length} active orders
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 transition-colors">
            + New Purchase Order
          </button>
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
        <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                  onClick={() => setSelectedPO(po)}
                  className="border-b border-border hover:bg-subtle/40 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5 font-mono text-sm font-medium text-primary">{po.id}</td>
                  <td className="px-3 py-3.5 font-medium text-fg">{po.vendor}</td>
                  <td className="px-3 py-3.5 text-muted-fg">{po.date}</td>
                  <td className="px-3 py-3.5 text-muted-fg">{po.expectedDate}</td>
                  <td className="px-3 py-3.5 text-right font-mono">{po.items}</td>
                  <td className="px-3 py-3.5 text-right font-mono font-medium">${po.totalCost.toFixed(2)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={po.status} /></td>
                  <td className="px-4 py-3.5">
                    <span className="opacity-0 group-hover:opacity-100 text-xs text-primary font-medium transition-opacity">View →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}
