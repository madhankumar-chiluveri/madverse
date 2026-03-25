export default function OverviewLoading() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Greeting skeleton */}
          <div className="col-span-full flex items-center gap-3 px-1 pb-1">
            <div className="h-6 w-6 rounded bg-muted animate-pulse" />
            <div className="h-7 w-48 rounded bg-muted animate-pulse" />
          </div>

          {/* Quick capture skeleton */}
          <div className="col-span-full">
            <div className="h-12 rounded-xl bg-muted/50 border animate-pulse" />
          </div>

          {/* Habit strip skeleton */}
          <div className="col-span-full h-24 rounded-2xl bg-muted/30 border animate-pulse" />

          {/* Widget skeletons */}
          <div className="h-44 rounded-2xl bg-muted/30 border animate-pulse" />
          <div className="h-44 rounded-2xl bg-muted/30 border animate-pulse" />
          <div className="h-44 rounded-2xl bg-muted/30 border animate-pulse" />
        </div>
      </div>
    </div>
  );
}
