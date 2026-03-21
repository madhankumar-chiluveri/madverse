"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyCell } from "./property-cell";

interface ListViewProps {
  database: any;
  pageId: Id<"pages">;
}

export function ListView({ database, pageId }: ListViewProps) {
  const rows = useQuery(api.databases.listRows, { databaseId: database._id });
  const addRow = useMutation(api.databases.addRow);
  const updateRow = useMutation(api.databases.updateRow);
  const deleteRow = useMutation(api.databases.deleteRow);

  const titleProp = database.properties?.find((p: any) => p.type === "title");
  const secondaryProps = database.properties?.filter(
    (p: any) => p.type !== "title"
  ) ?? [];

  const handleAddRow = async () => {
    const initialData: Record<string, any> = {};
    for (const prop of database.properties) {
      initialData[prop.id] = prop.type === "title" ? "Untitled" : null;
    }
    await addRow({ databaseId: database._id, data: initialData });
  };

  return (
    <div className="space-y-1 pt-2">
      {rows === undefined ? (
        <p className="text-muted-foreground text-sm py-4">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No items yet.
        </p>
      ) : (
        rows.map((row: any) => (
          <div
            key={row._id}
            className="flex items-start gap-4 px-2 py-2 rounded-lg hover:bg-accent/30 group transition-colors border-b last:border-b-0"
          >
            {/* Title */}
            <div className="flex-1 min-w-0">
              {titleProp ? (
                <PropertyCell
                  property={titleProp}
                  value={row.data?.[titleProp.id]}
                  onChange={(val) =>
                    updateRow({
                      id: row._id,
                      data: { ...row.data, [titleProp.id]: val },
                    })
                  }
                />
              ) : (
                <span className="text-sm font-medium">Row</span>
              )}
            </div>

            {/* Secondary props */}
            <div className="flex items-center gap-3 flex-wrap">
              {secondaryProps.slice(0, 4).map((prop: any) => (
                <PropertyCell
                  key={prop.id}
                  property={prop}
                  value={row.data?.[prop.id]}
                  onChange={(val) =>
                    updateRow({
                      id: row._id,
                      data: { ...row.data, [prop.id]: val },
                    })
                  }
                />
              ))}
            </div>

            {/* Delete */}
            <button
              className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
              onClick={() => deleteRow({ id: row._id })}
            >
              ×
            </button>
          </div>
        ))
      )}

      <button
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
        onClick={handleAddRow}
      >
        <Plus className="w-3.5 h-3.5" />
        New item
      </button>
    </div>
  );
}
