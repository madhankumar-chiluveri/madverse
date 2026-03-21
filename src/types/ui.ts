// ── UI types ──────────────────────────────────────────────────────────────
export type Theme = "light" | "dark" | "system";
export type AccentColor = "violet" | "indigo" | "rose" | "amber" | "emerald" | "sky";
export type FontFamily = "default" | "serif" | "mono";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}
