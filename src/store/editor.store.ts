// ─────────────────────────────────────────────────────────────
// src/store/editor.store.ts  — per-page editor transient state
// ─────────────────────────────────────────────────────────────
import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

interface EditorState {
  // Tracks which page is actively being edited
  activePageId: Id<"pages"> | null;
  setActivePageId: (id: Id<"pages"> | null) => void;

  // Unsaved / dirty flag
  isDirty: boolean;
  setDirty: (v: boolean) => void;

  // Saving spinner
  isSaving: boolean;
  setSaving: (v: boolean) => void;

  // Save status for top bar display
  saveStatus: "idle" | "saving" | "saved" | "error";
  setSaveStatus: (s: "idle" | "saving" | "saved" | "error") => void;

  // Selected block IDs (for multi-select)
  selectedBlockIds: string[];
  setSelectedBlockIds: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  activePageId: null,
  setActivePageId: (id) => set({ activePageId: id }),

  isDirty: false,
  setDirty: (v) => set({ isDirty: v }),

  isSaving: false,
  setSaving: (v) => set({ isSaving: v }),

  saveStatus: "idle",
  setSaveStatus: (s) => set({ saveStatus: s }),

  selectedBlockIds: [],
  setSelectedBlockIds: (ids) => set({ selectedBlockIds: ids }),
  clearSelection: () => set({ selectedBlockIds: [] }),
}));
