import { SavedAnalysis } from "@/types";

/**
 * Historial de análisis guardados. Se completa a medida que los partidos
 * reales cargados en el sistema se juegan y se registra si el mercado
 * analizado se cumplió o no — por ahora no hay ninguno finalizado.
 */
export const savedAnalyses: SavedAnalysis[] = [];

export function getSavedAnalysisById(id: string): SavedAnalysis | undefined {
  return savedAnalyses.find((a) => a.id === id);
}

export function getRecentSavedAnalyses(count = 6): SavedAnalysis[] {
  return savedAnalyses.slice(0, count);
}
