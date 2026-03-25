export default function FeedLoading() {
  return (
    <div className="min-h-full bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="h-6 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-muted/30 animate-pulse">
              <div className="h-36" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        {/* Mobile list */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/30 border animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
