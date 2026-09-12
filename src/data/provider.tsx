import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth'
import { createApiClient } from '../lib/api'
import type { SettingsSummary, Viewer } from '../types'
import { createApiSource } from './apiSource'
import { createMockSource } from './mockSource'
import type { DataSource } from './source'

const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

const DataContext = createContext<DataSource | null>(null)
const ViewerContext = createContext<QueryResult<Viewer> | null>(null)
const SettingsContext = createContext<QueryResult<SettingsSummary> | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { session, ensureAccessToken, signOut } = useAuth()
  const live = session && session.mode === 'live' ? session : null
  const sandboxUserRef = useRef<string | null>(null)
  sandboxUserRef.current = live?.sandboxUser ?? null
  const signOutRef = useRef(signOut)
  signOutRef.current = signOut
  const ensureRef = useRef(ensureAccessToken)
  ensureRef.current = ensureAccessToken

  const source = useMemo<DataSource>(() => {
    // Demo mode, or a build without an API URL, stays on the seeded data.
    if (!apiUrl || !session || session.mode !== 'live') return createMockSource()
    return createApiSource(
      createApiClient({
        baseUrl: apiUrl,
        getToken: () => ensureRef.current(),
        getSandboxUser: () => sandboxUserRef.current,
        onUnauthorized: () => signOutRef.current(),
      }),
    )
  }, [session?.mode])

  return (
    <DataContext.Provider value={source}>
      <SharedProvider>{children}</SharedProvider>
    </DataContext.Provider>
  )
}

/**
 * The viewer and the store settings are read by several screens at once, so
 * they live here: one fetch, and a save on one screen refreshes the rest.
 */
function SharedProvider({ children }: { children: React.ReactNode }) {
  const viewer = useQuery('viewer', (source) => source.getViewer())
  const settings = useQuery('settings', (source) => source.getSettings())

  return (
    <ViewerContext.Provider value={viewer}>
      <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
    </ViewerContext.Provider>
  )
}

export function useDataSource(): DataSource {
  const source = useContext(DataContext)
  if (!source) throw new Error('useDataSource must be used within DataProvider')
  return source
}

export function useViewer(): QueryResult<Viewer> {
  const viewer = useContext(ViewerContext)
  if (!viewer) throw new Error('useViewer must be used within DataProvider')
  return viewer
}

const NO_PERMISSIONS: Viewer['permissions'] = {
  canManageInventory: false,
  canApproveCounts: false,
  canEditCost: false,
  canManageEmployees: false,
  canManageSettings: false,
}

/** Denies until the viewer loads, so controls never flash as available. */
export function usePermissions(): Viewer['permissions'] {
  return useViewer().data?.permissions ?? NO_PERMISSIONS
}

export interface QueryResult<T> {
  data: T | undefined
  loading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Minimal fetch-on-mount hook. Deliberately not a cache: every page reads what
 * it needs and `refresh()` re-reads after a mutation.
 */
export function useQuery<T>(
  key: string,
  load: (source: DataSource) => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): QueryResult<T> {
  const source = useDataSource()
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    loadRef
      .current(source)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Something went wrong')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, key, nonce, ...deps])

  const refresh = useCallback(() => setNonce((value) => value + 1), [])

  return { data, loading, error, refresh }
}

export const useDashboard = () => useQuery('dashboard', (source) => source.getDashboard())

export const useProducts = (query: { search?: string; category?: string; status?: string } = {}) =>
  useQuery('products', (source) => source.listProducts(query), [query.search, query.category, query.status])

export const useCategories = () => useQuery('categories', (source) => source.listCategories())
export const useMovements = (limit = 50) => useQuery('movements', (source) => source.listMovements(limit), [limit])
export const useVendors = () => useQuery('vendors', (source) => source.listVendors())
export const usePurchaseOrders = () => useQuery('purchase-orders', (source) => source.listPurchaseOrders())
export const usePurchaseOrderItems = (purchaseOrderId: string | null) =>
  useQuery(
    'purchase-order-items',
    (source) => (purchaseOrderId ? source.getPurchaseOrderItems(purchaseOrderId) : Promise.resolve([])),
    [purchaseOrderId],
  )
export const useStockCounts = () => useQuery('stock-counts', (source) => source.listStockCounts())
export const useStockCountItems = (stockCountId: string | null) =>
  useQuery(
    'stock-count-items',
    (source) => (stockCountId ? source.getStockCountItems(stockCountId) : Promise.resolve([])),
    [stockCountId],
  )
export const useEmployees = () => useQuery('employees', (source) => source.listEmployees())
export const useMovementSeries = () => useQuery('movement-series', (source) => source.getMovementSeries())
export const useTopMovers = () => useQuery('top-movers', (source) => source.getTopMovers())
export const useCategoryReport = () => useQuery('category-report', (source) => source.getCategoryReport())
export const useAuditLog = () => useQuery('audit-log', (source) => source.getAuditLog())

export function useSettings(): QueryResult<SettingsSummary> {
  const settings = useContext(SettingsContext)
  if (!settings) throw new Error('useSettings must be used within DataProvider')
  return settings
}
