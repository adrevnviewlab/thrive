import { useState } from 'react'
import { useDataSource } from '../data/provider'
import type { Vendor, VendorInput } from '../types'

interface VendorFormProps {
  /** Null means a new vendor. */
  vendor: Vendor | null
  onClose: () => void
  onSaved: () => void
}

export default function VendorForm({ vendor, onClose, onSaved }: VendorFormProps) {
  const source = useDataSource()
  const [form, setForm] = useState<VendorInput>({
    name: vendor?.name ?? '',
    contactName: vendor?.contactName ?? '',
    email: vendor?.email ?? '',
    phone: vendor?.phone ?? '',
    rep: vendor?.rep ?? '',
    status: vendor?.status ?? 'active',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof VendorInput>(key: K, value: VendorInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const input: VendorInput = { ...form, name: form.name.trim() }
      if (vendor) await source.updateVendor(vendor.id, input)
      else await source.createVendor(input)
      onSaved()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this vendor')
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
            <h2 className="font-display text-lg font-medium text-fg">{vendor ? 'Edit vendor' : 'Add vendor'}</h2>
            <p className="text-xs text-muted-fg mt-0.5">Vendors are who purchase orders get sent to.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-fg hover:bg-subtle hover:text-fg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <label className={label} htmlFor="vendor-name">Company name</label>
          <input id="vendor-name" required value={form.name} onChange={(e) => set('name', e.target.value)} className={field} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="vendor-contact">Contact</label>
            <input id="vendor-contact" value={form.contactName ?? ''} onChange={(e) => set('contactName', e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="vendor-rep">Sales rep</label>
            <input id="vendor-rep" value={form.rep ?? ''} onChange={(e) => set('rep', e.target.value)} className={field} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="vendor-email">Email</label>
            <input id="vendor-email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="vendor-phone">Phone</label>
            <input id="vendor-phone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} className={field} inputMode="tel" />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="vendor-status">Status</label>
          <select
            id="vendor-status"
            value={form.status ?? 'active'}
            onChange={(e) => set('status', e.target.value as 'active' | 'inactive')}
            className={field}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-md bg-primary text-primary-fg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : vendor ? 'Save changes' : 'Create vendor'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2.5 text-sm text-muted-fg hover:text-fg hover:bg-subtle transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
