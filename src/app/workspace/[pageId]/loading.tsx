export default function PageLoading() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:px-6 animate-fade-in-fast">
        <div className="skeleton-shimmer h-12 w-12 rounded-lg mb-3" />
        <div className="skeleton-shimmer h-10 w-2/3 rounded-lg mb-6" />
        <div className="space-y-3">
          <div className="skeleton-shimmer h-4 w-full rounded-md" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
          <div className="skeleton-shimmer h-4 w-4/6 rounded-md" />
          <div className="skeleton-shimmer h-4 w-full rounded-md" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded-md" />
          <div className="skeleton-shimmer h-4 w-11/12 rounded-md" />
        </div>
      </div>
    </div>
  );
}
