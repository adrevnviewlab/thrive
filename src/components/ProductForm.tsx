import { useState } from 'react'
import { useDataSource, usePermissions, useVendors } from '../data/provider'
import type { Product, ProductInput } from '../types'

interface ProductFormProps {
  /** Null means a new product. */
  product: Product | null
  categories: string[]
  /** Seeds the UPC when a scan found nothing and the user creates the item. */
  initialUpc?: string
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  name: string
  sku: string
  upc: string
  brand: string
  category: string
  vendorId: string
  cost: string
  price: string
  minStock: string
  reorderQty: string
  ageRestricted: boolean
}

function initialState(product: Product | null, initialUpc: string): FormState {
  return {
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    upc: product?.upc ?? initialUpc,
    brand: product?.brand ?? '',
    category: product?.category ?? '',
    vendorId: product?.vendorId ?? '',
    cost: product ? String(product.cost) : '',
    price: product ? String(product.price) : '',
    minStock: product ? String(product.minStock) : '0',
    reorderQty: '',
    ageRestricted: product?.ageRestricted ?? false,
  }
}

const money = (value: string): number | undefined => {
  const parsed = Number(value)
  return value.trim() === '' || Number.isNaN(parsed) ? undefined : parsed
}

const count = (value: string): number | undefined => {
  const parsed = Number(value)
  return value.trim() === '' || Number.isNaN(parsed) ? undefined : Math.trunc(parsed)
}

export default function ProductForm({ product, categories, initialUpc = '', onClose, onSaved }: ProductFormProps) {
  const source = useDataSource()
  const vendors = useVendors()
  const { canManageInventory, canEditCost } = usePermissions()
  const [form, setForm] = useState<FormState>(() => initialState(product, initialUpc))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canManageInventory) {
      setError('You do not have permission to edit products')
      return
    }
    setSaving(true)
    setError(null)

    const input: ProductInput = {
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      upc: form.upc.trim() || null,
      brand: form.brand.trim(),
      categoryName: form.category.trim() || null,
      vendorId: form.vendorId || null,
      cost: canEditCost ? money(form.cost) : undefined,
      price: money(form.price),
      minStock: count(form.minStock),
      reorderQty: count(form.reorderQty),
      ageRestricted: form.ageRestricted,
    }

    try {
      if (product) await source.updateProduct(product.id, input)
      else await source.createProduct(input)
      onSaved()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this product')
    } finally {
      setSaving(false)
    }
  }

  const field = 'w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted-fg/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20'
  const label = 'block text-xs font-medium text-muted-fg mb-1'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-overlay" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md h-full overflow-y-auto bg-card border-l border-border p-5 space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-medium text-fg">{product ? 'Edit product' : 'Add product'}</h2>
            <p className="text-xs text-muted-fg mt-0.5">
              {product ? 'Stock changes go through receive, adjust or count.' : 'Stock starts at zero; receive it in afterwards.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-fg hover:bg-subtle hover:text-fg"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <label className={label} htmlFor="product-name">Name</label>
          <input id="product-name" required value={form.name} onChange={(e) => set('name', e.target.value)} className={field} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="product-sku">SKU</label>
            <input id="product-sku" value={form.sku} onChange={(e) => set('sku', e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="product-upc">UPC</label>
            <input id="product-upc" value={form.upc} onChange={(e) => set('upc', e.target.value)} className={field} inputMode="numeric" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="product-brand">Brand</label>
            <input id="product-brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="product-category">Category</label>
            <input
              id="product-category"
              list="product-category-options"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className={field}
              placeholder="New or existing"
            />
            <datalist id="product-category-options">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className={label} htmlFor="product-vendor">Vendor</label>
          <select id="product-vendor" value={form.vendorId} onChange={(e) => set('vendorId', e.target.value)} className={field}>
            <option value="">No vendor</option>
            {(vendors.data ?? []).map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="product-cost">Cost ($)</label>
            <input
              id="product-cost"
              value={form.cost}
              onChange={(e) => set('cost', e.target.value)}
              className={field}
              inputMode="decimal"
              disabled={!canEditCost}
              title={canEditCost ? undefined : 'Only owners can edit cost'}
            />
          </div>
          <div>
            <label className={label} htmlFor="product-price">Price ($)</label>
            <input id="product-price" value={form.price} onChange={(e) => set('price', e.target.value)} className={field} inputMode="decimal" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="product-min">Min stock</label>
            <input id="product-min" value={form.minStock} onChange={(e) => set('minStock', e.target.value)} className={field} inputMode="numeric" />
          </div>
          <div>
            <label className={label} htmlFor="product-reorder">Reorder qty</label>
            <input id="product-reorder" value={form.reorderQty} onChange={(e) => set('reorderQty', e.target.value)} className={field} inputMode="numeric" placeholder="Optional" />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            checked={form.ageRestricted}
            onChange={(e) => set('ageRestricted', e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Age restricted (21+)
        </label>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-md bg-primary text-primary-fg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2.5 text-sm text-muted-fg hover:text-fg hover:bg-subtle transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-fg">
          Cost edits are owner-only and product changes are written to the audit log.
        </p>
      </form>
    </div>
  )
}
