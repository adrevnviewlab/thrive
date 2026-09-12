import type {
  Category,
  DashboardSummary,
  ImportBatch,
  ImportRow,
  ImportUpload,
  LookupResult,
  Movement,
  Product,
  ProductInput,
  PurchaseOrder,
  PurchaseOrderItem,
  StockCount,
  StockCountItem,
  Vendor,
} from '../types'
import {
  mockAuditLog,
  mockCategoryReport,
  mockEmployees,
  mockMovementSeries,
  mockMovements,
  mockPendingSync,
  mockPurchaseOrderItems,
  mockPurchaseOrders,
  mockStockCountItems,
  mockStockCounts,
  mockTopMovers,
  mockVendors,
} from './mock/operations'
import { mockCategories, mockProducts } from './mock/products'
import type { DataSource, ProductQuery } from './source'

/** Demo mode keeps its own copy so edits in the UI feel real for the session. */
function createStore() {
  return {
    products: mockProducts.map((product) => ({ ...product })),
    movements: mockMovements.map((movement) => ({ ...movement })),
    vendors: mockVendors.map((vendor) => ({ ...vendor })),
    purchaseOrders: mockPurchaseOrders.map((order) => ({ ...order })),
    purchaseOrderItems: new Map<string, PurchaseOrderItem[]>(
      mockPurchaseOrders.map((order) => [
        order.id,
        (mockPurchaseOrderItems.default ?? []).map((item) => ({ ...item })),
      ]),
    ),
    stockCounts: mockStockCounts.map((count) => ({ ...count })),
    stockCountItems: new Map<string, StockCountItem[]>(
      mockStockCounts.map((count) => [count.id, mockStockCountItems.map((item) => ({ ...item }))]),
    ),
    employees: mockEmployees.map((employee) => ({ ...employee })),
    merchant: { name: 'Smoke Shop Downtown', timezone: 'America/New_York' },
    lastReconciledAt: new Date(Date.now() - 3_600_000).toISOString(),
  }
}

const statusFor = (product: Product): Product['stockStatus'] => {
  if (product.stock <= 0) return 'out'
  if (product.minStock <= 0) return 'in-stock'
  if (product.stock <= Math.floor(product.minStock / 2)) return 'critical'
  if (product.stock < product.minStock) return 'low'
  return 'in-stock'
}

function buildProduct(input: ProductInput, id: string): Product {
  const product: Product = {
    id,
    name: input.name,
    sku: input.sku ?? '',
    upc: input.upc ?? '',
    category: input.categoryName ?? 'Uncategorised',
    brand: input.brand ?? '',
    vendor: '',
    vendorId: input.vendorId ?? null,
    stock: 0,
    minStock: input.minStock ?? 0,
    cost: input.cost ?? 0,
    price: input.price ?? 0,
    stockStatus: 'out',
    syncStatus: 'pending',
    ageRestricted: input.ageRestricted ?? false,
    cloverItemId: null,
  }
  product.stockStatus = statusFor(product)
  return product
}

const statusLabelToKey: Record<string, Product['stockStatus']> = {
  'In Stock': 'in-stock',
  'Low Stock': 'low',
  Critical: 'critical',
  'Out of Stock': 'out',
}

