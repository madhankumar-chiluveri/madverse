"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

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

  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const baseDate = new Date(Number(year), Number(month) - 1, Number(day));
    if (mode === "date") {
      return baseDate;
    }

    const timeBase = fallbackDate ?? new Date();
    const timeParts = getTimeParts(timeBase);
    return withTime(baseDate, timeParts.hour, timeParts.minute, timeParts.period);
  }

  const dateTimeMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})$/
  );
  if (dateTimeMatch) {
    const [, year, month, day, hours, minutes] = dateTimeMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes)
    );
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return mode === "date" ? withLocalDate(parsed) : parsed;
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
          "w-[320px] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto overscroll-contain border-white/10 bg-[#242321] p-2.5 text-zinc-100",
          popoverClassName
        )}
      >
        <div className="space-y-2.5">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5">
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
              placeholder={mode === "datetime" ? "Jan 20, 2026, 9:00 AM" : "Jan 20, 2026"}
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
                aria-label="Previous month"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                aria-label="Next month"
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
              root: "w-full",
              months: "w-full",
              month: "w-full",
              month_caption: "hidden",
              month_grid: "w-full border-collapse",
              weekdays: "grid grid-cols-7",
              weekday: "pb-1 text-center text-[11px] font-medium text-zinc-500",
              week: "grid grid-cols-7",
              day: "flex items-center justify-center py-0",
              day_button:
                "flex h-9 w-9 items-center justify-center rounded-lg text-[13px] text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white",
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

          {mode === "datetime" && (
            <div className="rounded-2xl border border-white/10 bg-black/10 p-2.5">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                <Clock3 className="h-3.5 w-3.5" />
                Time
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={timeParts.hour}
                  onChange={(event) => updateTimePart("hour", event.target.value.replace(/\D/g, ""))}
                  className="h-9 w-14 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-center text-sm text-zinc-100 outline-none transition-colors focus:border-white/20"
                  inputMode="numeric"
                  maxLength={2}
                />
                <span className="text-zinc-500">:</span>
                <input
                  value={timeParts.minute}
                  onChange={(event) => updateTimePart("minute", event.target.value.replace(/\D/g, ""))}
                  className="h-9 w-14 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-center text-sm text-zinc-100 outline-none transition-colors focus:border-white/20"
                  inputMode="numeric"
                  maxLength={2}
                />

                <div className="ml-auto flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1">
                  {(["AM", "PM"] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => updateTimePart("period", period)}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                        timeParts.period === period
                          ? "bg-white text-black"
                          : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
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
      </PopoverContent>
    </Popover>
  );
}
