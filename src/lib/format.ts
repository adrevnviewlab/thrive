const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const compactCurrency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const number = new Intl.NumberFormat('en-US')
const timeOfDay = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const dateTime = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export const formatMoney = (value: number) => currency.format(value)
export const formatMoneyCompact = (value: number) => compactCurrency.format(value)
export const formatNumber = (value: number) => number.format(value)

export const formatTime = (iso: string | null) => (iso ? timeOfDay.format(new Date(iso)) : '—')
export const formatDate = (iso: string | null) => (iso ? shortDate.format(new Date(iso)) : '—')
export const formatDateTime = (iso: string | null) => (iso ? dateTime.format(new Date(iso)) : '—')

export function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

export const formatDelta = (value: number) => (value > 0 ? `+${formatNumber(value)}` : formatNumber(value))

const reasonLabels: Record<string, string> = {
  sale: 'Sale (Clover)',
  receive: 'Received',
  adjust: 'Stock adjustment',
  count: 'Count adjustment',
  damage: 'Damaged',
  return: 'Return',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
  import: 'Opening balance',
  reconcile: 'Reconciliation',
}

export const movementLabel = (reason: string, note: string) => note || reasonLabels[reason] || reason
