import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getVenueConditionTag(text: string): { label: string; isHome: boolean } | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("como visitante") || lower.includes("de visitante") || lower.includes("(fuera)") || lower.includes("fuera de casa")) {
    return { label: "Condición: Visitante", isHome: false };
  }
  if (lower.includes("como local") || lower.includes("de local") || lower.includes("(en casa)") || lower.includes("en casa")) {
    return { label: "Condición: Local", isHome: true };
  }
  return null;
}
