export default function LedgerLoading() {
  return (
    <div className="min-h-full bg-background animate-fade-in-fast">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="skeleton-shimmer h-6 w-24 rounded-md" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 space-y-4">
        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
          ))}
        </div>

        {/* Chart areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skeleton-shimmer h-64 rounded-2xl border" />
          <div className="skeleton-shimmer h-64 rounded-2xl border" />
        </div>

        {/* Transaction rows */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-14 rounded-xl border" />
          ))}
        </div>
      </div>
    </div>
  );
}
