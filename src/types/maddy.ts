// ─────────────────────────────────────────────────────────────
// src/types/maddy.ts
// ─────────────────────────────────────────────────────────────
import { Id } from "../../convex/_generated/dataModel";

export type MaddyCommand =
  | "explain"
  | "rewrite"
  | "continue"
  | "brainstorm"
  | "translate"
  | "summarise"
  | "tasks";

export interface MaddyTag {
  label: string;
  confidence: number;        // 0-100
  suggested: boolean;        // true = dashed-border (low confidence)
}

export interface MaddyOrganiseSuggestion {
  type: "move" | "rename" | "merge";
  pageId: Id<"pages">;
  pageTitle: string;
  newParentId?: Id<"pages"> | null;
  newTitle?: string;
  description: string;
  reason: string;
}

export interface MaddyEmbedding {
  _id: Id<"maddyEmbeddings">;
  pageId: Id<"pages">;
  vector: number[];
  contentHash: string;
  updatedAt: number;
}

export interface MaddyInlineCommandInput {
  command: MaddyCommand;
  text: string;
  context?: string;
  targetLanguage?: string;
  geminiApiKey: string;
}
