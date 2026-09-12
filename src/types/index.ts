/**
 * Shapes shared by the mock and live data sources. Components depend on these
 * only, so demo mode and the API render identically.
 *
 * Money is in dollars here and cents in the API; the API source converts.
 */

export type StockStatus = 'in-stock' | 'low' | 'critical' | 'out'
export type SyncStatus = 'synced' | 'pending' | 'failed'
export type Role = 'owner' | 'manager' | 'employee' | 'admin'

export interface Product {
  id: string
  name: string
  sku: string
  upc: string
  category: string
  brand: string
  vendor: string
  vendorId: string | null
  stock: number
  minStock: number
  cost: number
  price: number
  stockStatus: StockStatus
  syncStatus: SyncStatus
  ageRestricted: boolean
  cloverItemId: string | null
}

export interface Category {
  id: string
  name: string
  productCount: number
}

export interface ProductInput {
  name: string
  sku?: string | null
  upc?: string | null
  brand?: string
  categoryName?: string | null
  vendorId?: string | null
  /** Dollars; converted to cents by the API source. */
  cost?: number
  price?: number
  minStock?: number
  reorderQty?: number
  ageRestricted?: boolean
}

export interface Movement {
  id: string
  productId: string
  productName: string
  delta: number
  quantityAfter: number
  reason: string
  note: string
  actor: string
  createdAt: string
}

export interface PendingSyncItem {
  id: string
  product: string
  desiredQuantity: number
  attempts: number
  error: string | null
  updatedAt: string
}

export interface DashboardSummary {
  storeName: string
  kpis: {
    totalProducts: number
    addedThisWeek: number
    lowStock: number
    criticalStock: number
    pendingSync: number
    failedSync: number
    inventoryValue: number
    transactionsToday: number
    transactionsYesterday: number
  }
  lowStockItems: Array<{
    id: string
    name: string
    sku: string
    quantity: number
    minStock: number
    vendor: string
    status: StockStatus
  }>
  recentMovements: Movement[]
  pendingSync: PendingSyncItem[]
}

export interface Vendor {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  rep: string
  status: 'active' | 'inactive'
  productCount: number
  activePurchaseOrders: number
  lastOrderAt: string | null
  totalSpend: number
}

export interface VendorInput {
  name: string
  contactName?: string
  email?: string
  phone?: string
  rep?: string
  notes?: string
  status?: 'active' | 'inactive'
}

export type PurchaseOrderStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'

export interface PurchaseOrder {
  id: string
  number: string
  vendorId: string
  vendorName: string
  status: PurchaseOrderStatus
  expectedDate: string | null
  notes: string
  lineCount: number
  unitsOrdered: number
  unitsReceived: number
  totalCost: number
  createdAt: string
}

export interface PurchaseOrderItem {
  id: string
  productId: string
  name: string
  sku: string
  upc: string
  qtyOrdered: number
  qtyReceived: number
  unitCost: number
  lineTotal: number
  status: 'pending' | 'partial' | 'received'
}

export interface PurchaseOrderInput {
  vendorId: string
  expectedDate?: string | null
  notes?: string
  lines: Array<{ productId: string; qtyOrdered: number; unitCost?: number }>
}

/** A scanned or picked shipment line; `code` is a barcode or SKU. */
export interface ReceiveLine {
  productId?: string
  code?: string
  quantity: number
}

export type StockCountStatus = 'open' | 'pending_approval' | 'closed' | 'cancelled'

export interface StockCount {
  id: string
  status: StockCountStatus
  note: string
  scopeCategory: string | null
  openedBy: string
  approvedBy: string | null
  openedAt: string
  closedAt: string | null
  approvedAt: string | null
  totalItems: number
  counted: number
  discrepancies: number
}

export interface StockCountItem {
  id: string
  productId: string
  name: string
  sku: string
  upc: string
  expected: number
  counted: number | null
  variance: number | null
}

export interface Employee {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'disabled'
  lastLoginAt: string | null
}

/** What the API says the signed-in user is and may do; the server is the authority. */
export interface Viewer {
  id: string
  name: string
  email: string
  role: Role
  storeName: string
  locationName: string
  permissions: {
    canManageInventory: boolean
    canApproveCounts: boolean
    canEditCost: boolean
    canManageEmployees: boolean
    canManageSettings: boolean
  }
}

export interface AuditEntry {
  id: string
  action: string
  entityType: string
  entityId: string | null
  actor: string
  meta: Record<string, unknown>
  createdAt: string
}

export interface MovementSeriesPoint {
  label: string
  received: number
  removed: number
}

export interface TopMover {
  id: string
  name: string
  sku: string
  unitsSold: number
  unitsReceived: number
  revenue: number
  margin: number
}

export interface CategoryReportRow {
  category: string
  products: number
  onHand: number
  unitsSold: number
  value: number
}

export interface SettingsSummary {
  merchant: { name: string; timezone: string }
  clover: {
    mode: 'mock' | 'live'
    environment: string
    connected: boolean
    merchantId: string | null
    connectedAt: string | null
    webhooksConfigured: boolean
  }
  sync: {
    pending: number
    failed: number
    lastSyncedAt: string | null
    lastReconciledAt: string | null
  }
}

export interface LookupResult {
  found: boolean
  code: string
  matchedOn?: 'upc' | 'sku' | 'name'
  product?: Product
}

export type ImportMatchStatus =
  | 'pending'
  | 'matched'
  | 'possible'
  | 'unmatched'
  | 'duplicate'
  | 'skipped'
  | 'committed'
  | 'failed'

export interface ImportBatch {
  id: string
  filename: string
  source: string
  status: 'uploaded' | 'mapped' | 'committed' | 'failed'
  rowCount: number
  matched: number
  possible: number
  unmatched: number
  duplicate: number
  committed: number
  createdAt: string
  committedAt: string | null
}

export interface ImportRow {
  id: string
  rowNumber: number
  raw: Record<string, string>
  mapped: {
    name: string
    sku: string | null
    upc: string | null
    quantity: number | null
    costCents: number | null
    priceCents: number | null
    category: string | null
    vendor: string | null
  } | null
  matchStatus: ImportMatchStatus
  matchProductId: string | null
  matchProductName: string | null
  matchReason: string
  error: string | null
}

export interface ImportUpload {
  batchId: string
  headers: string[]
  rowCount: number
  suggestedMapping: Record<string, string>
  canonicalFields: string[]
  preview: Array<Record<string, string>>
}

export interface MovementInput {
  productId: string
  quantity: number
  note?: string
}
