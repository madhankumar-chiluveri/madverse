"use client";
// ─────────────────────────────────────────────────────────────
// src/hooks/use-outside-click.ts
// ─────────────────────────────────────────────────────────────
import { useEffect, RefObject } from "react";

export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    function handler(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, callback, enabled]);
}
