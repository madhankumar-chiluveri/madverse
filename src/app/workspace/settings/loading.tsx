export default function SettingsLoading() {
  return (
    <div className="min-h-full bg-background animate-fade-in-fast">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <div className="skeleton-shimmer h-7 w-28 rounded-md" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-9 w-24 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-20 rounded-2xl border" />
          ))}
        </div>
      </div>
    </div>
  );
}
