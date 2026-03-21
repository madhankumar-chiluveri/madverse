"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PropertyCellProps {
  property: any;
  value: any;
  onChange: (value: any) => void;
}

export function PropertyCell({ property, value, onChange }: PropertyCellProps) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value ?? "");

  const handleBlur = () => {
    setEditing(false);
    if (localValue !== (value ?? "")) {
      onChange(localValue);
    }
  };

  switch (property.type) {
    case "title":
    case "text":
      return editing ? (
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") handleBlur();
          }}
          className="h-7 text-sm border-none shadow-none focus-visible:ring-1 px-1"
          autoFocus
        />
      ) : (
        <div
          className={cn(
            "px-1 py-0.5 rounded cursor-text hover:bg-accent/50 transition-colors min-h-[28px] flex items-center",
            property.type === "title" && "font-medium"
          )}
          onClick={() => {
            setLocalValue(value ?? "");
            setEditing(true);
          }}
        >
          {value || (
            <span className="text-muted-foreground/40">
              {property.type === "title" ? "Untitled" : "Empty"}
            </span>
          )}
        </div>
      );

    case "number":
      return editing ? (
        <Input
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") handleBlur();
          }}
          className="h-7 text-sm border-none shadow-none focus-visible:ring-1 px-1 w-28"
          autoFocus
        />
      ) : (
        <div
          className="px-1 py-0.5 rounded cursor-text hover:bg-accent/50 min-h-[28px] flex items-center text-sm"
          onClick={() => {
            setLocalValue(value ?? "");
            setEditing(true);
          }}
        >
          {value !== null && value !== undefined ? (
            Number(value).toLocaleString()
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </div>
      );

    case "select":
      const options = property.options ?? [];
      const selected = options.find((o: any) => o.id === value || o.name === value);
      return (
        <div className="relative">
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            className="text-xs px-2 py-1 rounded-full border-0 bg-transparent cursor-pointer hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-primary"
            style={{ appearance: "none" }}
          >
            <option value="">—</option>
            {options.map((opt: any) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
          {selected && (
            <span
              className={cn(
                "absolute inset-0 flex items-center px-2 text-xs rounded-full pointer-events-none",
                getSelectColorClasses(selected.color)
              )}
            >
              {selected.name}
            </span>
          )}
        </div>
      );

     case "checkbox":
       return (
         <input
           type="checkbox"
           checked={!!value}
           onChange={(e) => onChange(e.target.checked)}
           className="w-4 h-4 rounded accent-foreground cursor-pointer"
         />
       );

    case "date":
      return (
        <input
          type="date"
          value={value ? new Date(value).toISOString().split("T")[0] : ""}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).getTime() : null)}
          className="text-sm border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5 w-full cursor-pointer"
        />
      );

    case "url":
      return editing ? (
        <Input
          type="url"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") handleBlur();
          }}
          className="h-7 text-sm border-none shadow-none focus-visible:ring-1 px-1"
          autoFocus
          placeholder="https://"
        />
      ) : (
        <div
          className="px-1 py-0.5 rounded cursor-text hover:bg-accent/50 min-h-[28px] flex items-center text-sm"
          onClick={() => {
            setLocalValue(value ?? "");
            setEditing(true);
          }}
        >
          {value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline truncate max-w-[180px]"
              onClick={(e) => e.stopPropagation()}
            >
              {value}
            </a>
          ) : (
            <span className="text-muted-foreground/40">Empty</span>
          )}
        </div>
      );

    default:
      return (
        <div className="px-1 py-0.5 text-sm text-muted-foreground">
          {String(value ?? "")}
        </div>
      );
  }
}

function getSelectColorClasses(color: string): string {
  // All colors map to grayscale for black & white theme
  const map: Record<string, string> = {
    gray: "bg-muted text-muted-foreground",
    blue: "bg-muted text-muted-foreground",
    green: "bg-muted text-muted-foreground",
    yellow: "bg-muted text-muted-foreground",
    red: "bg-muted text-muted-foreground",
    purple: "bg-muted text-muted-foreground",
    pink: "bg-muted text-muted-foreground",
    orange: "bg-muted text-muted-foreground",
  };
  return map[color] ?? map.gray;
}
