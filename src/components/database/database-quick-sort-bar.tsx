"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  MoveDown,
  MoveUp,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PropertySchema, SortRule } from "@/types/database";
import { getPropertyIcon } from "./database-utils";

interface DatabaseQuickSortBarProps {
  className?: string;
  properties: PropertySchema[];
  sortRules: SortRule[];
  open: boolean;
  hasPendingChanges: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (updater: (current: SortRule[]) => SortRule[]) => void;
  onReset: () => void;
  onSave: () => void;
}

function formatSortChipLabel(property: PropertySchema, rule: SortRule) {
  return `${property.name} ${rule.direction === "asc" ? "ascending" : "descending"}`;
}

export function DatabaseQuickSortBar({
  className,
  properties,
  sortRules,
  open,
  hasPendingChanges,
  onOpenChange,
  onChange,
  onReset,
  onSave,
}: DatabaseQuickSortBarProps) {
  const [addSortOpen, setAddSortOpen] = useState(false);
  const [editingSortIndex, setEditingSortIndex] = useState<number | null>(null);

  const showBar = open || sortRules.length > 0 || hasPendingChanges;

  useEffect(() => {
    if (!showBar) {
      setAddSortOpen(false);
      setEditingSortIndex(null);
    }
  }, [showBar]);

  useEffect(() => {
    if (editingSortIndex !== null && editingSortIndex >= sortRules.length) {
      setEditingSortIndex(null);
    }
  }, [editingSortIndex, sortRules.length]);

  const updateSortRule = (index: number, updater: (current: SortRule) => SortRule) => {
    onChange((current) =>
      current.map((rule, ruleIndex) => (ruleIndex === index ? updater(rule) : rule))
    );
  };

  const removeSortRule = (index: number) => {
    onChange((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
    setEditingSortIndex((current) => {
      if (current === null) return current;
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
  };

  const moveSortRule = (index: number, direction: "up" | "down") => {
    onChange((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [rule] = next.splice(index, 1);
      next.splice(targetIndex, 0, rule);
      return next;
    });

    setEditingSortIndex((current) => {
      if (current !== index) {
        return current;
      }
      return direction === "up" ? index - 1 : index + 1;
    });
  };

  const addSortForProperty = (propertyId: string) => {
    const nextIndex = sortRules.length;

    onChange((current) => [
      ...current,
      {
        propertyId,
        direction: "asc",
      },
    ]);

    onOpenChange(true);
    setAddSortOpen(false);
    setEditingSortIndex(nextIndex);
  };

  if (!showBar) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-[18px] border border-white/8 bg-[#100f0d]/72 px-2.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-sm",
        className
      )}
    >
      {sortRules.length === 0 ? (
        <div className="flex min-h-10 items-center px-1 text-sm text-zinc-500">
          Quick sorts stay local to this view until you save them.
        </div>
      ) : (
        sortRules.map((rule, index) => {
          const property = properties.find((candidate) => candidate.id === rule.propertyId);
          if (!property) {
            return null;
          }

          return (
            <Popover
              key={`${rule.propertyId}-${index}`}
              open={editingSortIndex === index}
              onOpenChange={(nextOpen) => setEditingSortIndex(nextOpen ? index : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 max-w-full items-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-3 text-sm text-zinc-100 transition-colors hover:bg-white/[0.08]"
                >
                  {sortRules.length > 1 ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-semibold text-zinc-300">
                      {index + 1}
                    </span>
                  ) : null}
                  <span className="text-zinc-400">{getPropertyIcon(property.type)}</span>
                  <span className="truncate">{formatSortChipLabel(property, rule)}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(92vw,360px)] p-0">
                <div className="border-b border-white/8 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Quick sort
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-100">Edit sort rule</div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Property
                    </div>
                    <Select
                      value={rule.propertyId}
                      onValueChange={(propertyId) =>
                        updateSortRule(index, (current) => ({
                          ...current,
                          propertyId,
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 focus:ring-white/15">
                        <SelectValue placeholder="Property" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#191816] text-zinc-100">
                        {properties.map((propertyOption) => (
                          <SelectItem key={propertyOption.id} value={propertyOption.id}>
                            {propertyOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Direction
                    </div>
                    <Select
                      value={rule.direction}
                      onValueChange={(value) =>
                        updateSortRule(index, (current) => ({
                          ...current,
                          direction: value as SortRule["direction"],
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 focus:ring-white/15">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#191816] text-zinc-100">
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {sortRules.length > 1 ? (
                    <div className="space-y-2">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Priority
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveSortRule(index, "up")}
                          disabled={index === 0}
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                          Move earlier
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSortRule(index, "down")}
                          disabled={index === sortRules.length - 1}
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                          Move later
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between border-t border-white/8 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeSortRule(index)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-red-300 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete sort
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSortIndex(null)}
                    className="h-9 rounded-xl text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          );
        })
      )}

      <Popover open={addSortOpen} onOpenChange={setAddSortOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-3 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Sort
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[280px] p-2">
          <div className="px-2 pb-2 pt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Add a quick sort
          </div>
          <div className="max-h-[280px] space-y-1 overflow-y-auto pr-1">
            {properties.map((property) => (
              <button
                key={property.id}
                type="button"
                onClick={() => addSortForProperty(property.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <span className="text-zinc-500">{getPropertyIcon(property.type)}</span>
                <span className="min-w-0 flex-1 truncate">{property.name}</span>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <ArrowUpDown className="h-3 w-3" />
                  asc
                </span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onReset}
          disabled={!hasPendingChanges}
          className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!hasPendingChanges}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.04] disabled:text-zinc-500"
        >
          <Save className="h-3.5 w-3.5" />
          Save sort
        </button>
      </div>
    </div>
  );
}
