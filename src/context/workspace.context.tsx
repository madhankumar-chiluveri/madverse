"use client";
// ─────────────────────────────────────────────────────────────
// src/context/workspace.context.tsx
//
// Provides the resolved current workspace + workspace list
// so any deeply nested component can consume them without
// prop-drilling.
// ─────────────────────────────────────────────────────────────
import React, { createContext, useContext, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAppStore } from "@/store";
import type { Workspace } from "@/types/page";

interface WorkspaceContextValue {
  workspace: Workspace | null | undefined;
  workspaces: Workspace[];
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspace: undefined,
  workspaces: [],
  isLoading: true,
});

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useAppStore();
  const workspaces = useQuery(api.workspaces.listWorkspaces, {}) ?? [];
  const workspace = useQuery(
    api.workspaces.getWorkspace,
    currentWorkspaceId ? { id: currentWorkspaceId } : "skip"
  );

  // Auto-select first workspace on first load
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspaceId) {
      setCurrentWorkspaceId(workspaces[0]._id);
    }
  }, [workspaces, currentWorkspaceId, setCurrentWorkspaceId]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace: workspace as Workspace | null | undefined,
        workspaces: workspaces as Workspace[],
        isLoading: workspace === undefined,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext(): WorkspaceContextValue {
  return useContext(WorkspaceContext);
}
