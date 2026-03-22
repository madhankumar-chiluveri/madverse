"use client";

import { formatRelativeTime } from "@/lib/utils";
import type { Reminder } from "@/types/reminder";

const HOUR_IN_MS = 60 * 60 * 1000;

export function getDefaultReminderTimestamp(now = Date.now()) {
  return now + HOUR_IN_MS;
}

export function toDateTimeLocalValue(timestamp: number | null | undefined) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function fromDateTimeLocalValue(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function formatReminderDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function formatReminderRelative(timestamp: number) {
  return formatRelativeTime(timestamp);
}

export function getReminderBucket(reminder: Reminder, now = Date.now()) {
  if (reminder.status === "completed") {
    return "completed";
  }

  if (reminder.remindAt <= now) {
    return "overdue";
  }

  const reminderDate = new Date(reminder.remindAt);
  const today = new Date(now);

  if (
    reminderDate.getFullYear() === today.getFullYear() &&
    reminderDate.getMonth() === today.getMonth() &&
    reminderDate.getDate() === today.getDate()
  ) {
    return "today";
  }

  return "upcoming";
}
