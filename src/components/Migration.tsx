import { useState } from 'react'
import { useDataSource, usePermissions } from '../data/provider'
import { formatNumber } from '../lib/format'
import type { ImportBatch, ImportRow, ImportUpload } from '../types'

type Step = 'upload' | 'mapping' | 'review' | 'done'

const STATUS_STYLES: Record<string, string> = {
  matched: 'bg-success-bg text-success',
  possible: 'bg-warning-bg text-warning',
  unmatched: 'bg-info-bg text-info',
  duplicate: 'bg-muted text-muted-fg',
  skipped: 'bg-muted text-muted-fg',
  committed: 'bg-success-bg text-success',
  failed: 'bg-danger-bg text-danger',
  pending: 'bg-muted text-muted-fg',
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLES[status] ?? 'bg-muted text-muted-fg'}`}
    >
      {status}
    </span>
  )
}

export default function Migration() {
  const source = useDataSource()
  const { canManageInventory } = usePermissions()

  const [step, setStep] = useState<Step>('upload')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upload, setUpload] = useState<ImportUpload | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [batch, setBatch] = useState<ImportBatch | null>(null)
  const [rows, setRows] = useState<ImportRow[]>([])

  if (!canManageInventory) {
    return (
      <div className="page-pad py-10">
        <h1 className="font-display text-[22px] font-medium text-fg">Thrive migration</h1>
        <p className="text-sm text-muted-fg mt-2">Only managers and owners can import Thrive catalogs.</p>
      </div>
    )
  }

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    try {
      const content = await file.text()
      const result = await source.uploadImport({ filename: file.name, content })
      setUpload(result)
      setMapping({ ...result.suggestedMapping })
      setStep('mapping')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read that file')
    } finally {
      setBusy(false)
    }
  }

  async function handleApplyMapping() {
    if (!upload) return
    setBusy(true)
    setError(null)
    try {
      const cleaned = Object.fromEntries(Object.entries(mapping).filter(([, header]) => header))
      await source.applyImportMapping(upload.batchId, cleaned)
      const detail = await source.getImportBatch(upload.batchId)
      setBatch(detail.batch)
      setRows(detail.rows)
      setStep('review')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mapping failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleCommit() {
    if (!batch) return
    setBusy(true)
    setError(null)
    try {
      const committed = await source.commitImport(batch.id)
      setBatch(committed)
      setStep('done')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Commit failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full">
      <div className="page-pad py-5 border-b border-border bg-card sticky top-0 z-10">
        <h1 className="font-display text-[22px] font-medium text-fg">Thrive Import</h1>
        <p className="text-sm text-muted-fg mt-0.5">
          Bring a Thrive export across: map the columns, review every match, then commit.
        </p>
        <ol className="flex flex-wrap items-center gap-2 mt-4 text-xs">
          {(['upload', 'mapping', 'review', 'done'] as Step[]).map((name, index) => (
            <li
              key={name}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 capitalize ${
                step === name ? 'border-primary text-primary' : 'border-border text-muted-fg'
              }`}
            >
              <span className="font-mono">{index + 1}</span>
              {name}
            </li>
          ))}
        </ol>
      </div>

      <div className="page-pad py-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-bg p-4 text-sm text-danger">{error}</div>
        )}

        {step === 'upload' && (
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl">
            <h2 className="font-display text-[15px] font-medium text-fg">Upload the export</h2>
            <p className="text-sm text-muted-fg mt-1">
              CSV or TSV. If Thrive gave you an XLSX, save it as CSV first — nothing is written to your catalog until you
              commit.
            </p>
            <label className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong px-6 py-10 text-center cursor-pointer hover:bg-subtle/50 transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted-fg">
                <path d="M12 15V3m0 0L8 7m4-4l4 4M4 19h16" />
              </svg>
              <span className="text-sm font-medium text-fg">{busy ? 'Reading…' : 'Choose a file'}</span>
              <span className="text-[11px] text-muted-fg">.csv or .tsv</span>
              <input
                type="file"
                accept=".csv,.tsv,text/csv,text/tab-separated-values"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleFile(file)
                }}
              />
            </label>
          </div>
        )}

        {step === 'mapping' && upload && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[15px] font-medium text-fg">Map columns</h2>
                  <p className="text-sm text-muted-fg mt-0.5">
                    {formatNumber(upload.rowCount)} rows · {upload.headers.length} columns detected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleApplyMapping()}
                  disabled={busy || !mapping.name}
                  className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  {busy ? 'Matching…' : 'Match rows'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {upload.canonicalFields.map((field) => (
                  <label key={field} className="text-sm">
                    <span className="block text-xs font-medium text-muted-fg mb-1">
                      {field}
                      {field === 'name' && <span className="text-danger"> *</span>}
                    </span>
                    <select
                      value={mapping[field] ?? ''}
                      onChange={(event) => setMapping({ ...mapping, [field]: event.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-border bg-bg text-sm text-fg"
                    >
                      <option value="">— not imported —</option>
                      {upload.headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h2 className="font-display text-[15px] font-medium text-fg">First rows</h2>
              </div>
              <div className="table-wrap">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-subtle/50">
                      {upload.headers.map((header) => (
                        <th
                          key={header}
                          className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {upload.preview.map((row, index) => (
                      <tr key={index} className="border-b border-border">
                        {upload.headers.map((header) => (
                          <td key={header} className="px-3 py-2.5 text-muted-fg whitespace-nowrap">
                            {row[header] ?? ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(step === 'review' || step === 'done') && batch && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { label: 'Rows', value: batch.rowCount },
                { label: 'Matched', value: batch.matched },
                { label: 'Possible', value: batch.possible },
                { label: 'New', value: batch.unmatched },
                { label: 'Duplicate', value: batch.duplicate },
                { label: 'Committed', value: batch.committed },
              ].map((card) => (
                <div key={card.label} className="bg-card border border-border rounded-lg p-4">
                  <div className="text-xs font-medium text-muted-fg">{card.label}</div>
                  <div className="font-mono text-[22px] font-semibold text-fg leading-none mt-2">
                    {formatNumber(card.value)}
                  </div>
                </div>
              ))}
            </div>

            {step === 'review' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/20 bg-warning-bg p-4">
                <span className="text-sm text-warning">
                  Committing creates the new products and writes opening balances. Possible matches are left alone until
                  someone resolves them.
                </span>
                <button
                  type="button"
                  onClick={() => void handleCommit()}
                  disabled={busy}
                  className="px-4 py-2 rounded-md bg-primary text-primary-fg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  {busy ? 'Committing…' : 'Commit import'}
                </button>
              </div>
            )}

            {step === 'done' && (
              <div className="rounded-lg border border-success/20 bg-success-bg p-4 text-sm text-success">
                Import committed. {formatNumber(batch.committed)} rows are now in the catalog with opening balances.
              </div>
            )}

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h2 className="font-display text-[15px] font-medium text-fg">Rows</h2>
                <p className="text-[11px] text-muted-fg mt-0.5">Matched against Clover id, then UPC, then SKU, then name.</p>
              </div>
              <div className="table-wrap">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-subtle/50">
                      <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">#</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Product</th>
                      <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Qty</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Status</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Matched to</th>
                      <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-muted-fg uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-border">
                        <td className="px-5 py-3 font-mono text-[11px] text-muted-fg">{row.rowNumber}</td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-fg">{row.mapped?.name ?? '—'}</div>
                          <div className="font-mono text-[11px] text-muted-fg mt-0.5">
                            {[row.mapped?.sku, row.mapped?.upc].filter(Boolean).join(' · ') || '—'}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-sm text-fg">{row.mapped?.quantity ?? '—'}</td>
                        <td className="px-3 py-3">
                          <StatusPill status={row.matchStatus} />
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-fg">{row.matchProductName ?? '—'}</td>
                        <td className="px-3 py-3 text-xs text-muted-fg">{row.error ?? row.matchReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
