"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DatabaseView } from "@/components/database/database-view";
import { PageView } from "@/components/editor/page-view";
import { useAppStore } from "@/store/app.store";

export default function PagePage() {
  const params = useParams();
  const pageId = params.pageId as Id<"pages">;
  const addRecentPage = useAppStore((state) => state.addRecentPage);
  const [resolvedPage, setResolvedPage] = useState<any | null>(null);

  const page = useQuery(api.pages.get, { id: pageId });

  useEffect(() => {
    if (pageId) {
      addRecentPage(pageId);
    }
  }, [addRecentPage, pageId]);

  useEffect(() => {
    if (page !== undefined) {
      setResolvedPage(page);
    }
  }, [page]);

  const displayPage = page === undefined ? resolvedPage : page;
  const isRouteTransitioning = page === undefined && resolvedPage !== null;

  if (displayPage === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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

  const content =
    displayPage.type === "database" ? (
      <DatabaseView key={displayPage._id} page={displayPage} />
    ) : (
      <PageView key={displayPage._id} page={displayPage} />
    );

  if (isRouteTransitioning) {
    return (
      <div className="relative">
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-px animate-pulse bg-gradient-to-r from-transparent via-sky-400/80 to-transparent" />
        {content}
      </div>
    );
  }

  return content;
}
