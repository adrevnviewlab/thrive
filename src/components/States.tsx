export function LoadingRows({ rows = 5, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div className="p-5 space-y-2" role="status" aria-live="polite" aria-label={label}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-9 rounded-md bg-subtle animate-pulse" />
      ))}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
  title = "Couldn't load this data",
}: {
  message: string
  onRetry?: () => void
  title?: string
}) {
  return (
    <div className="m-5 rounded-lg border border-danger/30 bg-danger-bg p-4">
      <div className="text-sm font-semibold text-danger">{title}</div>
      <p className="mt-1 text-xs text-danger/80">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="text-sm font-medium text-fg">{title}</div>
      {detail && <p className="mt-1 text-xs text-muted-fg">{detail}</p>}
    </div>
  )
}
