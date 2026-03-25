"use client";

import { useEffect } from "react";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PageError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-4xl font-semibold text-muted-foreground/60">Error</p>
      <p className="text-lg font-semibold">Failed to load page</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        This page could not be loaded. It may have been deleted or you may not have access.
      </p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
        <a
          href="/workspace/overview"
          className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Go to Overview
        </a>
      </div>
    </div>
  );
}
