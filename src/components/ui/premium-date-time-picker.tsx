"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock3, Sun, Sunrise } from "lucide-react";
import * as chrono from "chrono-node";
import { addDays, addHours, nextMonday, nextSaturday, setHours, startOfDay } from "date-fns";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PickerMode = "date" | "datetime";
type PickerVariant = "cell" | "input";

interface PremiumDateTimePickerProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  mode?: PickerMode;
  variant?: PickerVariant;
  placeholder?: string;
  align?: "start" | "center" | "end";
  className?: string;
  popoverClassName?: string;
  disabled?: boolean;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTriggerValue(date: Date, mode: PickerMode) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(mode === "datetime"
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function formatInputValue(date: Date | undefined, mode: PickerMode) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(mode === "datetime"
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function getTimeParts(date?: Date) {
  const base = date ?? new Date();
  const hours = base.getHours();

  return {
    hour: String((hours % 12) || 12),
    minute: pad2(base.getMinutes()),
    period: hours >= 12 ? "PM" : "AM",
  } as const;
}

function withLocalDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function withTime(date: Date, hourText: string, minuteText: string, period: "AM" | "PM") {
  const hourValue = Number(hourText);
  const minuteValue = Number(minuteText);
  const safeHour = Number.isFinite(hourValue) ? Math.min(12, Math.max(1, hourValue)) : 12;
  const safeMinute = Number.isFinite(minuteValue) ? Math.min(59, Math.max(0, minuteValue)) : 0;
  const normalizedHour = (safeHour % 12) + (period === "PM" ? 12 : 0);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    normalizedHour,
    safeMinute
  );
}

function parseManualInput(
  input: string,
  mode: PickerMode,
  fallbackDate?: Date
): Date | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const parsedDate = chrono.parseDate(trimmed, fallbackDate ?? new Date(), { forwardDate: true });
  
  if (parsedDate) {
    return mode === "date" ? withLocalDate(parsedDate) : parsedDate;
  }

  return null;
}

