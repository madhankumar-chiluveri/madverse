"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Table,
  LayoutList,
  LayoutGrid,
  Plus,
  Settings2,
  ChevronDown,
} from "lucide-react";
import { TableView } from "./table-view";
import { BoardView } from "./board-view";
import { ListView } from "./list-view";

interface DatabaseViewProps {
  page: any;
}

type ViewType = "table" | "board" | "list";

export function DatabaseView({ page }: DatabaseViewProps) {
  const [viewType, setViewType] = useState<ViewType>("table");
  const [title, setTitle] = useState(page.title);
  const [editingTitle, setEditingTitle] = useState(false);

  const updatePage = useMutation(api.pages.update);

  const database = useQuery(api.databases.getByPage, { pageId: page._id });

  const handleTitleSave = async () => {
    setEditingTitle(false);
    if (title !== page.title) {
      await updatePage({ id: page._id, title });
    }
  };

  const viewTabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: "table", label: "Table", icon: <Table className="w-3.5 h-3.5" /> },
    { id: "board", label: "Board", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: "list", label: "List", icon: <LayoutList className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-8 pt-12 pb-4 max-w-full">
        {editingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSave();
              if (e.key === "Escape") {
                setTitle(page.title);
                setEditingTitle(false);
              }
            }}
            className="text-4xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
            autoFocus
          />
        ) : (
          <h1
            className="text-4xl font-bold cursor-text hover:opacity-80 transition-opacity mb-4"
            onClick={() => setEditingTitle(true)}
          >
            {page.title || <span className="text-muted-foreground/40">Untitled</span>}
          </h1>
        )}

        {/* Tags */}
        {page.maddyTags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {page.maddyTags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* View selector */}
        <div className="flex items-center gap-1 border-b pb-2">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                viewType === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />
            Properties
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
            <ChevronDown className="w-3.5 h-3.5" />
            Filter
          </Button>
        </div>
      </div>

      {/* View content */}
      <div className="px-8 pb-16">
        {database === undefined ? (
          <div className="text-muted-foreground text-sm py-8">Loading database…</div>
        ) : database === null ? (
          <CreateDatabase pageId={page._id} />
        ) : (
          <>
            {viewType === "table" && (
              <TableView database={database} pageId={page._id} />
            )}
            {viewType === "board" && (
              <BoardView database={database} pageId={page._id} />
            )}
            {viewType === "list" && (
              <ListView database={database} pageId={page._id} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Create Database helper ───────────────────────────────────────────────────
function CreateDatabase({ pageId }: { pageId: Id<"pages"> }) {
  const createDatabase = useMutation(api.databases.create);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createDatabase({
        pageId,
        name: "Database",
        properties: [
          { id: "name", name: "Name", type: "title" },
          { id: "status", name: "Status", type: "select", options: [
            { id: "todo", name: "To Do", color: "gray" },
            { id: "inprogress", name: "In Progress", color: "blue" },
            { id: "done", name: "Done", color: "green" },
          ]},
          { id: "priority", name: "Priority", type: "select", options: [
            { id: "low", name: "Low", color: "gray" },
            { id: "medium", name: "Medium", color: "yellow" },
            { id: "high", name: "High", color: "red" },
          ]},
        ],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-muted-foreground">No database schema found.</p>
      <Button onClick={handleCreate} disabled={creating}>
        <Plus className="w-4 h-4 mr-2" />
        {creating ? "Creating…" : "Initialize Database"}
      </Button>
    </div>
  );
}
