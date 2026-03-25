export default function PageLoading() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:px-6">
        {/* Icon placeholder */}
        <div className="h-12 w-12 rounded-lg bg-muted animate-pulse mb-3" />
        {/* Title placeholder */}
        <div className="h-10 w-2/3 rounded bg-muted animate-pulse mb-6" />
        {/* Content lines */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-muted/40 animate-pulse" />
          <div className="h-4 w-4/6 rounded bg-muted/40 animate-pulse" />
          <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-muted/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
