"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DatabaseView } from "@/components/database/database-view";
import { PageView } from "@/components/editor/page-view";
import { useAppStore } from "@/store/app.store";

// Skeleton that mirrors the page layout (icon + title + content lines)
function PageSkeleton() {
  return (
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
  );
}

export default function PagePage() {
  const params = useParams();
  const pageId = params.pageId as Id<"pages">;
  const addRecentPage = useAppStore((state) => state.addRecentPage);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the last known good page so we never flash a spinner during nav
  const [resolvedPage, setResolvedPage] = useState<any | null | undefined>(undefined);

  const page = useQuery(api.pages.get, { id: pageId });

  // Track page id for scroll-to-top
  const prevPageId = useRef<string>(pageId);

  useEffect(() => {
    if (pageId) {
      addRecentPage(pageId);
    }
    // Scroll to top when navigating to a different page
    if (prevPageId.current !== pageId) {
      prevPageId.current = pageId;
      scrollRef.current?.scrollTo({ top: 0 });
    }
  }, [addRecentPage, pageId]);

  useEffect(() => {
    if (page !== undefined) {
      setResolvedPage(page);
    }
  }, [page]);

  const displayPage = page === undefined ? resolvedPage : page;
  // While Convex is fetching the new page, show skeleton instead of old content
  const isTransitioning = page === undefined && resolvedPage !== undefined && resolvedPage !== null;

  // First load — nothing to show yet
  if (displayPage === undefined) {
    return (
      <div ref={scrollRef} className="min-h-full overflow-auto">
        <PageSkeleton />
      </div>
    );
  }

  if (displayPage === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-5xl font-semibold text-muted-foreground/60">404</p>
        <p className="text-xl font-semibold">Page not found</p>
        <p className="text-sm text-muted-foreground">
          This page was deleted or doesn&apos;t exist.
        </p>
      </div>
    );
  }

  // During route transition show skeleton on top of old content
  if (isTransitioning) {
    return (
      <div ref={scrollRef} className="min-h-full overflow-auto">
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-slide-in" />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="min-h-full overflow-auto">
      {displayPage.type === "database" ? (
        <DatabaseView page={displayPage} />
      ) : (
        <PageView page={displayPage} />
      )}
    </div>
  );
}
