import type {
  AuditEntry,
  CategoryReportRow,
  Employee,
  Movement,
  MovementSeriesPoint,
  PendingSyncItem,
  PurchaseOrder,
  PurchaseOrderItem,
  StockCount,
  StockCountItem,
  TopMover,
  Vendor,
} from '../../types'

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString()
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

export const mockMovements: Movement[] = [
  { id: 'MV-1', productId: '12002', productName: 'Elf Bar BC5000 Strawberry Mango', delta: -2, quantityAfter: 18, reason: 'sale', note: 'Sale (Clover)', actor: 'Clover', createdAt: hoursAgo(1) },
  { id: 'MV-2', productId: '12011', productName: 'Grav Labs 7" Water Pipe', delta: -1, quantityAfter: 6, reason: 'sale', note: 'Sale (Clover)', actor: 'Clover', createdAt: hoursAgo(2) },
  { id: 'MV-3', productId: '12003', productName: 'Hyde Rebel Pro 5000 Puffs', delta: 24, quantityAfter: 24, reason: 'receive', note: 'Received from PO-1084', actor: 'Hassan M.', createdAt: hoursAgo(6) },
  { id: 'MV-4', productId: '12008', productName: 'RAW Cone 1¼ (32pk)', delta: -3, quantityAfter: 32, reason: 'sale', note: 'Sale (Clover)', actor: 'Clover', createdAt: hoursAgo(7) },
  { id: 'MV-5', productId: '12006', productName: 'Swisher Sweets Peach (2pk)', delta: -4, quantityAfter: 44, reason: 'sale', note: 'Sale (Clover)', actor: 'Clover', createdAt: hoursAgo(8) },
  { id: 'MV-6', productId: '12009', productName: 'Bic Classic Lighter – Assorted', delta: 50, quantityAfter: 14, reason: 'adjust', note: 'Stock adjustment', actor: 'Marcus T.', createdAt: hoursAgo(10) },
  { id: 'MV-7', productId: '12015', productName: 'Delta-8 THC Gummies 25mg (20ct)', delta: -1, quantityAfter: 17, reason: 'sale', note: 'Sale (Clover)', actor: 'Clover', createdAt: hoursAgo(11) },
  { id: 'MV-8', productId: '12004', productName: 'Backwoods Honey Bourbon (5pk)', delta: -6, quantityAfter: 3, reason: 'damage', note: 'Damaged – water', actor: 'Hassan M.', createdAt: hoursAgo(12) },
]

export const mockPendingSync: PendingSyncItem[] = [
  { id: 'SYN-4821', product: 'Elf Bar BC5000 Blue Razz', desiredQuantity: 24, attempts: 2, error: 'API timeout', updatedAt: hoursAgo(0.13) },
  { id: 'SYN-4820', product: 'Hyde Retro RAVE Mango Ice', desiredQuantity: 12, attempts: 1, error: 'Rate limit', updatedAt: hoursAgo(0.2) },
  { id: 'SYN-4819', product: 'Swisher Sweets Grape (2pk)', desiredQuantity: 5, attempts: 3, error: 'Connection refused', updatedAt: hoursAgo(0.3) },
]