export function createMockSource(): DataSource {
  const store = createStore()
  const delay = () => new Promise((resolve) => setTimeout(resolve, 60))

  const applyDelta = (productId: string, delta: number, reason: string, note: string) => {
    const product = store.products.find((candidate) => candidate.id === productId)
    if (!product) return
    product.stock = Math.max(0, product.stock + delta)
    product.stockStatus = statusFor(product)
    const movement: Movement = {
      id: `MV-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      delta,
      quantityAfter: product.stock,
      reason,
      note,
      actor: 'Demo User',
      createdAt: new Date().toISOString(),
    }
    store.movements.unshift(movement)
  }

  return {
    mode: 'demo',

    async getViewer() {
      await delay()
      return {
        id: 'demo-owner',
        name: 'Demo Owner',
        email: 'owner@demo.stackr',
        role: 'owner' as const,
        storeName: store.merchant.name,
        locationName: 'Main Store',
        permissions: {
          canManageInventory: true,
          canApproveCounts: true,
          canEditCost: true,
          canManageEmployees: true,
          canManageSettings: true,
        },
      }
    },

    async getDashboard(): Promise<DashboardSummary> {
      await delay()
      const lowStock = store.products.filter((product) => product.stockStatus === 'low' || product.stockStatus === 'critical')
      const inventoryValue = store.products.reduce((total, product) => total + product.stock * product.cost, 0)
      return {
        storeName: 'Smoke Shop Downtown',
        kpis: {
          totalProducts: store.products.length,
          addedThisWeek: 12,
          lowStock: lowStock.length,
          criticalStock: store.products.filter((product) => product.stockStatus === 'critical').length,
          pendingSync: mockPendingSync.length,
          failedSync: mockPendingSync.filter((item) => item.attempts >= 3).length,
          inventoryValue,
          transactionsToday: 147,
          transactionsYesterday: 132,
        },
        lowStockItems: lowStock.slice(0, 6).map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          quantity: product.stock,
          minStock: product.minStock,
          vendor: product.vendor,
          status: product.stockStatus,
        })),
        recentMovements: store.movements.slice(0, 8),
        pendingSync: mockPendingSync,
      }
    },

    async listProducts(query: ProductQuery = {}) {
      await delay()
      const search = query.search?.trim().toLowerCase() ?? ''
      return store.products.filter((product) => {
        if (search && !`${product.name} ${product.sku} ${product.upc}`.toLowerCase().includes(search)) return false
        if (query.category && query.category !== 'All Categories' && product.category !== query.category) return false
        if (query.status && query.status !== 'All') {
          const wanted = statusLabelToKey[query.status] ?? query.status
          if (product.stockStatus !== wanted) return false
        }
        return true
      })
    },

    async listCategories(): Promise<Category[]> {
      await delay()
      const names = new Set([...mockCategories, ...store.products.map((product) => product.category)])
      return [...names].sort().map((name) => ({
        id: `CAT-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name,
        productCount: store.products.filter((product) => product.category === name).length,
      }))
    },

    async createProduct(input: ProductInput): Promise<Product> {
      await delay()
      const product = buildProduct(input, `NEW-${store.products.length + 1}`)
      store.products.unshift(product)
      return product
    },

    async updateProduct(productId, input): Promise<Product> {
      await delay()
      const product = store.products.find((candidate) => candidate.id === productId)
      if (!product) throw new Error('Product not found')
      Object.assign(product, {
        name: input.name ?? product.name,
        sku: input.sku ?? product.sku,
        upc: input.upc ?? product.upc,
        brand: input.brand ?? product.brand,
        category: input.categoryName ?? product.category,
        vendorId: input.vendorId === undefined ? product.vendorId : input.vendorId,
        vendor: input.vendorId ? (store.vendors.find((v) => v.id === input.vendorId)?.name ?? product.vendor) : product.vendor,
        cost: input.cost ?? product.cost,
        price: input.price ?? product.price,
        minStock: input.minStock ?? product.minStock,
        ageRestricted: input.ageRestricted ?? product.ageRestricted,
      })
      product.stockStatus = statusFor(product)
      return product
    },

    async lookup(code: string): Promise<LookupResult> {
      await delay()
      const needle = code.trim().toLowerCase()
      const product = store.products.find(
        (candidate) =>
          candidate.upc.toLowerCase() === needle ||
          candidate.sku.toLowerCase() === needle ||
          candidate.name.toLowerCase().includes(needle),
      )
      if (!product) return { found: false, code }
      const matchedOn = product.upc.toLowerCase() === needle ? 'upc' : product.sku.toLowerCase() === needle ? 'sku' : 'name'
      return { found: true, code, matchedOn, product }
    },

    async listMovements(limit = 50) {
      await delay()
      return store.movements.slice(0, limit)
    },

    async receive(input) {
      await delay()
      applyDelta(input.productId, Math.abs(input.quantity), 'receive', input.note ?? 'Received (demo)')
    },

    async adjust(input) {
      await delay()
      applyDelta(input.productId, input.quantity, input.reason, input.note ?? 'Adjustment (demo)')
    },

    async listVendors(): Promise<Vendor[]> {
      await delay()
      return store.vendors
    },

    async createVendor(input) {
      await delay()
      store.vendors.push({
        id: `VEN-${store.vendors.length + 1}`,
        name: input.name,
        contactName: input.contactName ?? '',
        email: input.email ?? '',
        phone: input.phone ?? '',
        rep: input.rep ?? '',
        status: input.status ?? 'active',
        productCount: 0,
        activePurchaseOrders: 0,
        lastOrderAt: null,
        totalSpend: 0,
      })
    },

    async updateVendor(vendorId, input) {
      await delay()
      const vendor = store.vendors.find((candidate) => candidate.id === vendorId)
      if (vendor) Object.assign(vendor, input)
    },

    async listPurchaseOrders(): Promise<PurchaseOrder[]> {
      await delay()
      return store.purchaseOrders
    },

    async getPurchaseOrderItems(purchaseOrderId) {
      await delay()
      return store.purchaseOrderItems.get(purchaseOrderId) ?? []
    },

    async createPurchaseOrder(input) {
      await delay()
      const next = Math.max(...store.purchaseOrders.map((order) => Number(order.number.replace(/\D/g, '')) || 0)) + 1
      const number = `PO-${next}`
      const vendor = store.vendors.find((candidate) => candidate.id === input.vendorId)

      const items: PurchaseOrderItem[] = input.lines.map((line, index) => {
        const product = store.products.find((candidate) => candidate.id === line.productId)
        const unitCost = line.unitCost ?? product?.cost ?? 0
        return {
          id: `POI-${number}-${index}`,
          productId: line.productId,
          name: product?.name ?? 'Unknown product',
          sku: product?.sku ?? '',
          upc: product?.upc ?? '',
          qtyOrdered: line.qtyOrdered,
          qtyReceived: 0,
          unitCost,
          lineTotal: unitCost * line.qtyOrdered,
          status: 'pending',
        }
      })

      store.purchaseOrders.unshift({
        id: number,
        number,
        vendorId: input.vendorId,
        vendorName: vendor?.name ?? 'Unknown vendor',
        status: 'draft',
        expectedDate: input.expectedDate ?? null,
        notes: input.notes ?? '',
        lineCount: items.length,
        unitsOrdered: items.reduce((sum, item) => sum + item.qtyOrdered, 0),
        unitsReceived: 0,
        totalCost: items.reduce((sum, item) => sum + item.lineTotal, 0),
        createdAt: new Date().toISOString(),
      })
      store.purchaseOrderItems.set(number, items)

      return { id: number, number }
    },

    async setPurchaseOrderStatus(purchaseOrderId, status) {
      await delay()
      const order = store.purchaseOrders.find((candidate) => candidate.id === purchaseOrderId)
      if (order) order.status = status
    },

    async receivePurchaseOrder(purchaseOrderId, lines, note) {
      await delay()
      const order = store.purchaseOrders.find((candidate) => candidate.id === purchaseOrderId)
      const items = store.purchaseOrderItems.get(purchaseOrderId) ?? []

      for (const line of lines) {
        const item = line.productId
          ? items.find((candidate) => candidate.productId === line.productId)
          : items.find((candidate) => candidate.upc === line.code || candidate.sku === line.code)
        if (!item) throw new Error(`Nothing on this order matches ${line.code ?? line.productId}`)

        item.qtyReceived += line.quantity
        item.status = item.qtyReceived >= item.qtyOrdered ? 'received' : 'partial'
        applyDelta(item.productId, line.quantity, 'receive', note ?? `Received against ${order?.number ?? 'order'}`)
      }

      if (order) {
        order.unitsReceived = items.reduce((sum, item) => sum + item.qtyReceived, 0)
        order.status = order.unitsReceived >= order.unitsOrdered ? 'received' : 'partial'
      }
    },

    async listStockCounts(): Promise<StockCount[]> {
      await delay()
      return store.stockCounts
    },

    async getStockCountItems(stockCountId) {
      await delay()
      return store.stockCountItems.get(stockCountId) ?? []
    },

    async openStockCount(input) {
      await delay()
      if (store.stockCounts.some((count) => count.status === 'open' || count.status === 'pending_approval')) {
        throw new Error('A stock count is already in progress')
      }

      const id = `SC-${String(store.stockCounts.length + 43).padStart(4, '0')}`
      const category = input.categoryId
        ? store.products.find((product) => `CAT-${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` === input.categoryId)?.category ?? null
        : null
      const scoped = category ? store.products.filter((product) => product.category === category) : store.products

      store.stockCountItems.set(
        id,
        scoped.map((product, index) => ({
          id: `SCI-${id}-${index}`,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          upc: product.upc,
          expected: product.stock,
          counted: null,
          variance: null,
        })),
      )
      store.stockCounts.unshift({
        id,
        status: 'open',
        note: input.note ?? '',
        scopeCategory: category,
        openedBy: 'Demo User',
        approvedBy: null,
        openedAt: new Date().toISOString(),
        closedAt: null,
        approvedAt: null,
        totalItems: scoped.length,
        counted: 0,
        discrepancies: 0,
      })

      return { id }
    },

    async setStockCountQuantities(stockCountId, lines) {
      await delay()
      const items = store.stockCountItems.get(stockCountId) ?? []
      for (const line of lines) {
        const item = items.find((candidate) => candidate.productId === line.productId)
        if (!item) continue
        item.counted = line.countedQty
        item.variance = line.countedQty - item.expected
      }
      const count = store.stockCounts.find((candidate) => candidate.id === stockCountId)
      if (count) {
        count.counted = items.filter((item) => item.counted !== null).length
        count.discrepancies = items.filter((item) => item.variance !== null && item.variance !== 0).length
      }
    },

    async submitStockCount(stockCountId) {
      await delay()
      const count = store.stockCounts.find((candidate) => candidate.id === stockCountId)
      if (count) {
        count.status = 'pending_approval'
        count.closedAt = new Date().toISOString()
      }
    },

    async approveStockCount(stockCountId) {
      await delay()
      const count = store.stockCounts.find((candidate) => candidate.id === stockCountId)
      if (!count) return
      for (const item of store.stockCountItems.get(stockCountId) ?? []) {
        if (item.counted === null || item.variance === 0) continue
        applyDelta(item.productId, item.counted - item.expected, 'count', 'Stock count variance')
      }
      count.status = 'closed'
      count.approvedBy = 'Demo User'
      count.approvedAt = new Date().toISOString()
    },

    async cancelStockCount(stockCountId) {
      await delay()
      const count = store.stockCounts.find((candidate) => candidate.id === stockCountId)
      if (count) count.status = 'cancelled'
    },

    async listEmployees() {
      await delay()
      return store.employees
    },

    async inviteEmployee(input) {
      await delay()
      store.employees.push({
        id: `emp-${store.employees.length + 1}`,
        name: input.name,
        email: input.email,
        role: input.role,
        status: 'active',
        lastLoginAt: null,
      })
    },

    async updateEmployee(employeeId, input) {
      await delay()
      const employee = store.employees.find((candidate) => candidate.id === employeeId)
      if (!employee) return
      if (input.role) employee.role = input.role
      if (input.status) employee.status = input.status
    },

    async getMovementSeries() {
      await delay()
      return mockMovementSeries
    },

    async getTopMovers() {
      await delay()
      return mockTopMovers
    },

    async getCategoryReport() {
      await delay()
      return mockCategoryReport
    },

    async getAuditLog() {
      await delay()
      return mockAuditLog
    },

    async getSettings() {
      await delay()
      return {
        merchant: { ...store.merchant },
        clover: {
          mode: 'mock',
          environment: 'sandbox',
          connected: true,
          merchantId: 'DEMO-MERCHANT',
          connectedAt: new Date(Date.now() - 86_400_000 * 14).toISOString(),
          webhooksConfigured: true,
        },
        sync: {
          pending: mockPendingSync.length,
          failed: 1,
          lastSyncedAt: new Date(Date.now() - 300_000).toISOString(),
          lastReconciledAt: store.lastReconciledAt,
        },
      }
    },

    async updateSettings(input) {
      await delay()
      if (input.name !== undefined) store.merchant.name = input.name
      if (input.timezone !== undefined) store.merchant.timezone = input.timezone
    },

    async runSyncJob(job) {
      await delay()
      if (job === 'reconcile') store.lastReconciledAt = new Date().toISOString()
    },

    async uploadImport(): Promise<ImportUpload> {
      await delay()
      return {
        batchId: 'DEMO-BATCH',
        headers: ['Item Name', 'UPC', 'SKU', 'Qty On Hand', 'Cost', 'Retail', 'Department', 'Supplier'],
        rowCount: 3,
        suggestedMapping: {
          name: 'Item Name',
          upc: 'UPC',
          sku: 'SKU',
          quantity: 'Qty On Hand',
          cost: 'Cost',
          price: 'Retail',
          category: 'Department',
          vendor: 'Supplier',
        },
        canonicalFields: ['name', 'sku', 'upc', 'brand', 'category', 'vendor', 'quantity', 'cost', 'price', 'minStock', 'cloverItemId'],
        preview: [
          { 'Item Name': 'Elf Bar BC5000 Blue Razz', UPC: '850049765432', SKU: 'ELF-BC5000-BR', 'Qty On Hand': '4', Cost: '9.50', Retail: '19.99', Department: 'Disposable Vapes', Supplier: 'Vapor Beast' },
          { 'Item Name': 'Backwoods Honey Bourbon', UPC: '077176506101', SKU: 'BW-HONEY-5PK', 'Qty On Hand': '3', Cost: '6.20', Retail: '13.99', Department: 'Cigars', Supplier: 'McLane Company' },
          { 'Item Name': 'Brand New Widget', UPC: '999999999999', SKU: 'NEW-WIDGET', 'Qty On Hand': '10', Cost: '1.00', Retail: '2.99', Department: 'Accessories', Supplier: 'Standard Wholesale' },
        ],
      }
    },

    async applyImportMapping(): Promise<ImportBatch> {
      await delay()
      return demoBatch('mapped')
    },

    async getImportBatch(): Promise<{ batch: ImportBatch; rows: ImportRow[] }> {
      await delay()
      return { batch: demoBatch('mapped'), rows: demoRows() }
    },

    async commitImport(): Promise<ImportBatch> {
      await delay()
      return { ...demoBatch('committed'), committed: 3, committedAt: new Date().toISOString() }
    },
  }
}

