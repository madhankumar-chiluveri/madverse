"use client";

import { useQuery } from "convex/react";
import { useAppStore } from "@/store/app.store";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { WorkspaceActionMenu } from "@/components/layout/workspace-action-menu";

interface WorkspaceTopBarProps {
  moduleTitle: string;
  rightContent?: React.ReactNode;
  className?: string;
}

export function WorkspaceTopBar({
  moduleTitle,
  rightContent,
  className,
}: WorkspaceTopBarProps) {
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId);
  const workspace = useQuery(
    api.workspaces.getWorkspace,
    currentWorkspaceId ? { id: currentWorkspaceId } : "skip"
  );

  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between gap-2 px-4 md:px-8 py-2",
        "border-b border-border/40 bg-background/80 backdrop-blur-md",
        className
      )}
    >
      {/* Left: workspace / module breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground min-w-0 select-none">
        <span className="flex items-center gap-1 shrink-0">
          {workspace?.icon && (
            <span className="text-sm leading-none">{workspace.icon}</span>
          )}
          <span className="font-medium text-foreground truncate max-w-[140px]">
            {workspace?.name ?? "Workspace"}
          </span>
        </span>
        <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
        <span className="text-foreground font-medium truncate">{moduleTitle}</span>
      </nav>

      {/* Right: custom content + workspace action menu */}
      <div className="flex items-center gap-1 shrink-0">
        {rightContent}
        <WorkspaceActionMenu />
      </div>
    </div>
  );
}
