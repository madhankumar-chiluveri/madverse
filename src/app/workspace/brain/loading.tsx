export default function BrainLoading() {
  return (
    <div className="min-h-full bg-background animate-fade-in-fast">
      {/* Toolbar strip */}
      <div className="border-b px-4 py-2 flex items-center gap-2">
        <div className="skeleton-shimmer h-8 w-24 rounded-lg" />
        <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
        <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
        <div className="ml-auto skeleton-shimmer h-8 w-32 rounded-lg" />
      </div>

      {/* Page list rows */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <div className="skeleton-shimmer h-6 w-6 rounded" />
            <div
              className="skeleton-shimmer h-4 rounded-md"
              style={{ width: `${55 + (i % 4) * 10}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
