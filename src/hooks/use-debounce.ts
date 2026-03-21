"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Returns a debounced version of fn that fires after `delay` ms of silence. */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return debounced;
}

/** Debounces a value and returns it after it has not changed for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debouncedValue;
}
