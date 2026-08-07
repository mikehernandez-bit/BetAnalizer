"use client";

import { useCallback, useMemo, useState } from "react";

export function useFilters<T extends Record<string, unknown>>(initial: T) {
  const [filters, setFilters] = useState<T>(initial);

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setFilters(initial), [initial]);

  const activeCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      const initialValue = initial[key as keyof T];
      if (typeof value === "string") return value !== "" && value !== "all" && value !== initialValue;
      return Boolean(value) && value !== initialValue;
    }).length;
  }, [filters, initial]);

  return { filters, setFilter, setFilters, reset, activeCount };
}
