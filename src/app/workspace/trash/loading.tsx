export default function TrashLoading() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-4">
        <div className="h-7 w-20 rounded bg-muted animate-pulse" />
        <div className="h-10 rounded-xl bg-muted/30 border animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
