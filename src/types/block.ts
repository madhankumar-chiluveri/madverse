// ─────────────────────────────────────────────────────────────
// src/types/block.ts
// ─────────────────────────────────────────────────────────────
import { Id } from "../../convex/_generated/dataModel";

export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bullet_list"
  | "numbered_list"
  | "todo"
  | "toggle"
  | "code"
  | "quote"
  | "divider"
  | "callout"
  | "image"
  | "embed"
  | "file"
  // BlockNote native types
  | "heading"
  | "bulletListItem"
  | "numberedListItem"
  | "checkListItem"
  | "codeBlock"
  | "table";

export interface Block {
  _id: Id<"blocks">;
  _creationTime: number;
  pageId: Id<"pages">;
  type: BlockType | string;
  content: BlockNoteContent | unknown;
  parentBlockId: Id<"blocks"> | null;
  sortOrder: number;
  properties: Record<string, unknown>;
  updatedAt: number;
}

/** Serialised BlockNote document node stored in Convex */
export interface BlockNoteContent {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
  content?: unknown[];
  children?: BlockNoteContent[];
}

export interface ConvexBlock {
  type: string;
  content: BlockNoteContent;
  sortOrder: number;
  properties?: Record<string, unknown>;
}
