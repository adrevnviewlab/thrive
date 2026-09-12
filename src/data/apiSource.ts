import { centsToDollars, dollarsToCents, newIdempotencyKey, type ApiClient } from '../lib/api'
import type {
  AuditEntry,
  CategoryReportRow,
  DashboardSummary,
  Employee,
  ImportBatch,
  ImportRow,
  ImportUpload,
  LookupResult,
  Movement,
  MovementSeriesPoint,
  Product,
  ProductInput,
  PurchaseOrder,
  PurchaseOrderItem,
  Role,
  SettingsSummary,
  StockCount,
  StockCountItem,
  StockStatus,
  SyncStatus,
  TopMover,
  Vendor,
  Viewer,
} from '../types'
import type { DataSource, ProductQuery } from './source'

interface ProductDto {
  id: string
  name: string
  sku: string | null
  upc: string | null
  brand: string
  category: string | null
  vendor: string | null
  vendorId: string | null
  costCents: number
  priceCents: number
  minStock: number
  quantity: number
  stockStatus: StockStatus
  syncStatus: SyncStatus
  ageRestricted: boolean
  cloverItemId: string | null
}

interface MovementRow {
  id: string
  product_id?: string
  product_name?: string
  product?: string
  delta: number
  quantity_after?: number
  reason: string
  note: string | null
  actor_label: string | null
  created_at: string
}

const statusToParam: Record<string, string> = {
  'In Stock': 'in-stock',
  'Low Stock': 'low',
  Critical: 'critical',
  'Out of Stock': 'out',
}

const toProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  name: dto.name,
  sku: dto.sku ?? '',
  upc: dto.upc ?? '',
  category: dto.category ?? 'Uncategorised',
  brand: dto.brand ?? '',
  vendor: dto.vendor ?? '',
  vendorId: dto.vendorId,
  stock: dto.quantity,
  minStock: dto.minStock,
  cost: centsToDollars(dto.costCents),
  price: centsToDollars(dto.priceCents),
  stockStatus: dto.stockStatus,
  syncStatus: dto.syncStatus,
  ageRestricted: dto.ageRestricted,
  cloverItemId: dto.cloverItemId,
})

/** Drops keys the caller left undefined so a PATCH only touches what was edited. */
const toProductBody = (input: ProductInput): Record<string, unknown> => {
  const body: Record<string, unknown> = {}
  if (input.name !== undefined) body.name = input.name
  if (input.sku !== undefined) body.sku = input.sku || null
  if (input.upc !== undefined) body.upc = input.upc || null
  if (input.brand !== undefined) body.brand = input.brand
  if (input.categoryName !== undefined) body.categoryName = input.categoryName || null
  if (input.vendorId !== undefined) body.vendorId = input.vendorId || null
  if (input.cost !== undefined) body.costCents = dollarsToCents(input.cost)
  if (input.price !== undefined) body.priceCents = dollarsToCents(input.price)
  if (input.minStock !== undefined) body.minStock = input.minStock
  if (input.reorderQty !== undefined) body.reorderQty = input.reorderQty
  if (input.ageRestricted !== undefined) body.ageRestricted = input.ageRestricted
  return body
}

const toMovement = (row: MovementRow): Movement => ({
  id: row.id,
  productId: row.product_id ?? '',
  productName: row.product_name ?? row.product ?? '',
  delta: Number(row.delta),
  quantityAfter: Number(row.quantity_after ?? 0),
  reason: row.reason,
  note: row.note ?? '',
  actor: row.actor_label ?? 'System',
  createdAt: row.created_at,
})