const demoBatch = (status: ImportBatch['status']): ImportBatch => ({
  id: 'DEMO-BATCH',
  filename: 'thrive-export.csv',
  source: 'thrive',
  status,
  rowCount: 3,
  matched: 2,
  possible: 0,
  unmatched: 1,
  duplicate: 0,
  committed: 0,
  createdAt: new Date().toISOString(),
  committedAt: null,
})

const demoRows = (): ImportRow[] => [
  {
    id: 'ROW-1',
    rowNumber: 1,
    raw: {},
    mapped: { name: 'Elf Bar BC5000 Blue Razz', sku: 'ELF-BC5000-BR', upc: '850049765432', quantity: 4, costCents: 950, priceCents: 1999, category: 'Disposable Vapes', vendor: 'Vapor Beast' },
    matchStatus: 'matched',
    matchProductId: '12001',
    matchProductName: 'Elf Bar BC5000 Blue Razz',
    matchReason: 'upc',
    error: null,
  },
  {
    id: 'ROW-2',
    rowNumber: 2,
    raw: {},
    mapped: { name: 'Backwoods Honey Bourbon', sku: 'BW-HONEY-5PK', upc: '077176506101', quantity: 3, costCents: 620, priceCents: 1399, category: 'Cigars', vendor: 'McLane Company' },
    matchStatus: 'matched',
    matchProductId: '12004',
    matchProductName: 'Backwoods Honey Bourbon (5pk)',
    matchReason: 'upc',
    error: null,
  },
  {
    id: 'ROW-3',
    rowNumber: 3,
    raw: {},
    mapped: { name: 'Brand New Widget', sku: 'NEW-WIDGET', upc: '999999999999', quantity: 10, costCents: 100, priceCents: 299, category: 'Accessories', vendor: 'Standard Wholesale' },
    matchStatus: 'unmatched',
    matchProductId: null,
    matchProductName: null,
    matchReason: 'no match',
    error: null,
  },
]
