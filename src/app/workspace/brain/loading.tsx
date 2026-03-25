export default function BrainLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-16 text-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 animate-pulse" />
      <div className="space-y-2">
        <div className="h-5 w-16 mx-auto rounded bg-muted animate-pulse" />
        <div className="h-3 w-48 mx-auto rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
