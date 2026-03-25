export default function SettingsLoading() {
  return (
    <div className="min-h-full bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <div className="h-7 w-28 rounded bg-muted animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl border bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
