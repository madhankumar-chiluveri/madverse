export default function OverviewLoading() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8 animate-fade-in-fast">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Greeting */}
          <div className="col-span-full flex items-center gap-3 px-1 pb-1">
            <div className="skeleton-shimmer h-6 w-6 rounded" />
            <div className="skeleton-shimmer h-7 w-48 rounded-md" />
          </div>

          {/* Quick capture */}
          <div className="col-span-full">
            <div className="skeleton-shimmer h-12 rounded-xl border" />
          </div>

          {/* Habit strip */}
          <div className="col-span-full skeleton-shimmer h-24 rounded-2xl border" />

          {/* Widgets */}
          <div className="skeleton-shimmer h-44 rounded-2xl border" />
          <div className="skeleton-shimmer h-44 rounded-2xl border" />
          <div className="skeleton-shimmer h-44 rounded-2xl border" />
        </div>
      </div>
    </div>
  );
}
