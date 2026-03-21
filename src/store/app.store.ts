// ─────────────────────────────────────────────────────────────
// src/store/app.store.ts  — Global UI / session state
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Id } from "../../convex/_generated/dataModel";
import type { AccentColor, FontFamily, Theme } from "@/types/ui";

// ── Types ────────────────────────────────────────────────────
interface AppState {
  // ── Workspace ────────────────────────────────────────────
  currentWorkspaceId: Id<"workspaces"> | null;
  setCurrentWorkspaceId: (id: Id<"workspaces"> | null) => void;

  // ── Sidebar ──────────────────────────────────────────────
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;

  // ── Command palette ──────────────────────────────────────
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;

  // ── Theme / appearance ───────────────────────────────────
  theme: Theme;
  setTheme: (t: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (c: AccentColor) => void;
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;

  // ── Maddy ────────────────────────────────────────────────
  maddyEnabled: boolean;
  setMaddyEnabled: (v: boolean) => void;
  geminiApiKey: string;
  setGeminiApiKey: (k: string) => void;

  // ── Recent pages ─────────────────────────────────────────
  recentPageIds: Id<"pages">[];
  addRecentPage: (id: Id<"pages">) => void;

  // ── Sidebar expanded state ───────────────────────────────
  expandedPageIds: string[];
  toggleExpanded: (id: string) => void;
  setExpanded: (id: string, v: boolean) => void;
  isExpanded: (id: string) => boolean;
}

// ── Store ─────────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Workspace
      currentWorkspaceId: null,
      setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),

      // Sidebar
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // Command palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),

      // Theme
      theme: "system",
      setTheme: (t) => set({ theme: t }),
      accentColor: "violet",
      setAccentColor: (c) => set({ accentColor: c }),
      fontFamily: "default",
      setFontFamily: (f) => set({ fontFamily: f }),

      // Maddy
      maddyEnabled: true,
      setMaddyEnabled: (v) => set({ maddyEnabled: v }),
      geminiApiKey: "",
      setGeminiApiKey: (k) => set({ geminiApiKey: k }),

      // Recent
      recentPageIds: [],
      addRecentPage: (id) => {
        const current = get().recentPageIds.filter((p) => p !== id);
        set({ recentPageIds: [id, ...current].slice(0, 20) });
      },

      // Expanded sidebar items
      expandedPageIds: [],
      toggleExpanded: (id) => {
        const ids = get().expandedPageIds;
        set({
          expandedPageIds: ids.includes(id)
            ? ids.filter((i) => i !== id)
            : [...ids, id],
        });
      },
      setExpanded: (id, v) => {
        const ids = get().expandedPageIds;
        set({
          expandedPageIds: v
            ? ids.includes(id) ? ids : [...ids, id]
            : ids.filter((i) => i !== id),
        });
      },
      isExpanded: (id) => get().expandedPageIds.includes(id),
    }),
    {
      name: "madverse-app-state",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      // Only persist non-sensitive, non-function fields
      partialize: (s) => ({
        currentWorkspaceId: s.currentWorkspaceId,
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
        accentColor: s.accentColor,
        fontFamily: s.fontFamily,
        maddyEnabled: s.maddyEnabled,
        geminiApiKey: s.geminiApiKey,
        recentPageIds: s.recentPageIds,
        expandedPageIds: s.expandedPageIds,
      }),
    }
  )
);