export const mockVendors: Vendor[] = [
  { id: 'VEN-01', name: 'McLane Company', contactName: 'Distribution', email: 'orders@mclane.com', phone: '(254) 771-7500', rep: 'Mike Patterson', status: 'active', productCount: 6, activePurchaseOrders: 1, lastOrderAt: daysAgo(5), totalSpend: 24800 },
  { id: 'VEN-02', name: 'Vapor Beast', contactName: 'Vape Wholesale', email: 'wholesale@vaporbeast.com', phone: '(602) 900-8000', rep: 'Jamie Chen', status: 'active', productCount: 2, activePurchaseOrders: 1, lastOrderAt: daysAgo(3), totalSpend: 11250 },
  { id: 'VEN-03', name: 'World Wide Wholesale', contactName: 'Smoke Shop Supply', email: 'sales@wwwholesale.com', phone: '(718) 555-0142', rep: 'Priya Nair', status: 'active', productCount: 3, activePurchaseOrders: 0, lastOrderAt: daysAgo(7), totalSpend: 8420 },
  { id: 'VEN-04', name: 'Standard Wholesale', contactName: 'Paper & Accessories', email: 'orders@standardws.com', phone: '(305) 555-8891', rep: 'Devon Brooks', status: 'active', productCount: 5, activePurchaseOrders: 0, lastOrderAt: daysAgo(10), totalSpend: 6180 },
  { id: 'VEN-05', name: 'Coastal Wholesale', contactName: 'CBD & Kratom', email: 'hello@coastalws.com', phone: '(941) 555-2210', rep: 'Elena Ruiz', status: 'active', productCount: 2, activePurchaseOrders: 0, lastOrderAt: daysAgo(12), totalSpend: 3110 },
]

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'PO-1084', number: 'PO-1084', vendorId: 'VEN-02', vendorName: 'Vapor Beast', status: 'sent', expectedDate: daysAgo(-1), notes: 'Expedited shipping requested', lineCount: 8, unitsOrdered: 84, unitsReceived: 0, totalCost: 412.5, createdAt: daysAgo(3) },
  { id: 'PO-1083', number: 'PO-1083', vendorId: 'VEN-01', vendorName: 'McLane Company', status: 'partial', expectedDate: daysAgo(0), notes: '', lineCount: 22, unitsOrdered: 240, unitsReceived: 120, totalCost: 1840, createdAt: daysAgo(5) },
  { id: 'PO-1082', number: 'PO-1082', vendorId: 'VEN-03', vendorName: 'World Wide Wholesale', status: 'received', expectedDate: daysAgo(2), notes: '', lineCount: 14, unitsOrdered: 96, unitsReceived: 96, totalCost: 728.4, createdAt: daysAgo(7) },
  { id: 'PO-1081', number: 'PO-1081', vendorId: 'VEN-04', vendorName: 'Standard Wholesale', status: 'received', expectedDate: daysAgo(5), notes: '', lineCount: 10, unitsOrdered: 60, unitsReceived: 60, totalCost: 198.5, createdAt: daysAgo(10) },
  { id: 'PO-1080', number: 'PO-1080', vendorId: 'VEN-05', vendorName: 'Coastal Wholesale', status: 'received', expectedDate: daysAgo(7), notes: '', lineCount: 5, unitsOrdered: 30, unitsReceived: 30, totalCost: 310, createdAt: daysAgo(12) },
  { id: 'PO-1079', number: 'PO-1079', vendorId: 'VEN-02', vendorName: 'Vapor Beast', status: 'received', expectedDate: daysAgo(10), notes: '', lineCount: 12, unitsOrdered: 72, unitsReceived: 72, totalCost: 624, createdAt: daysAgo(15) },
  { id: 'PO-1078', number: 'PO-1078', vendorId: 'VEN-01', vendorName: 'McLane Company', status: 'received', expectedDate: daysAgo(13), notes: '', lineCount: 18, unitsOrdered: 180, unitsReceived: 180, totalCost: 1560.2, createdAt: daysAgo(18) },
  { id: 'PO-1077', number: 'PO-1077', vendorId: 'VEN-04', vendorName: 'Standard Wholesale', status: 'cancelled', expectedDate: daysAgo(17), notes: 'Vendor out of stock', lineCount: 7, unitsOrdered: 42, unitsReceived: 0, totalCost: 142.8, createdAt: daysAgo(22) },
]

export const mockPurchaseOrderItems: Record<string, PurchaseOrderItem[]> = {
  default: [
    { id: 'POI-1', productId: '12001', name: 'Elf Bar BC5000 Blue Razz', sku: 'ELF-BC5000-BR', upc: '850049765432', qtyOrdered: 24, qtyReceived: 0, unitCost: 9.5, lineTotal: 228, status: 'pending' },
    { id: 'POI-2', productId: '12002', name: 'Elf Bar BC5000 Strawberry Mango', sku: 'ELF-BC5000-SM', upc: '850049765433', qtyOrdered: 24, qtyReceived: 12, unitCost: 9.5, lineTotal: 228, status: 'partial' },
    { id: 'POI-3', productId: '12003', name: 'Hyde Retro RAVE Watermelon Ice', sku: 'HYD-RETRO-WI', upc: '810046230891', qtyOrdered: 18, qtyReceived: 0, unitCost: 8.75, lineTotal: 157.5, status: 'pending' },
    { id: 'POI-4', productId: '12003b', name: 'Hyde Retro RAVE Mango Ice', sku: 'HYD-RETRO-MI', upc: '810046230892', qtyOrdered: 18, qtyReceived: 18, unitCost: 8.75, lineTotal: 157.5, status: 'received' },
  ],
}

