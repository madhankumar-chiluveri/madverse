"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyCell } from "./property-cell";
import { cn } from "@/lib/utils";

interface BoardViewProps {
  database: any;
  pageId: Id<"pages">;
}

export function BoardView({ database, pageId }: BoardViewProps) {
  const rows = useQuery(api.databases.listRows, { databaseId: database._id });
  const addRow = useMutation(api.databases.addRow);
  const updateRow = useMutation(api.databases.updateRow);

  // Find the first select property to group by
  const groupProp = database.properties?.find(
    (p: any) => p.type === "select"
  );
  const titleProp = database.properties?.find(
    (p: any) => p.type === "title"
  );

  if (!groupProp) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Add a Select property to use Board view.
      </div>
    );
  }

  const columns = groupProp.options ?? [];
  const noGroupRows = rows?.filter(
    (r: any) => !r.data?.[groupProp.id] || r.data?.[groupProp.id] === ""
  );

  const handleAddCard = async (columnId: string) => {
    const initialData: Record<string, any> = {
      [titleProp?.id ?? "name"]: "Untitled",
      [groupProp.id]: columnId,
    };
    await addRow({ databaseId: database._id, data: initialData });
  };

  const handleCardGroupChange = async (
    rowId: Id<"rows">,
    row: any,
    newGroupId: string
  ) => {
    await updateRow({
      id: rowId,
      data: { ...row.data, [groupProp.id]: newGroupId },
    });
  };

  const renderCard = (row: any) => {
    const title =
      titleProp ? row.data?.[titleProp.id] ?? "Untitled" : "Untitled";
    const otherProps = database.properties.filter(
      (p: any) => p.type !== "title" && p.type !== "select"
    );

    return (
      <div
        key={row._id}
        className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <p className="font-medium text-sm mb-2">{title || "Untitled"}</p>
        {otherProps.map((prop: any) => (
          <div key={prop.id} className="flex items-center gap-2 text-xs mb-1">
            <span className="text-muted-foreground w-16 truncate">
              {prop.name}
            </span>
            <PropertyCell
              property={prop}
              value={row.data?.[prop.id]}
              onChange={(val) => {
                updateRow({
                  id: row._id,
                  data: { ...row.data, [prop.id]: val },
                });
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 min-h-[400px]">
      {/* No-group column */}
      {(noGroupRows?.length ?? 0) > 0 && (
        <div className="w-64 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              No group ({noGroupRows?.length ?? 0})
            </h3>
          </div>
          <div className="space-y-2">
            {noGroupRows?.map((row: any) => renderCard(row))}
          </div>
        </div>
      )}

      {/* Columns from select options */}
      {columns.map((col: any) => {
        const colRows =
          rows?.filter((r: any) => r.data?.[groupProp.id] === col.id) ?? [];
        return (
          <div key={col.id} className="w-64 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    getColColorClasses(col.color)
                  )}
                >
                  {col.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {colRows.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => handleAddCard(col.id)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-2 min-h-[60px] rounded-lg p-1 bg-muted/30">
              {colRows.map(renderCard)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getColColorClasses(color: string): string {
  // All colors map to grayscale for black & white theme
  const map: Record<string, string> = {
    gray: "bg-muted text-muted-foreground",
    blue: "bg-muted text-muted-foreground",
    green: "bg-muted text-muted-foreground",
    yellow: "bg-muted text-muted-foreground",
    red: "bg-muted text-muted-foreground",
    purple: "bg-muted text-muted-foreground",
  };
  return map[color] ?? map.gray;
}
