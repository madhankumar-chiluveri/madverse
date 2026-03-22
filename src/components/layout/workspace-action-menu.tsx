"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import {
  BellRing,
  ChevronRight,
  FileUp,
  FolderPlus,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CreateSpaceItemModal } from "@/components/modals/create-space-item-modal";
import { ImportModal } from "@/components/modals/import-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app.store";

function ActionCard({
  icon: Icon,
  label,
  description,
  onClick,
  disabled = false,
  badge,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string | null;
  tone?: "neutral" | "amber" | "blue" | "emerald";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative overflow-hidden rounded-[20px] border p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        disabled
          ? "cursor-not-allowed border-white/6 bg-white/[0.02] text-zinc-600"
          : "border-white/8 bg-white/[0.03] text-zinc-100 hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.05]",
        tone === "amber" && !disabled && "hover:border-amber-400/20 hover:bg-amber-400/[0.08]",
        tone === "blue" && !disabled && "hover:border-sky-400/20 hover:bg-sky-400/[0.08]",
        tone === "emerald" && !disabled && "hover:border-emerald-400/20 hover:bg-emerald-400/[0.08]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[14px] border text-zinc-100 transition-colors",
            disabled
              ? "border-white/6 bg-white/[0.02] text-zinc-600"
              : "border-white/8 bg-black/25 group-hover:border-white/12"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {badge ? (
          <span className="rounded-full border border-amber-400/20 bg-amber-400/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-sm font-semibold">{label}</div>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>

      <div
        className={cn(
          "mt-4 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition-colors",
          !disabled && "group-hover:text-zinc-300"
        )}
      >
        Open
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

export function WorkspaceActionMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentWorkspaceId, setReminderCenterOpen } = useAppStore();

  const [open, setOpen] = useState(false);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [createSpaceOpen, setCreateSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceLoading, setNewSpaceLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const workspaces = useQuery(api.workspaces.listWorkspaces) ?? [];
  const createSpace = useMutation(api.pages.createSpace);

  const resolvedWorkspaceId = useMemo<Id<"workspaces"> | null>(() => {
    if (currentWorkspaceId && workspaces.some((workspace: any) => workspace._id === currentWorkspaceId)) {
      return currentWorkspaceId;
    }

    return workspaces[0]?._id ?? null;
  }, [currentWorkspaceId, workspaces]);

  const currentWorkspace = useMemo(
    () => workspaces.find((workspace: any) => workspace._id === resolvedWorkspaceId) ?? null,
    [resolvedWorkspaceId, workspaces]
  );

  const reminderSummary = useQuery(
    api.reminders.getSummary,
    resolvedWorkspaceId ? { workspaceId: resolvedWorkspaceId } : "skip"
  );
  const overdueCount = reminderSummary?.overdue ?? 0;

  const closeMenu = () => setOpen(false);

  const handleOpenReminders = () => {
    closeMenu();
    setReminderCenterOpen(true);
  };

  const handleOpenCreateItem = () => {
    if (!resolvedWorkspaceId) return;
    closeMenu();
    setCreateItemOpen(true);
  };

  const handleOpenCreateSpace = () => {
    if (!resolvedWorkspaceId) return;
    closeMenu();
    setCreateSpaceOpen(true);
  };

  const handleOpenImport = () => {
    if (!resolvedWorkspaceId) return;
    closeMenu();
    setImportModalOpen(true);
  };

  const handleOpenTrash = () => {
    closeMenu();
    if (pathname !== "/workspace/trash") {
      router.push("/workspace/trash");
    }
  };

  const handleCreateSpace = async () => {
    const title = newSpaceName.trim();
    if (!title) {
      toast.error("Enter a space name");
      return;
    }

    if (!resolvedWorkspaceId) {
      toast.error("Workspace is still loading");
      return;
    }

    setNewSpaceLoading(true);
    try {
      const id = await createSpace({
        workspaceId: resolvedWorkspaceId,
        title,
      });
      setCreateSpaceOpen(false);
      setNewSpaceName("");
      router.push(`/workspace/${id}`);
    } catch {
      toast.error("Failed to create space");
    } finally {
      setNewSpaceLoading(false);
    }
  };

  const actionsDisabled = !resolvedWorkspaceId;

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open workspace actions"
            className="group pointer-events-auto relative inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-[#161513]/82 px-3.5 text-zinc-100 shadow-[0_16px_44px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all hover:border-white/16 hover:bg-[#1b1a18]/92"
          >
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500 sm:inline">
              Actions
            </span>
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <MoreHorizontal className="h-4 w-4" />
              {overdueCount > 0 ? (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.6)]" />
              ) : null}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={14}
          className="w-[380px] rounded-[26px] border-white/10 bg-[#151412]/96 p-2 text-zinc-100 shadow-[0_28px_80px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
        >
          <div className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">Workspace actions</div>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {currentWorkspace?.name ? `${currentWorkspace.name} shortcuts` : "Keep core workspace actions close at hand."}
                </p>
              </div>
              {overdueCount > 0 ? (
                <span className="rounded-full border border-amber-400/18 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  {overdueCount} overdue
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <ActionCard
              icon={BellRing}
              label="Reminders"
              description={
                overdueCount > 0
                  ? `${overdueCount} overdue reminder${overdueCount === 1 ? "" : "s"} waiting for you.`
                  : "Review upcoming and overdue reminders in one place."
              }
              badge={overdueCount > 0 ? `${overdueCount}` : null}
              onClick={handleOpenReminders}
              tone="amber"
            />
            <ActionCard
              icon={Plus}
              label="New"
              description="Open the starter catalog for a fresh page or database."
              onClick={handleOpenCreateItem}
              disabled={actionsDisabled}
              tone="blue"
            />
            <ActionCard
              icon={FolderPlus}
              label="Space"
              description="Create a dedicated project space with its own home."
              onClick={handleOpenCreateSpace}
              disabled={actionsDisabled}
              tone="emerald"
            />
            <ActionCard
              icon={FileUp}
              label="Import"
              description="Bring in Markdown notes or CSV databases without leaving the page."
              onClick={handleOpenImport}
              disabled={actionsDisabled}
            />
          </div>

          <button
            type="button"
            onClick={handleOpenTrash}
            className={cn(
              "mt-2 flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition-colors",
              pathname === "/workspace/trash"
                ? "border-red-400/16 bg-red-400/[0.08] text-red-100"
                : "border-white/8 bg-white/[0.03] text-zinc-200 hover:border-red-400/16 hover:bg-red-400/[0.08] hover:text-red-100"
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[14px] border",
                pathname === "/workspace/trash"
                  ? "border-red-400/16 bg-red-400/[0.08]"
                  : "border-white/8 bg-black/20"
              )}
            >
              <Trash2 className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                {pathname === "/workspace/trash" ? "Trash open" : "Trash"}
              </span>
              <span className="mt-1 block text-xs leading-5 text-zinc-500">
                Review recently deleted pages, spaces, and databases.
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createSpaceOpen} onOpenChange={setCreateSpaceOpen}>
        <DialogContent
          title="Create space"
          className="max-w-md border-white/10 bg-[#161513] text-zinc-100"
        >
          <DialogHeader>
            <DialogTitle>Create a new project space</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Each space gets its own home page and isolated pages, notes, and databases.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={newSpaceName}
              onChange={(event) => setNewSpaceName(event.target.value)}
              placeholder="Space name"
              className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-white/15"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-zinc-300 hover:bg-white/[0.06] hover:text-white"
              onClick={() => setCreateSpaceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-white text-black hover:bg-zinc-200"
              onClick={handleCreateSpace}
              disabled={newSpaceLoading}
            >
              {newSpaceLoading ? "Creating..." : "Create space"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {resolvedWorkspaceId ? (
        <CreateSpaceItemModal
          open={createItemOpen}
          onClose={() => setCreateItemOpen(false)}
          workspaceId={resolvedWorkspaceId}
          parentId={null}
          spaceLabel="General"
        />
      ) : null}

      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        workspaceId={resolvedWorkspaceId}
      />
    </>
  );
}
