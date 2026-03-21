// ─────────────────────────────────────────────────────────────
// src/api/config/constants.ts
// ─────────────────────────────────────────────────────────────

export const API_CONFIG = {
  /** Gemini free tier — Flash 2.0 */
  GEMINI_BASE_URL:
    "https://generativelanguage.googleapis.com/v1beta",
  GEMINI_TEXT_MODEL: "models/gemini-1.5-flash-latest",
  GEMINI_EMBEDDING_MODEL: "models/text-embedding-004",

  /** Convex */
  CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL ?? "",

  /** Limits */
  MAX_EMBEDDING_CHARS: 2_000,
  MAX_TAG_COUNT: 8,
  TAG_CONFIDENCE_THRESHOLD: 60,

  /** Debounce timings (ms) */
  EDITOR_SAVE_DEBOUNCE_MS: 300,
  MADDY_AUTOTAG_DEBOUNCE_MS: 5_000,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

export const ROUTES = {
  LOGIN: "/login",
  WORKSPACE: "/workspace",
  PAGE: (id: string) => `/workspace/${id}`,
  SETTINGS: "/workspace/settings",
  TRASH: "/workspace/trash",
} as const;
