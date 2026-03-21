"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, MoreHorizontal } from "lucide-react";
import { PropertyCell } from "./property-cell";

interface TableViewProps {
  database: any;
  pageId: Id<"pages">;
}

export function TableView({ database, pageId }: TableViewProps) {
  const rows = useQuery(api.databases.listRows, { databaseId: database._id });
  const addRow = useMutation(api.databases.addRow);
  const updateRow = useMutation(api.databases.updateRow);
  const deleteRow = useMutation(api.databases.deleteRow);

  const [newRowLoading, setNewRowLoading] = useState(false);

  const handleAddRow = async () => {
    setNewRowLoading(true);
    try {
      const initialData: Record<string, any> = {};
      for (const prop of database.properties) {
        initialData[prop.id] = prop.type === "title" ? "Untitled" : null;
      }
      await addRow({
        databaseId: database._id,
        data: initialData,
      });
    } finally {
      setNewRowLoading(false);
    }
  };

  const handleCellChange = async (
    rowId: Id<"rows">,
    propId: string,
    value: any
  ) => {
    const row = rows?.find((r: any) => r._id === rowId);
    if (!row) return;
    await updateRow({
      id: rowId,
      data: { ...row.data, [propId]: value },
    });
  };

  const visibleProps = database.properties ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            {visibleProps.map((prop: any) => (
              <th
                key={prop.id}
                className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap"
                style={{ minWidth: prop.type === "title" ? 240 : 160 }}
              >
                {prop.name}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows === undefined ? (
            <tr>
              <td
                colSpan={visibleProps.length + 1}
                className="px-3 py-4 text-muted-foreground text-xs"
              >
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={visibleProps.length + 1}
                className="px-3 py-8 text-center text-muted-foreground text-sm"
              >
                No rows yet. Click "+ New row" to start.
              </td>
            </tr>
          ) : (
            rows.map((row: any) => (
              <tr
                key={row._id}
                className="border-b group hover:bg-accent/30 transition-colors"
              >
                {visibleProps.map((prop: any) => (
                  <td key={prop.id} className="px-3 py-1.5 align-middle">
                    <PropertyCell
                      property={prop}
                      value={row.data?.[prop.id]}
                      onChange={(val) =>
                        handleCellChange(row._id, prop.id, val)
                      }
                    />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button
                    className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition"
                    onClick={() => deleteRow({ id: row._id })}
                    title="Delete row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={visibleProps.length + 1} className="px-3 py-2">
              <button
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleAddRow}
                disabled={newRowLoading}
              >
                <Plus className="w-3.5 h-3.5" />
                {newRowLoading ? "Adding…" : "New row"}
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
