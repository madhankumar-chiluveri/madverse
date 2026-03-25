export default function WorkspaceLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