export const mockStockCounts: StockCount[] = [
  { id: 'SC-0042', status: 'open', note: '', scopeCategory: 'Disposable Vapes', openedBy: 'Hassan M.', approvedBy: null, openedAt: hoursAgo(4), closedAt: null, approvedAt: null, totalItems: 24, counted: 18, discrepancies: 2 },
  { id: 'SC-0041', status: 'pending_approval', note: '', scopeCategory: 'Cigars', openedBy: 'Marcus T.', approvedBy: null, openedAt: daysAgo(1), closedAt: daysAgo(1), approvedAt: null, totalItems: 38, counted: 38, discrepancies: 3 },
  { id: 'SC-0040', status: 'closed', note: '', scopeCategory: 'Rolling Papers', openedBy: 'Aisha R.', approvedBy: 'Hassan M.', openedAt: daysAgo(3), closedAt: daysAgo(3), approvedAt: daysAgo(3), totalItems: 22, counted: 22, discrepancies: 0 },
  { id: 'SC-0039', status: 'closed', note: '', scopeCategory: 'Accessories', openedBy: 'Hassan M.', approvedBy: 'Hassan M.', openedAt: daysAgo(6), closedAt: daysAgo(6), approvedAt: daysAgo(6), totalItems: 31, counted: 31, discrepancies: 5 },
  { id: 'SC-0038', status: 'closed', note: '', scopeCategory: 'Lighters', openedBy: 'Marcus T.', approvedBy: 'Hassan M.', openedAt: daysAgo(9), closedAt: daysAgo(9), approvedAt: daysAgo(9), totalItems: 15, counted: 15, discrepancies: 1 },
]

export const mockStockCountItems: StockCountItem[] = [
  { id: 'SCI-1', productId: '12001', name: 'Elf Bar BC5000 Blue Razz', sku: 'ELF-BC5000-BR', upc: '850049765432', expected: 4, counted: 4, variance: 0 },
  { id: 'SCI-2', productId: '12002', name: 'Elf Bar BC5000 Strawberry Mango', sku: 'ELF-BC5000-SM', upc: '850049765433', expected: 18, counted: 16, variance: -2 },
  { id: 'SCI-3', productId: '12003', name: 'Hyde Retro RAVE Watermelon Ice', sku: 'HYD-RETRO-WI', upc: '810046230891', expected: 7, counted: 7, variance: 0 },
  { id: 'SCI-4', productId: '12003b', name: 'Hyde Retro RAVE Mango Ice', sku: 'HYD-RETRO-MI', upc: '810046230892', expected: 12, counted: 14, variance: 2 },
  { id: 'SCI-5', productId: '12019', name: 'Hyde Rebel Pro 5000 Puffs', sku: 'HYD-REBEL-5K', upc: '810046230893', expected: 24, counted: null, variance: null },
  { id: 'SCI-6', productId: '12020', name: 'Lost Mary MO5000 Watermelon', sku: 'LM-MO5000-WM', upc: '810046230894', expected: 9, counted: null, variance: null },
  { id: 'SCI-7', productId: '12021', name: 'Geek Bar Pulse Blue Razz Ice', sku: 'GB-PULSE-BRI', upc: '810046230895', expected: 6, counted: null, variance: null },
]

export const mockEmployees: Employee[] = [
  { id: 'EMP-01', name: 'Hassan Malik', email: 'hassan@smokeshop.test', role: 'owner', status: 'active', lastLoginAt: hoursAgo(1) },
  { id: 'EMP-02', name: 'Marcus Thompson', email: 'marcus@smokeshop.test', role: 'manager', status: 'active', lastLoginAt: hoursAgo(5) },
  { id: 'EMP-03', name: 'Aisha Rahman', email: 'aisha@smokeshop.test', role: 'employee', status: 'active', lastLoginAt: hoursAgo(26) },
  { id: 'EMP-04', name: 'Danny Ortiz', email: 'danny@smokeshop.test', role: 'employee', status: 'active', lastLoginAt: daysAgo(3) },
  { id: 'EMP-05', name: 'Tara Singh', email: 'tara@smokeshop.test', role: 'employee', status: 'disabled', lastLoginAt: daysAgo(40) },
]

