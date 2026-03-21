"use client";
// ─────────────────────────────────────────────────────────────
// src/hooks/use-keyboard-shortcut.ts
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef } from "react";

type Modifier = "meta" | "ctrl" | "shift" | "alt";

interface ShortcutOptions {
  /** Key to match e.g. "k", "n", "/" */
  key: string;
  modifiers?: Modifier[];
  /** Set to true to also fire on input/textarea elements */
  allowInInputs?: boolean;
  disabled?: boolean;
}

export function useKeyboardShortcut(
  opts: ShortcutOptions,
  callback: (e: KeyboardEvent) => void
): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (opts.disabled) return;

    function handler(e: KeyboardEvent) {
      const { key, modifiers = [], allowInInputs = false } = opts;

      // Block on inputs unless explicitly allowed
      if (!allowInInputs) {
        const tag = (e.target as HTMLElement)?.tagName ?? "";
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          (e.target as HTMLElement)?.isContentEditable
        ) {
          return;
        }
      }

      // Check key
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      // Check modifiers
      const metaOk =
        !modifiers.includes("meta") ||
        e.metaKey || e.ctrlKey;
      const shiftOk =
        !modifiers.includes("shift") || e.shiftKey;
      const altOk =
        !modifiers.includes("alt") || e.altKey;

      if (!metaOk || !shiftOk || !altOk) return;

      e.preventDefault();
      cbRef.current(e);
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [opts.key, opts.disabled, JSON.stringify(opts.modifiers), opts.allowInInputs]);
}
