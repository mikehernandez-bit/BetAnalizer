import { CONFIDENCE_WEIGHTS, ConfidenceBreakdown, ConfidenceLevel } from "@/types";

type ConfidenceSignal = keyof typeof CONFIDENCE_WEIGHTS;

export interface ConfidenceInputs {
  recentPerformance: number;
  rivalVulnerability: number;
  homeAwayCondition: number;
  headToHead: number;
  commonOpponents: number;
  lastThreeTrend: number;
  dataQuality: number;
  /** Señales que no aplican al mercado (por ejemplo H2H en 1T) no se ponderan. */
  availableSignals?: Partial<Record<ConfidenceSignal, boolean>>;
}

export function classifyConfidence(score: number): ConfidenceLevel {
  if (score >= 80) return "muy_alta";
  if (score >= 70) return "alta";
  if (score >= 60) return "moderada";
  if (score >= 50) return "baja";
  return "evitar";
}

export const CONFIDENCE_LEVEL_LABEL: Record<ConfidenceLevel, string> = {
  muy_alta: "Muy alta",
  alta: "Alta",
  moderada: "Moderada",
  baja: "Baja",
  evitar: "Evitar",
};

export const CONFIDENCE_LEVEL_COLOR: Record<ConfidenceLevel, string> = {
  muy_alta: "text-brand-green-bright",
  alta: "text-brand-green",
  moderada: "text-brand-yellow",
  baja: "text-orange-400",
  evitar: "text-brand-red",
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Weighted confidence score per BetAnalyzer's scoring engine:
 * 30% rendimiento reciente, 25% vulnerabilidad del rival, 15% condición
 * local/visitante, 10% enfrentamientos directos, 10% rivales en común,
 * 5% tendencia últimos 3 partidos, 5% calidad de los datos.
 */
export function computeConfidenceBreakdown(inputs: ConfidenceInputs): ConfidenceBreakdown {
  const recentPerformance = clamp(inputs.recentPerformance);
  const rivalVulnerability = clamp(inputs.rivalVulnerability);
  const homeAwayCondition = clamp(inputs.homeAwayCondition);
  const headToHead = clamp(inputs.headToHead);
  const commonOpponents = clamp(inputs.commonOpponents);
  const lastThreeTrend = clamp(inputs.lastThreeTrend);
  const dataQuality = clamp(inputs.dataQuality);

  const values: Record<ConfidenceSignal, number> = {
    recentPerformance,
    rivalVulnerability,
    homeAwayCondition,
    headToHead,
    commonOpponents,
    lastThreeTrend,
    dataQuality,
  };
  const activeSignals = (Object.keys(CONFIDENCE_WEIGHTS) as ConfidenceSignal[]).filter(
    (signal) => inputs.availableSignals?.[signal] !== false
  );
  const activeWeight = activeSignals.reduce((sum, signal) => sum + CONFIDENCE_WEIGHTS[signal], 0);
  const finalScore = Math.round(
    activeSignals.reduce((sum, signal) => sum + values[signal] * CONFIDENCE_WEIGHTS[signal], 0) / activeWeight
  );

  return {
    recentPerformance,
    rivalVulnerability,
    homeAwayCondition,
    headToHead,
    commonOpponents,
    lastThreeTrend,
    dataQuality,
    finalScore: clamp(finalScore),
    classification: classifyConfidence(finalScore),
  };
}

export function dataQualityFromSampleSize(sampleSize: number): number {
  if (sampleSize >= 20) return 96;
  if (sampleSize >= 15) return 85;
  if (sampleSize >= 10) return 72;
  if (sampleSize >= 6) return 55;
  return 35;
}

export function dataQualityLabel(score: number): "alta" | "media" | "baja" {
  if (score >= 75) return "alta";
  if (score >= 50) return "media";
  return "baja";
}
