import type {
  AuditEntry,
  Category,
  CategoryReportRow,
  DashboardSummary,
  Employee,
  ImportBatch,
  ImportRow,
  ImportUpload,
  LookupResult,
  Movement,
  MovementInput,
  MovementSeriesPoint,
  Product,
  ProductInput,
  PurchaseOrder,
  PurchaseOrderInput,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  ReceiveLine,
  Role,
  SettingsSummary,
  StockCount,
  StockCountItem,
  TopMover,
  Vendor,
  VendorInput,
  Viewer,
} from '../types'

export interface ProductQuery {
  search?: string
  category?: string
  status?: string
}

export interface DataSource {
  readonly mode: 'demo' | 'live'

  getViewer(): Promise<Viewer>

  getDashboard(): Promise<DashboardSummary>

  listProducts(query?: ProductQuery): Promise<Product[]>
  listCategories(): Promise<Category[]>
  lookup(code: string): Promise<LookupResult>
  createProduct(input: ProductInput): Promise<Product>
  updateProduct(productId: string, input: ProductInput): Promise<Product>

  listMovements(limit?: number): Promise<Movement[]>
  receive(input: MovementInput): Promise<void>
  adjust(input: MovementInput & { reason: string }): Promise<void>

  listVendors(): Promise<Vendor[]>
  createVendor(input: VendorInput): Promise<void>
  updateVendor(vendorId: string, input: Partial<VendorInput>): Promise<void>

  listPurchaseOrders(): Promise<PurchaseOrder[]>
  getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]>
  createPurchaseOrder(input: PurchaseOrderInput): Promise<{ id: string; number: string }>
  setPurchaseOrderStatus(purchaseOrderId: string, status: Extract<PurchaseOrderStatus, 'draft' | 'sent' | 'cancelled'>): Promise<void>
  receivePurchaseOrder(purchaseOrderId: string, lines: ReceiveLine[], note?: string): Promise<void>

  listStockCounts(): Promise<StockCount[]>
  getStockCountItems(stockCountId: string): Promise<StockCountItem[]>
  openStockCount(input: { note?: string; categoryId?: string | null }): Promise<{ id: string }>
  setStockCountQuantities(stockCountId: string, lines: Array<{ productId: string; countedQty: number }>): Promise<void>
  submitStockCount(stockCountId: string): Promise<void>
  approveStockCount(stockCountId: string): Promise<void>
  cancelStockCount(stockCountId: string): Promise<void>

  listEmployees(): Promise<Employee[]>
  inviteEmployee(input: { name: string; email: string; role: Role }): Promise<void>
  updateEmployee(employeeId: string, input: { role?: Role; status?: 'active' | 'disabled' }): Promise<void>

  getMovementSeries(): Promise<MovementSeriesPoint[]>
  getTopMovers(): Promise<TopMover[]>
  getCategoryReport(): Promise<CategoryReportRow[]>
  getAuditLog(): Promise<AuditEntry[]>

  getSettings(): Promise<SettingsSummary>
  updateSettings(input: { name?: string; timezone?: string }): Promise<void>
  /** Forces the retry or reconcile pass the cron worker would run on its own. */
  runSyncJob(job: 'retry' | 'reconcile'): Promise<void>

  uploadImport(file: { filename: string; content: string }): Promise<ImportUpload>
  applyImportMapping(batchId: string, mapping: Record<string, string>): Promise<ImportBatch>
  getImportBatch(batchId: string): Promise<{ batch: ImportBatch; rows: ImportRow[] }>
  commitImport(batchId: string): Promise<ImportBatch>
}
