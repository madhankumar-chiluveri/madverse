"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/app.store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { WorkspaceSetup } from "./workspace-setup";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Database,
  LayoutDashboard,
  Plus,
  Search,
  Trash2,
  Settings,
  Star,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  MoreHorizontal,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MaddyPanel } from "@/components/maddy/maddy-panel";

// ─── Page tree item ──────────────────────────────────────────────────────────

interface PageItemProps {
  page: any;
  depth?: number;
  workspaceId: Id<"workspaces">;
}

function PageItem({ page, depth = 0, workspaceId }: PageItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleExpanded, isExpanded } = useAppStore();
  const expanded = isExpanded(page._id);

  const createPage = useMutation(api.pages.create);
  const archivePage = useMutation(api.pages.archive);

  const children = useQuery(api.pages.list, {
    workspaceId,
    parentId: page._id,
  });

  const isActive = pathname === `/workspace/${page._id}`;
  const hasChildren = children && children.length > 0;

  const handleCreate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newId = await createPage({
        workspaceId,
        parentId: page._id,
        type: "document",
        title: "Untitled",
      });
      useAppStore.getState().setExpanded(page._id, true);
      router.push(`/workspace/${newId}`);
    } catch {
      toast.error("Failed to create page");
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archivePage({ id: page._id });
      toast.success("Page moved to trash");
      if (isActive) router.push("/workspace");
    } catch {
      toast.error("Failed to archive page");
    }
  };

  const typeIcon =
    page.type === "database" ? (
      <Database className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
    ) : page.type === "dashboard" ? (
      <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
    ) : (
      <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
    );

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer select-none text-sm",
          "hover:bg-accent/50 transition-colors",
          isActive && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => router.push(`/workspace/${page._id}`)}
      >
        {/* Expand toggle */}
        <button
          className={cn(
            "w-4 h-4 flex items-center justify-center rounded shrink-0",
            "hover:bg-accent text-muted-foreground transition-colors"
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded(page._id);
          }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )
          ) : (
            <span className="w-3 h-3" />
          )}
        </button>

        {/* Icon */}
        <span className="text-sm leading-none shrink-0">
          {page.icon ?? typeIcon}
        </span>

        {/* Title */}
        <span className="flex-1 truncate text-sm">
          {page.title || "Untitled"}
        </span>

        {/* Actions — show on hover */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
          <button
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-accent"
            onClick={handleCreate}
            title="Add sub-page"
          >
            <Plus className="w-3 h-3 text-muted-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => router.push(`/workspace/${page._id}`)}
              >
                <FileText className="w-4 h-4 mr-2" /> Open page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleArchive}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="w-4 h-4 mr-2" /> Move to trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {children!.map((child: any) => (
            <PageItem
              key={child._id}
              page={child}
              depth={depth + 1}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentWorkspaceId,
    sidebarCollapsed,
    toggleSidebar,
    setCommandPaletteOpen,
  } = useAppStore();

  const [maddyOpen, setMaddyOpen] = useState(false);

  const workspaces = useQuery(api.workspaces.listWorkspaces);
  const pages = useQuery(
    api.pages.list,
    currentWorkspaceId
      ? { workspaceId: currentWorkspaceId, parentId: null }
      : "skip"
  );
  const favourites = useQuery(
    api.pages.listFavourites,
    currentWorkspaceId ? { workspaceId: currentWorkspaceId } : "skip"
  );

  const createPage = useMutation(api.pages.create);

  const handleNewPage = async () => {
    if (!currentWorkspaceId) return;
    try {
      const id = await createPage({
        workspaceId: currentWorkspaceId,
        parentId: null,
        type: "document",
        title: "Untitled",
      });
      router.push(`/workspace/${id}`);
    } catch {
      toast.error("Failed to create page");
    }
  };

  // ── If no workspace, show setup ───────────────────────────────────────────
  if (workspaces !== undefined && workspaces.length === 0) {
    return <WorkspaceSetup />;
  }

  // ── Collapsed sidebar ─────────────────────────────────────────────────────
  if (sidebarCollapsed) {
    return (
      <div className="w-12 flex flex-col items-center py-3 gap-3 border-r bg-sidebar shrink-0">
        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent"
          onClick={toggleSidebar}
        >
          <PanelLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent"
          onClick={handleNewPage}
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent"
          onClick={() => setMaddyOpen(true)}
        >
          <Sparkles className="w-4 h-4 text-foreground" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-60 shrink-0 flex flex-col h-full border-r bg-sidebar overflow-hidden">
        {/* Top: workspace header + collapse */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <UserMenu />
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent"
            onClick={toggleSidebar}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Nav shortcuts */}
        <div className="px-2 pt-2 space-y-0.5">
          <NavItem
            icon={<Search className="w-4 h-4" />}
            label="Search"
            onClick={() => setCommandPaletteOpen(true)}
            kbd="⌘K"
          />
          <NavItem
            icon={<Sparkles className="w-4 h-4 text-foreground" />}
            label="Ask Maddy"
            onClick={() => setMaddyOpen(true)}
          />
          <NavItem
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            active={pathname === "/workspace/settings"}
            onClick={() => router.push("/workspace/settings")}
          />
        </div>

        {/* Favourites */}
        {favourites && favourites.length > 0 && (
          <div className="mt-3">
            <div className="px-3 py-1 flex items-center gap-1.5">
              <Star className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Favourites
              </span>
            </div>
            <div className="px-1">
              {favourites.map((page: any) => (
                <PageItem
                  key={page._id}
                  page={page}
                  workspaceId={currentWorkspaceId!}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pages tree */}
        <div className="mt-3 flex-1 overflow-y-auto">
          <div className="px-3 py-1 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pages
            </span>
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-accent"
              onClick={handleNewPage}
              title="New page"
            >
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="px-1 pb-4">
            {pages === undefined ? (
              <div className="px-3 py-2 text-xs text-muted-foreground animate-pulse">
                Loading...
              </div>
            ) : pages.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  No pages yet
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={handleNewPage}
                >
                  <Plus className="w-3 h-3 mr-1" /> New page
                </Button>
              </div>
            ) : (
              pages.map((page: any) => (
                <PageItem
                  key={page._id}
                  page={page}
                  workspaceId={currentWorkspaceId!}
                />
              ))
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="px-2 pb-2 border-t pt-2 space-y-0.5">
          <NavItem
            icon={<Trash2 className="w-4 h-4" />}
            label="Trash"
            active={pathname === "/workspace/trash"}
            onClick={() => router.push("/workspace/trash")}
          />
          <button
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent/50 transition-colors"
            onClick={handleNewPage}
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">New page</span>
          </button>
        </div>
      </div>

      {/* Maddy panel */}
      <MaddyPanel open={maddyOpen} onClose={() => setMaddyOpen(false)} />
    </>
  );
}

// ── Nav item helper ──────────────────────────────────────────────────────────
function NavItem({
  icon,
  label,
  onClick,
  active,
  kbd,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  kbd?: string;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
        "hover:bg-accent/50",
        active && "bg-accent text-accent-foreground"
      )}
      onClick={onClick}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {kbd && (
        <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
          {kbd}
        </kbd>
      )}
    </button>
  );
}
