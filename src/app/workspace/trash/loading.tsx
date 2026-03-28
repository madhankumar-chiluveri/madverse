export default function TrashLoading() {
  return (
    <div className="min-h-full bg-background animate-fade-in-fast">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-4">
        <div className="skeleton-shimmer h-7 w-20 rounded-md" />
        <div className="skeleton-shimmer h-10 rounded-xl border" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-14 rounded-xl border" />
          ))}
        </div>
      </div>
    </div>
  );
}
