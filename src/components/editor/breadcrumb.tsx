"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  pageId: Id<"pages">;
  pageTitle: string;
  pageIcon?: string | null;
  className?: string;
}

export function PageBreadcrumb({
  pageId,
  pageTitle,
  pageIcon,
  className,
}: BreadcrumbProps) {
  const router = useRouter();
  const ancestors = useQuery(api.pages.getAncestors, { id: pageId });

  // Show skeleton while loading
  if (ancestors === undefined) {
    return (
      <div className={cn("flex items-center gap-1 text-sm select-none", className)}>
        <div className="h-4 w-24 rounded bg-muted/40 animate-pulse" />
      </div>
    );
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground select-none min-w-0",
        className
      )}
    >
      {ancestors.map((ancestor) => (
        <span key={ancestor._id} className="flex items-center gap-1 min-w-0 flex-shrink-0">
          <button
            onClick={() => router.push(`/workspace/${ancestor._id}`)}
            className="flex items-center gap-1 max-w-[140px] truncate rounded px-1 py-0.5 hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            {ancestor.icon && (
              <span className="text-sm leading-none flex-shrink-0">{ancestor.icon}</span>
            )}
            <span className="truncate">{ancestor.title || "Untitled"}</span>
          </button>
          <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-40" />
        </span>
      ))}

      {/* Current page */}
      <span className="flex items-center gap-1 min-w-0 text-foreground font-medium px-1">
        {pageIcon && (
          <span className="text-sm leading-none flex-shrink-0">{pageIcon}</span>
        )}
        <span className="truncate max-w-[200px]">{pageTitle || "Untitled"}</span>
      </span>
    </nav>
  );
}
