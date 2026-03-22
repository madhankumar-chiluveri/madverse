import { Id } from "../../convex/_generated/dataModel";

export type ReminderStatus = "scheduled" | "completed" | "cancelled";

export interface Reminder {
  _id: Id<"reminders">;
  _creationTime: number;
  userId: string;
  workspaceId: Id<"workspaces">;
  title: string;
  note?: string;
  remindAt: number;
  status: ReminderStatus;
  pageId?: Id<"pages"> | null;
  databaseId?: Id<"databases"> | null;
  rowId?: Id<"rows"> | null;
  sourceLabel?: string;
  sourceUrl?: string;
  completedAt?: number | null;
  notifiedAt?: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface ReminderSeed {
  title?: string;
  note?: string;
  remindAt?: number;
  pageId?: Id<"pages"> | null;
  databaseId?: Id<"databases"> | null;
  rowId?: Id<"rows"> | null;
  sourceLabel?: string;
  sourceUrl?: string;
}
