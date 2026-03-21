"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { PageView } from "@/components/editor/page-view";
import { DatabaseView } from "@/components/database/database-view";
import { useEffect } from "react";
import { useAppStore } from "@/store/app.store";
import { Loader2 } from "lucide-react";

export default function PagePage() {
  const params = useParams();
  const pageId = params.pageId as Id<"pages">;
  const addRecentPage = useAppStore((s) => s.addRecentPage);

  const page = useQuery(api.pages.get, { id: pageId });

  useEffect(() => {
    if (pageId) addRecentPage(pageId);
  }, [pageId, addRecentPage]);

  if (page === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (page === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-5xl">🔍</p>
        <p className="text-xl font-semibold">Page not found</p>
        <p className="text-muted-foreground text-sm">
          This page was deleted or doesn&apos;t exist.
        </p>
      </div>
    );
  }

  if (page.type === "database") {
    return <DatabaseView page={page} />;
  }

  return <PageView page={page} />;
}