export const mockMovementSeries: MovementSeriesPoint[] = [
  { label: 'Mon', received: 120, removed: 86 },
  { label: 'Tue', received: 96, removed: 104 },
  { label: 'Wed', received: 148, removed: 92 },
  { label: 'Thu', received: 72, removed: 118 },
  { label: 'Fri', received: 210, removed: 164 },
  { label: 'Sat', received: 164, removed: 198 },
  { label: 'Sun', received: 88, removed: 132 },
]

export const mockTopMovers: TopMover[] = [
  { id: '12001', name: 'Elf Bar BC5000 Blue Razz', sku: 'ELF-BC5000-BR', unitsSold: 312, unitsReceived: 340, revenue: 6236.88, margin: 3276 },
  { id: '12002', name: 'Elf Bar BC5000 Strawberry Mango', sku: 'ELF-BC5000-SM', unitsSold: 268, unitsReceived: 280, revenue: 5357.32, margin: 2814 },
  { id: '12005', name: 'Swisher Sweets Grape (2pk)', sku: 'SWI-GRP-2PK', unitsSold: 254, unitsReceived: 288, revenue: 759.46, margin: 403.86 },
  { id: '12007', name: 'RAW Classic King Size Rolling Papers', sku: 'RAW-CLS-KS', unitsSold: 196, unitsReceived: 240, revenue: 488.04, margin: 272.44 },
  { id: '12009', name: 'Bic Classic Lighter – Assorted', sku: 'BIC-CLS-ASST', unitsSold: 184, unitsReceived: 200, revenue: 421.36, margin: 246.56 },
]

export const mockCategoryReport: CategoryReportRow[] = [
  { category: 'Disposable Vapes', products: 42, onHand: 386, unitsSold: 880, value: 3667 },
  { category: 'Cigars', products: 36, onHand: 512, unitsSold: 640, value: 1024 },
  { category: 'Rolling Papers', products: 28, onHand: 604, unitsSold: 470, value: 604 },
  { category: 'Lighters', products: 14, onHand: 288, unitsSold: 320, value: 288 },
  { category: 'Pipes & Glass', products: 22, onHand: 96, unitsSold: 74, value: 1728 },
  { category: 'Accessories', products: 31, onHand: 174, unitsSold: 112, value: 2175 },
]

export const mockAuditLog: AuditEntry[] = [
  { id: 'AU-1', action: 'inventory.receive', entityType: 'product', entityId: '12003', actor: 'Hassan M.', meta: { productName: 'Hyde Rebel Pro 5000', oldQuantity: 0, newQuantity: 24, change: 24 }, createdAt: hoursAgo(6) },
  { id: 'AU-2', action: 'inventory.sale', entityType: 'product', entityId: '12002', actor: 'Clover', meta: { productName: 'Elf Bar BC5000 Strawberry Mango', oldQuantity: 20, newQuantity: 18, change: -2 }, createdAt: hoursAgo(1) },
  { id: 'AU-3', action: 'inventory.damage', entityType: 'product', entityId: '12004', actor: 'Hassan M.', meta: { productName: 'Backwoods Honey Bourbon', oldQuantity: 9, newQuantity: 3, change: -6 }, createdAt: hoursAgo(12) },
  { id: 'AU-4', action: 'product.updated', entityType: 'product', entityId: '12014', actor: 'Marcus T.', meta: { costCents: 1100 }, createdAt: daysAgo(1) },
  { id: 'AU-5', action: 'stock_count.approved', entityType: 'stock_count', entityId: 'SC-0040', actor: 'Hassan M.', meta: { adjustments: 0 }, createdAt: daysAgo(3) },
]

export const mockRecentReceives = [
  { id: 'RCV-1', reference: 'PO-1084', vendor: 'Vapor Beast', units: 48, at: hoursAgo(6), actor: 'Hassan M.' },
  { id: 'RCV-2', reference: 'PO-1083', vendor: 'McLane Company', units: 120, at: daysAgo(1), actor: 'Marcus T.' },
  { id: 'RCV-3', reference: 'Walk-in', vendor: 'Standard Wholesale', units: 24, at: daysAgo(2), actor: 'Aisha R.' },
]
