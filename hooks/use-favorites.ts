"use client";

import { useCallback, useSyncExternalStore } from "react";
import { FavoriteItem, FavoriteType } from "@/types";

const STORAGE_KEY = "betanalyzer-favorites";

let favorites: FavoriteItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) favorites = JSON.parse(raw);
  } catch {
    favorites = [];
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrate();
  return favorites;
}

function getServerSnapshot() {
  return favorites;
}

export function toggleFavoriteItem(item: Omit<FavoriteItem, "addedAt">) {
  hydrate();
  const exists = favorites.some((f) => f.type === item.type && f.refId === item.refId);
  if (exists) {
    favorites = favorites.filter((f) => !(f.type === item.type && f.refId === item.refId));
  } else {
    favorites = [{ ...item, addedAt: new Date().toISOString() }, ...favorites];
  }
  persist();
  emit();
}

export function removeFavoriteItem(id: string) {
  hydrate();
  favorites = favorites.filter((f) => f.id !== id);
  persist();
  emit();
}

export function useFavorites() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = useCallback(
    (type: FavoriteType, refId: string) => items.some((f) => f.type === type && f.refId === refId),
    [items]
  );

  const toggle = useCallback((item: Omit<FavoriteItem, "addedAt">) => toggleFavoriteItem(item), []);
  const remove = useCallback((id: string) => removeFavoriteItem(id), []);

  const byType = useCallback((type: FavoriteType) => items.filter((f) => f.type === type), [items]);

  return { favorites: items, isFavorite, toggle, remove, byType };
}