export function PremiumDateTimePicker({
  value,
  onChange,
  mode = "date",
  variant = "cell",
  placeholder = "Empty",
  align = "start",
  className,
  popoverClassName,
  disabled = false,
}: PremiumDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(
    () => (value === null || value === undefined ? undefined : new Date(value)),
    [value]
  );
  const [month, setMonth] = useState<Date>(selectedDate ?? new Date());
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setMonth(selectedDate ?? new Date());
    setManualInput(formatInputValue(selectedDate, mode));
  }, [mode, open, selectedDate]);

  const timeParts = getTimeParts(selectedDate);

  const updateValue = (nextDate: Date | null) => {
    onChange(nextDate ? nextDate.getTime() : null);
    setManualInput(formatInputValue(nextDate ?? undefined, mode));
    if (nextDate) {
      setMonth(nextDate);
    }
  };

  const handleDateSelect = (day?: Date) => {
    if (!day) return;

    if (mode === "date") {
      updateValue(withLocalDate(day));
      return;
    }

    const nextBase = withLocalDate(day);
    updateValue(withTime(nextBase, timeParts.hour, timeParts.minute, timeParts.period));
  };

  const handleManualCommit = () => {
    if (!manualInput.trim()) {
      updateValue(null);
      return;
    }

    const parsed = parseManualInput(manualInput, mode, selectedDate);
    if (parsed) {
      updateValue(parsed);
      setOpen(false);
    } else {
      setManualInput(formatInputValue(selectedDate, mode));
    }
  };

  const updateTimePart = (
    part: "hour" | "minute" | "period",
    nextValue: string | "AM" | "PM"
  ) => {
    const baseDate = selectedDate ?? new Date();
    const dateOnly = withLocalDate(baseDate);
    const nextHour = part === "hour" ? String(nextValue) : timeParts.hour;
    const nextMinute = part === "minute" ? String(nextValue) : timeParts.minute;
    const nextPeriod = part === "period" ? (nextValue as "AM" | "PM") : timeParts.period;

    updateValue(withTime(dateOnly, nextHour, nextMinute, nextPeriod));
  };

  const triggerClasses =
    variant === "input"
      ? "flex h-10 w-full items-center gap-3 rounded-xl border border-white/10 bg-[#181715] px-3 text-left text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:bg-[#1d1c1a] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/15"
      : "flex min-h-[38px] items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/10";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            triggerClasses,
            !selectedDate && "text-zinc-500",
            disabled && "cursor-not-allowed opacity-60",
            className
          )}
        >
          <CalendarDays
            className={cn(
              "shrink-0 text-zinc-500",
              variant === "input" ? "h-4 w-4" : "h-3.5 w-3.5"
            )}
          />
          <span className="min-w-0 truncate">
            {selectedDate ? formatTriggerValue(selectedDate, mode) : placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={6}
        className={cn(
          "w-auto max-h-[var(--radix-popover-content-available-height)] flex flex-col overflow-hidden border-white/10 bg-[#242321] p-0 shadow-2xl text-zinc-100",
          popoverClassName
        )}
      >
        <div className="flex bg-[#242321]">
          {/* Left Column */}
          <div className="flex w-[290px] flex-col p-3 border-r border-white/5 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 focus-within:border-white/20 focus-within:bg-white/[0.06] transition-colors">
              <input
                value={manualInput}
                onChange={(event) => setManualInput(event.target.value)}
                onBlur={handleManualCommit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleManualCommit();
                  }
                  if (event.key === "Escape") {
                    setManualInput(formatInputValue(selectedDate, mode));
                    setOpen(false);
                  }
                }}
                placeholder={mode === "datetime" ? "e.g., Tomorrow at 3pm" : "e.g., Next Friday"}
                className="w-full bg-transparent text-sm font-medium text-zinc-100 outline-none placeholder:text-zinc-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="text-sm font-semibold text-zinc-100">
                {formatMonthLabel(month)}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDateSelect(new Date())}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={month}
              onMonthChange={setMonth}
              hideNavigation
              showOutsideDays
              className="premium-day-picker"
              classNames={{
                root: "w-full outline-none",
                months: "w-full outline-none",
                month: "w-full outline-none",
                month_caption: "hidden",
                month_grid: "w-full border-collapse",
                weekdays: "grid grid-cols-7",
                weekday: "pb-1 text-center text-[11px] font-medium text-zinc-500",
                week: "grid grid-cols-7",
                day: "flex items-center justify-center py-0",
                day_button:
                  "flex h-9 w-9 outline-none items-center justify-center rounded-lg text-[13px] text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white",
                selected: "text-white",
                today: "font-semibold text-zinc-100",
                outside: "text-zinc-600",
                disabled: "opacity-40",
              }}
              modifiersClassNames={{
                selected: "[&>button]:bg-[#2b84df] [&>button]:font-semibold [&>button]:text-white",
                today: "[&>button]:border [&>button]:border-white/10",
                outside: "[&>button]:text-zinc-600",
              }}
            />

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  updateValue(null);
                  setOpen(false);
                }}
                className="text-[13px] text-zinc-500 transition-colors hover:text-white"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Done
              </button>
            </div>
          </div>

          {/* Right Column Options */}
          <div className="flex w-[220px] max-h-[440px] flex-col p-3 bg-white/[0.01]">
            <div className="mb-4 flex flex-col gap-1">
              <div className="mb-1.5 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">PRESETS</div>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  updateValue(mode === "datetime" ? addHours(now, 3) : now);
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <Clock3 className="h-3.5 w-3.5 text-blue-400" />
                Later Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = addDays(new Date(), 1);
                  updateValue(mode === "datetime" ? setHours(startOfDay(tomorrow), 9) : tomorrow);
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <Sunrise className="h-3.5 w-3.5 text-orange-400" />
                Tomorrow Morning
              </button>
              <button
                type="button"
                onClick={() => {
                  const thisWeekend = nextSaturday(new Date());
                  updateValue(mode === "datetime" ? setHours(startOfDay(thisWeekend), 10) : thisWeekend);
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                This Weekend
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextWeek = nextMonday(new Date());
                  updateValue(mode === "datetime" ? setHours(startOfDay(nextWeek), 9) : nextWeek);
                  setOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                Next Week
              </button>
            </div>

            {mode === "datetime" && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="mb-1.5 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">TIME</div>
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                  <div className="flex flex-col gap-0.5 pb-2">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const h = Math.floor(i / 2);
                      const m = (i % 2) * 30;
                      const isPM = h >= 12;
                      const dispH = h === 0 ? 12 : h > 12 ? h - 12 : h;
                      const dispM = m === 0 ? "00" : "30";
                      const label = `${dispH}:${dispM} ${isPM ? "PM" : "AM"}`;
                      const isSelected = selectedDate?.getHours() === h && selectedDate?.getMinutes() === m;
                      
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const base = selectedDate ?? new Date();
                            const newDate = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m);
                            updateValue(newDate);
                          }}
                          className={cn(
                            "flex items-center justify-between rounded-md px-2.5 py-1.5 text-[12px] transition-colors",
                            isSelected 
                              ? "bg-[#2b84df]/20 text-[#2b84df] font-semibold" 
                              : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100 font-medium"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
