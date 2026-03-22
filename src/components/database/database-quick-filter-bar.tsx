"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Filter, Plus, RotateCcw, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterCondition, FilterGroup, PropertySchema } from "@/types/database";
import {
  filterOperatorNeedsValue,
  getDefaultFilterOperator,
  getDefaultFilterValue,
  getFilterOperatorOptions,
  getFormulaConfig,
  getPropertyIcon,
  getPropertyOptions,
  supportsOptions,
} from "./database-utils";

const NONE_VALUE = "__none";

interface DatabaseQuickFilterBarProps {
  className?: string;
  properties: PropertySchema[];
  filterGroup: FilterGroup;
  open: boolean;
  hasPendingChanges: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (updater: (current: FilterGroup) => FilterGroup) => void;
  onReset: () => void;
  onSave: () => void;
}

function FilterValueEditor({
  property,
  condition,
  onValueChange,
}: {
  property: PropertySchema;
  condition: FilterCondition;
  onValueChange: (value: string) => void;
}) {
  if (!filterOperatorNeedsValue(condition.operator)) {
    return null;
  }

  if (property.type === "checkbox") {
    return (
      <Select value={String(condition.value ?? "true")} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 focus:ring-white/15">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-[#191816] text-zinc-100">
          <SelectItem value="true">Checked</SelectItem>
          <SelectItem value="false">Unchecked</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (supportsOptions(property.type)) {
    const options = getPropertyOptions(property);

    return (
      <Select
        value={String(condition.value || NONE_VALUE)}
        onValueChange={(value) => onValueChange(value === NONE_VALUE ? "" : value)}
      >
        <SelectTrigger className="h-10 w-full rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 focus:ring-white/15">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-[#191816] text-zinc-100">
          <SelectItem value={NONE_VALUE}>
            {options.length > 0 ? "Select value" : "No options yet"}
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const formulaType = property.type === "formula" ? getFormulaConfig(property).resultType : undefined;
  const isDateLike =
    property.type === "date" ||
    property.type === "created_time" ||
    formulaType === "date";
  const isNumberLike = property.type === "number" || formulaType === "number";

  return (
    <Input
      type={isDateLike ? "date" : isNumberLike ? "number" : "text"}
      value={String(condition.value ?? "")}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={isDateLike ? "Pick a date" : isNumberLike ? "Enter a number" : "Type a value"}
      className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-white/15"
    />
  );
}

function formatFilterValueLabel(property: PropertySchema, condition: FilterCondition) {
  if (!filterOperatorNeedsValue(condition.operator)) {
    return "";
  }

  if (property.type === "checkbox") {
    return condition.value === "true" || condition.value === true ? "Checked" : "Unchecked";
  }

  if (supportsOptions(property.type)) {
    return (
      getPropertyOptions(property).find((option) => option.id === condition.value)?.label ??
      String(condition.value ?? "")
    );
  }

  const isDateLike =
    property.type === "date" ||
    property.type === "created_time" ||
    (property.type === "formula" && getFormulaConfig(property).resultType === "date");

  if (isDateLike && condition.value) {
    const timestamp = new Date(String(condition.value)).getTime();
    if (!Number.isNaN(timestamp)) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(timestamp));
    }
  }

  return String(condition.value ?? "");
}

function buildFilterChipLabel(property: PropertySchema, condition: FilterCondition) {
  const operatorLabel =
    getFilterOperatorOptions(property).find((option) => option.value === condition.operator)?.label ??
    condition.operator;
  const valueLabel = formatFilterValueLabel(property, condition);

  return {
    operatorLabel,
    valueLabel,
    text: valueLabel ? `${property.name} ${operatorLabel} ${valueLabel}` : `${property.name} ${operatorLabel}`,
  };
}

export function DatabaseQuickFilterBar({
  className,
  properties,
  filterGroup,
  open,
  hasPendingChanges,
  onOpenChange,
  onChange,
  onReset,
  onSave,
}: DatabaseQuickFilterBarProps) {
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [logicOpen, setLogicOpen] = useState(false);
  const [editingFilterIndex, setEditingFilterIndex] = useState<number | null>(null);

  const showBar = open || filterGroup.conditions.length > 0 || hasPendingChanges;

  useEffect(() => {
    if (!showBar) {
      setAddFilterOpen(false);
      setLogicOpen(false);
      setEditingFilterIndex(null);
    }
  }, [showBar]);

  useEffect(() => {
    if (editingFilterIndex !== null && editingFilterIndex >= filterGroup.conditions.length) {
      setEditingFilterIndex(null);
    }
  }, [editingFilterIndex, filterGroup.conditions.length]);

  const updateCondition = (index: number, updater: (current: FilterCondition) => FilterCondition) => {
    onChange((current) => ({
      ...current,
      conditions: current.conditions.map((condition, conditionIndex) =>
        conditionIndex === index ? updater(condition) : condition
      ),
    }));
  };

  const removeCondition = (index: number) => {
    onChange((current) => ({
      ...current,
      conditions: current.conditions.filter((_, conditionIndex) => conditionIndex !== index),
    }));
    setEditingFilterIndex((current) => {
      if (current === null) return current;
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
  };

  const addConditionForProperty = (propertyId: string) => {
    const property = properties.find((candidate) => candidate.id === propertyId);
    if (!property) return;

    const nextOperator = getDefaultFilterOperator(property);
    const nextIndex = filterGroup.conditions.length;

    onChange((current) => ({
      ...current,
      conditions: [
        ...current.conditions,
        {
          propertyId,
          operator: nextOperator,
          value: getDefaultFilterValue(property, nextOperator),
        },
      ],
    }));

    onOpenChange(true);
    setAddFilterOpen(false);
    setEditingFilterIndex(nextIndex);
  };

  const setFilterOperator = (operator: FilterGroup["operator"]) => {
    onChange((current) => (current.operator === operator ? current : { ...current, operator }));
    setLogicOpen(false);
  };

  if (!showBar) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-[18px] border border-white/8 bg-[#100f0d]/80 px-2.5 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-sm",
        className
      )}
    >
      {filterGroup.conditions.length > 1 ? (
        <Popover open={logicOpen} onOpenChange={setLogicOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <Filter className="h-3.5 w-3.5 text-zinc-500" />
              <span>{filterGroup.operator === "and" ? "All filters" : "Any filter"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[280px] p-2">
            <button
              type="button"
              onClick={() => setFilterOperator("and")}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]",
                filterGroup.operator === "and" && "bg-white/[0.06]"
              )}
            >
              <span className="mt-0.5 flex h-4 w-4 items-center justify-center text-zinc-500">
                {filterGroup.operator === "and" ? <Check className="h-3.5 w-3.5 text-sky-300" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-zinc-100">Match all filters</span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  Rows must satisfy every quick filter.
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterOperator("or")}
              className={cn(
                "mt-1 flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]",
                filterGroup.operator === "or" && "bg-white/[0.06]"
              )}
            >
              <span className="mt-0.5 flex h-4 w-4 items-center justify-center text-zinc-500">
                {filterGroup.operator === "or" ? <Check className="h-3.5 w-3.5 text-sky-300" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-zinc-100">Match any filter</span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  Rows can satisfy just one quick filter.
                </span>
              </span>
            </button>
          </PopoverContent>
        </Popover>
      ) : null}

      {filterGroup.conditions.length === 0 ? (
        <div className="flex min-h-10 items-center px-1 text-sm text-zinc-500">
          Quick filters stay local to this view until you save them.
        </div>
      ) : (
        filterGroup.conditions.map((condition, index) => {
          const property = properties.find((candidate) => candidate.id === condition.propertyId);
          if (!property) {
            return null;
          }

          const label = buildFilterChipLabel(property, condition);
          const isValuePending = filterOperatorNeedsValue(condition.operator) && !label.valueLabel;

          return (
            <Popover
              key={`${condition.propertyId}-${index}`}
              open={editingFilterIndex === index}
              onOpenChange={(nextOpen) => setEditingFilterIndex(nextOpen ? index : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-10 max-w-full items-center gap-2 rounded-xl border px-3 text-sm transition-colors",
                    isValuePending
                      ? "border-amber-500/25 bg-amber-500/10 text-amber-100"
                      : "border-sky-500/25 bg-sky-500/12 text-sky-100 hover:bg-sky-500/16"
                  )}
                >
                  <span className="text-current/85">{getPropertyIcon(property.type)}</span>
                  <span className="truncate">{label.text}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-current/70" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(92vw,360px)] p-0">
                <div className="border-b border-white/8 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    Quick filter
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-100">Edit filter</div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Property
                    </div>
                    <Select
                      value={condition.propertyId}
                      onValueChange={(propertyId) => {
                        const nextProperty = properties.find((candidate) => candidate.id === propertyId);
                        if (!nextProperty) return;

                        const nextOperator = getDefaultFilterOperator(nextProperty);
                        updateCondition(index, () => ({
                          propertyId,
                          operator: nextOperator,
                          value: getDefaultFilterValue(nextProperty, nextOperator),
                        }));
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 focus:ring-white/15">
                        <SelectValue placeholder="Property" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#191816] text-zinc-100">
                        {properties.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Condition
                    </div>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => {
                        const nextOperator = value as FilterCondition["operator"];
                        updateCondition(index, (current) => ({
                          ...current,
                          operator: nextOperator,
                          value: getDefaultFilterValue(property, nextOperator),
                        }));
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl border-white/10 bg-white/[0.03] text-zinc-100 focus:ring-white/15">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#191816] text-zinc-100">
                        {getFilterOperatorOptions(property).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Value
                    </div>
                    {filterOperatorNeedsValue(condition.operator) ? (
                      <FilterValueEditor
                        property={property}
                        condition={condition}
                        onValueChange={(value) =>
                          updateCondition(index, (current) => ({
                            ...current,
                            value,
                          }))
                        }
                      />
                    ) : (
                      <div className="flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-500">
                        This condition does not need a value.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/8 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-red-300 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete filter
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingFilterIndex(null)}
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

      <Popover open={addFilterOpen} onOpenChange={setAddFilterOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-3 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Filter
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[280px] p-2">
          <div className="px-2 pb-2 pt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Add a quick filter
          </div>
          <div className="max-h-[280px] space-y-1 overflow-y-auto pr-1">
            {properties.map((property) => (
              <button
                key={property.id}
                type="button"
                onClick={() => addConditionForProperty(property.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <span className="text-zinc-500">{getPropertyIcon(property.type)}</span>
                <span className="min-w-0 flex-1 truncate">{property.name}</span>
                <span className="text-xs text-zinc-500">{property.type.replace("_", " ")}</span>
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
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/14 px-3 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.04] disabled:text-zinc-500"
        >
          <Save className="h-3.5 w-3.5" />
          Save view
        </button>
      </div>
    </div>
  );
}
