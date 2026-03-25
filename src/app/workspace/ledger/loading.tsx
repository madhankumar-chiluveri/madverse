export default function LedgerLoading() {
  return (
    <div className="min-h-full bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="h-6 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 space-y-4">
        {/* Metric cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
          ))}
        </div>

        {/* Chart skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-2xl border bg-muted/20 animate-pulse" />
          <div className="h-64 rounded-2xl border bg-muted/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
