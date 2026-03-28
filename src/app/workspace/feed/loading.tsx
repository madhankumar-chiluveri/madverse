export default function FeedLoading() {
  return (
    <div className="min-h-full bg-background animate-fade-in-fast">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="skeleton-shimmer h-6 w-16 rounded-md" />
        </div>
        {/* Category tab strip */}
        <div className="max-w-6xl mx-auto px-4 pb-2">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-9 w-24 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer rounded-2xl border h-64" />
          ))}
        </div>
        {/* Mobile list */}
        <div className="md:hidden space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-20 rounded-xl border" />
          ))}
        </div>
      </div>
    </div>
  );
}
