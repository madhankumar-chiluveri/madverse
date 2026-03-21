"use client";
// ─────────────────────────────────────────────────────────────
// src/context/dropdown.context.tsx
//
// Global context that tracks which dropdown is currently open
// so sibling dropdowns can self-close (one-open-at-a-time).
// ─────────────────────────────────────────────────────────────
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface DropdownContextValue {
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
  toggle: (id: string) => void;
  isOpen: (id: string) => boolean;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);
  const toggle = useCallback(
    (id: string) => setOpenId((prev) => (prev === id ? null : id)),
    []
  );
  const isOpen = useCallback((id: string) => openId === id, [openId]);

  return (
    <DropdownContext.Provider value={{ openId, open, close, toggle, isOpen }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdownContext(): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error("useDropdownContext must be used inside <DropdownProvider>");
  }
  return ctx;
}