export function createApiSource(client: ApiClient): DataSource {
  return {
    mode: 'live',

    async getViewer(): Promise<Viewer> {
      const payload = await client.request<{
        user: { id: string; email: string; name: string; role: Role }
        merchant: { name: string }
        location: { name: string }
        permissions: Viewer['permissions']
      }>('/me')

      return {
        id: payload.user.id,
        name: payload.user.name,
        email: payload.user.email,
        role: payload.user.role,
        storeName: payload.merchant.name,
        locationName: payload.location.name,
        permissions: payload.permissions,
      }
    },

    async getDashboard(): Promise<DashboardSummary> {
      const payload = await client.request<{
        storeName: string
        kpis: Record<string, number>
        lowStockItems: Array<{ id: string; name: string; sku: string | null; quantity: number; minStock: number; vendor: string | null; status: StockStatus }>
        recentMovements: MovementRow[]
        pendingSync: Array<{ id: string; product: string; desired_quantity: number; attempts: number; last_error: string | null; updated_at: string }>
      }>('/dashboard/summary')

      return {
        storeName: payload.storeName,
        kpis: {
          totalProducts: payload.kpis.totalProducts ?? 0,
          addedThisWeek: payload.kpis.addedThisWeek ?? 0,
          lowStock: payload.kpis.lowStock ?? 0,
          criticalStock: payload.kpis.criticalStock ?? 0,
          pendingSync: payload.kpis.pendingSync ?? 0,
          failedSync: payload.kpis.failedSync ?? 0,
          inventoryValue: centsToDollars(payload.kpis.inventoryValueCents),
          transactionsToday: payload.kpis.transactionsToday ?? 0,
          transactionsYesterday: payload.kpis.transactionsYesterday ?? 0,
        },
        lowStockItems: payload.lowStockItems.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku ?? '',
          quantity: item.quantity,
          minStock: item.minStock,
          vendor: item.vendor ?? '',
          status: item.status,
        })),
        recentMovements: payload.recentMovements.map(toMovement),
        pendingSync: payload.pendingSync.map((item) => ({
          id: item.id,
          product: item.product,
          desiredQuantity: Number(item.desired_quantity),
          attempts: Number(item.attempts),
          error: item.last_error,
          updatedAt: item.updated_at,
        })),
      }
    },

    async listProducts(query: ProductQuery = {}) {
      const payload = await client.request<{ products: ProductDto[] }>('/products', {
        query: {
          search: query.search,
          stock: query.status && query.status !== 'All' ? (statusToParam[query.status] ?? query.status) : undefined,
          limit: 200,
        },
      })
      const products = payload.products.map(toProduct)
      // Category filter stays client side: the API keys categories by id and the
      // picker only knows names.
      if (query.category && query.category !== 'All Categories') {
        return products.filter((product) => product.category === query.category)
      }
      return products
    },

    async listCategories() {
      const payload = await client.request<{ categories: Array<{ id: string; name: string; product_count: number }> }>(
        '/categories',
      )
      return payload.categories.map((category) => ({
        id: category.id,
        name: category.name,
        productCount: Number(category.product_count ?? 0),
      }))
    },

    async createProduct(input) {
      const payload = await client.request<{ product: ProductDto }>('/products', {
        method: 'POST',
        body: toProductBody(input),
      })
      return toProduct(payload.product)
    },

    async updateProduct(productId, input) {
      const payload = await client.request<{ product: ProductDto }>(`/products/${productId}`, {
        method: 'PATCH',
        body: toProductBody(input),
      })
      return toProduct(payload.product)
    },

    async lookup(code: string): Promise<LookupResult> {
      try {
        const payload = await client.request<{ found: boolean; code: string; matchedOn: 'upc' | 'sku' | 'name'; product: ProductDto }>(
          '/lookup',
          { query: { code } },
        )
        return { found: true, code: payload.code, matchedOn: payload.matchedOn, product: toProduct(payload.product) }
      } catch (error) {
        if (error instanceof Error && 'status' in error && (error as { status: number }).status === 404) {
          return { found: false, code }
        }
        throw error
      }
    },

    async listMovements(limit = 50) {
      const payload = await client.request<{ movements: MovementRow[] }>('/inventory/movements', { query: { limit } })
      return payload.movements.map(toMovement)
    },

    async receive(input) {
      await client.request('/inventory/receive', {
        method: 'POST',
        idempotencyKey: newIdempotencyKey('receive'),
        body: {
          lines: [{ productId: input.productId, quantity: Math.abs(input.quantity) }],
          note: input.note ?? '',
        },
      })
    },

    async adjust(input) {
      await client.request('/inventory/adjust', {
        method: 'POST',
        idempotencyKey: newIdempotencyKey('adjust'),
        body: {
          productId: input.productId,
          delta: input.quantity,
          reason: input.reason,
          note: input.note ?? '',
        },
      })
    },

    async listVendors(): Promise<Vendor[]> {
      const payload = await client.request<{
        vendors: Array<{
          id: string
          name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          rep: string | null
          status: 'active' | 'inactive'
          active_pos: number
          last_order_at: string | null
          total_spend_cents: number
          product_count: number
        }>
      }>('/vendors')

      return payload.vendors.map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        contactName: vendor.contact_name ?? '',
        email: vendor.email ?? '',
        phone: vendor.phone ?? '',
        rep: vendor.rep ?? '',
        status: vendor.status,
        productCount: Number(vendor.product_count),
        activePurchaseOrders: Number(vendor.active_pos),
        lastOrderAt: vendor.last_order_at,
        totalSpend: centsToDollars(Number(vendor.total_spend_cents)),
      }))
    },

    async createVendor(input) {
      await client.request('/vendors', { method: 'POST', body: input })
    },

    async updateVendor(vendorId, input) {
      await client.request(`/vendors/${vendorId}`, { method: 'PATCH', body: input })
    },

    async listPurchaseOrders(): Promise<PurchaseOrder[]> {
      const payload = await client.request<{
        purchaseOrders: Array<{
          id: string
          number: string
          status: PurchaseOrder['status']
          expected_date: string | null
          notes: string | null
          created_at: string
          vendor_id: string
          vendor_name: string
          line_count: number
          units_ordered: number
          units_received: number
          total_cost_cents: number
        }>
      }>('/purchase-orders')

      return payload.purchaseOrders.map((order) => ({
        id: order.id,
        number: order.number,
        vendorId: order.vendor_id,
        vendorName: order.vendor_name,
        status: order.status,
        expectedDate: order.expected_date,
        notes: order.notes ?? '',
        lineCount: Number(order.line_count),
        unitsOrdered: Number(order.units_ordered),
        unitsReceived: Number(order.units_received),
        totalCost: centsToDollars(Number(order.total_cost_cents)),
        createdAt: order.created_at,
      }))
    },

    async getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
      const payload = await client.request<{
        items: Array<{
          id: string
          product_id: string
          name: string
          sku: string | null
          upc: string | null
          qty_ordered: number
          qty_received: number
          unit_cost_cents: number
          line_total_cents: number
          status: PurchaseOrderItem['status']
        }>
      }>(`/purchase-orders/${purchaseOrderId}`)

      return payload.items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        sku: item.sku ?? '',
        upc: item.upc ?? '',
        qtyOrdered: Number(item.qty_ordered),
        qtyReceived: Number(item.qty_received),
        unitCost: centsToDollars(Number(item.unit_cost_cents)),
        lineTotal: centsToDollars(Number(item.line_total_cents)),
        status: item.status,
      }))
    },

    async createPurchaseOrder(input) {
      const payload = await client.request<{ purchaseOrder: { id: string; number: string } }>('/purchase-orders', {
        method: 'POST',
        body: {
          vendorId: input.vendorId,
          expectedDate: input.expectedDate ?? undefined,
          notes: input.notes ?? '',
          lines: input.lines.map((line) => ({
            productId: line.productId,
            qtyOrdered: line.qtyOrdered,
            unitCostCents: line.unitCost === undefined ? undefined : dollarsToCents(line.unitCost),
          })),
        },
      })
      return payload.purchaseOrder
    },

    async setPurchaseOrderStatus(purchaseOrderId, status) {
      await client.request(`/purchase-orders/${purchaseOrderId}`, { method: 'PATCH', body: { status } })
    },

    async receivePurchaseOrder(purchaseOrderId, lines, note) {
      await client.request(`/purchase-orders/${purchaseOrderId}/receive`, {
        method: 'POST',
        idempotencyKey: newIdempotencyKey('po-receive'),
        body: { lines, note: note ?? '' },
      })
    },

    async listStockCounts(): Promise<StockCount[]> {
      const payload = await client.request<{
        counts: Array<{
          id: string
          status: StockCount['status']
          note: string | null
          scope_category: string | null
          opened_by: string | null
          approved_by: string | null
          opened_at: string
          closed_at: string | null
          approved_at: string | null
          total_items: number
          counted: number
          discrepancies: number
        }>
      }>('/stock-counts')

      return payload.counts.map((count) => ({
        id: count.id,
        status: count.status,
        note: count.note ?? '',
        scopeCategory: count.scope_category,
        openedBy: count.opened_by ?? '',
        approvedBy: count.approved_by,
        openedAt: count.opened_at,
        closedAt: count.closed_at,
        approvedAt: count.approved_at,
        totalItems: Number(count.total_items),
        counted: Number(count.counted),
        discrepancies: Number(count.discrepancies),
      }))
    },

    async getStockCountItems(stockCountId: string): Promise<StockCountItem[]> {
      const payload = await client.request<{
        items: Array<{
          id: string
          product_id: string
          name: string
          sku: string | null
          upc: string | null
          system_qty_open: number
          counted_qty: number | null
          variance: number | null
        }>
      }>(`/stock-counts/${stockCountId}`)

      return payload.items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        sku: item.sku ?? '',
        upc: item.upc ?? '',
        expected: Number(item.system_qty_open),
        counted: item.counted_qty === null ? null : Number(item.counted_qty),
        variance: item.variance === null ? null : Number(item.variance),
      }))
    },

    async openStockCount(input) {
      const payload = await client.request<{ stockCount: { id: string } }>('/stock-counts', {
        method: 'POST',
        body: { note: input.note ?? '', categoryId: input.categoryId ?? null },
      })
      return payload.stockCount
    },

    async setStockCountQuantities(stockCountId, lines) {
      await client.request(`/stock-counts/${stockCountId}/lines`, { method: 'POST', body: { lines } })
    },

    async submitStockCount(stockCountId) {
      await client.request(`/stock-counts/${stockCountId}/submit`, { method: 'POST', body: {} })
    },

    async approveStockCount(stockCountId) {
      await client.request(`/stock-counts/${stockCountId}/approve`, { method: 'POST', body: {} })
    },

    async cancelStockCount(stockCountId) {
      await client.request(`/stock-counts/${stockCountId}/cancel`, { method: 'POST', body: {} })
    },

    async listEmployees(): Promise<Employee[]> {
      const payload = await client.request<{
        employees: Array<{
          id: string
          email: string
          full_name: string
          role: Role
          status: 'active' | 'disabled'
          last_login_at: string | null
        }>
      }>('/employees')

      return payload.employees.map((employee) => ({
        id: employee.id,
        name: employee.full_name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        lastLoginAt: employee.last_login_at,
      }))
    },

    async inviteEmployee(input) {
      await client.request('/employees', {
        method: 'POST',
        body: { email: input.email, fullName: input.name, role: input.role },
      })
    },

    async updateEmployee(employeeId, input) {
      await client.request(`/employees/${employeeId}`, { method: 'PATCH', body: input })
    },

    async getMovementSeries(): Promise<MovementSeriesPoint[]> {
      const payload = await client.request<{ series: Array<{ label: string; received: number; removed: number }> }>(
        '/reports/movements',
        { query: { days: 7 } },
      )
      return payload.series.map((point) => ({
        label: point.label.trim(),
        received: Number(point.received),
        removed: Number(point.removed),
      }))
    },

    async getTopMovers(): Promise<TopMover[]> {
      const payload = await client.request<{
        products: Array<{
          id: string
          name: string
          sku: string | null
          units_sold: number
          units_received: number
          revenue_cents: number
          margin_cents: number
        }>
      }>('/reports/top-movers', { query: { days: 30 } })

      return payload.products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku ?? '',
        unitsSold: Number(product.units_sold),
        unitsReceived: Number(product.units_received),
        revenue: centsToDollars(Number(product.revenue_cents)),
        margin: centsToDollars(Number(product.margin_cents)),
      }))
    },

    async getCategoryReport(): Promise<CategoryReportRow[]> {
      const payload = await client.request<{
        categories: Array<{ category: string; products: number; on_hand: number; units_sold: number; value_cents: number }>
      }>('/reports/categories', { query: { days: 30 } })

      return payload.categories.map((row) => ({
        category: row.category,
        products: Number(row.products),
        onHand: Number(row.on_hand),
        unitsSold: Number(row.units_sold),
        value: centsToDollars(Number(row.value_cents)),
      }))
    },

    async getAuditLog(): Promise<AuditEntry[]> {
      const payload = await client.request<{
        entries: Array<{
          id: string
          action: string
          entity_type: string
          entity_id: string | null
          actor_label: string | null
          meta: Record<string, unknown> | string
          created_at: string
        }>
      }>('/audit-logs', { query: { limit: 50 } })

      return payload.entries.map((entry) => ({
        id: entry.id,
        action: entry.action,
        entityType: entry.entity_type,
        entityId: entry.entity_id,
        actor: entry.actor_label ?? 'System',
        meta: typeof entry.meta === 'string' ? (JSON.parse(entry.meta) as Record<string, unknown>) : entry.meta,
        createdAt: entry.created_at,
      }))
    },

    async getSettings() {
      return client.request<SettingsSummary>('/settings')
    },

    async updateSettings(input) {
      await client.request('/settings', { method: 'PATCH', body: input })
    },

    async runSyncJob(job) {
      await client.request(`/sync/${job}`, { method: 'POST' })
    },

    async uploadImport(file): Promise<ImportUpload> {
      const payload = await client.request<{
        batch: { id: string; rowCount: number; headers: string[] }
        suggestedMapping: Record<string, string>
        canonicalFields: string[]
        preview: Array<Record<string, string>>
      }>('/imports', {
        method: 'POST',
        body: { filename: file.filename, content: file.content, source: 'thrive' },
      })

      return {
        batchId: payload.batch.id,
        headers: payload.batch.headers,
        rowCount: payload.batch.rowCount,
        suggestedMapping: payload.suggestedMapping,
        canonicalFields: payload.canonicalFields,
        preview: payload.preview,
      }
    },

    async applyImportMapping(batchId, mapping) {
      await client.request(`/imports/${batchId}/mapping`, { method: 'POST', body: { mapping } })
      const { batch } = await this.getImportBatch(batchId)
      return batch
    },

    async getImportBatch(batchId): Promise<{ batch: ImportBatch; rows: ImportRow[] }> {
      const payload = await client.request<{
        batch: {
          id: string
          filename: string
          source: string
          status: ImportBatch['status']
          row_count: number
          created_at: string
          committed_at: string | null
        }
        rows: Array<{
          id: string
          row_number: number
          raw: Record<string, string> | string
          mapped: Record<string, unknown> | string | null
          match_status: ImportRow['matchStatus']
          match_product_id: string | null
          match_product_name: string | null
          match_reason: string | null
          error: string | null
        }>
      }>(`/imports/${batchId}`, { query: { limit: 500 } })

      const rows: ImportRow[] = payload.rows.map((row) => {
        const mapped = typeof row.mapped === 'string' ? (JSON.parse(row.mapped) as Record<string, unknown>) : row.mapped
        return {
          id: row.id,
          rowNumber: row.row_number,
          raw: typeof row.raw === 'string' ? (JSON.parse(row.raw) as Record<string, string>) : row.raw,
          mapped: mapped
            ? {
                name: String(mapped.name ?? ''),
                sku: (mapped.sku as string | null) ?? null,
                upc: (mapped.upc as string | null) ?? null,
                quantity: (mapped.quantity as number | null) ?? null,
                costCents: (mapped.costCents as number | null) ?? null,
                priceCents: (mapped.priceCents as number | null) ?? null,
                category: (mapped.category as string | null) ?? null,
                vendor: (mapped.vendor as string | null) ?? null,
              }
            : null,
          matchStatus: row.match_status,
          matchProductId: row.match_product_id,
          matchProductName: row.match_product_name,
          matchReason: row.match_reason ?? '',
          error: row.error,
        }
      })

      const tally = (status: ImportRow['matchStatus']) => rows.filter((row) => row.matchStatus === status).length

      return {
        batch: {
          id: payload.batch.id,
          filename: payload.batch.filename,
          source: payload.batch.source,
          status: payload.batch.status,
          rowCount: Number(payload.batch.row_count),
          matched: tally('matched'),
          possible: tally('possible'),
          unmatched: tally('unmatched'),
          duplicate: tally('duplicate'),
          committed: tally('committed'),
          createdAt: payload.batch.created_at,
          committedAt: payload.batch.committed_at,
        },
        rows,
      }
    },

    async commitImport(batchId) {
      await client.request(`/imports/${batchId}/commit`, { method: 'POST', body: { pushToClover: false } })
      const { batch } = await this.getImportBatch(batchId)
      return batch
    },
  }
}

export { dollarsToCents }
