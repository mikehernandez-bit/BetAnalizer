import { ValueLevel } from "@/types";

/** probabilidadImplícita = 100 / cuota */
export function impliedProbability(decimalOdds: number): number {
  if (!decimalOdds || decimalOdds <= 1) return 0;
  return Math.round((100 / decimalOdds) * 100) / 100;
}

export function valueDifference(statisticalEstimate: number, decimalOdds: number): number {
  const implied = impliedProbability(decimalOdds);
  return Math.round((statisticalEstimate - implied) * 100) / 100;
}

export function classifyValue(diff: number): ValueLevel {
  if (diff <= 0) return "sin_valor";
  if (diff < 6) return "valor_leve";
  if (diff < 14) return "valor_moderado";
  return "valor_alto";
}

export const VALUE_LEVEL_LABEL: Record<ValueLevel, string> = {
  sin_valor: "Sin valor",
  valor_leve: "Valor leve",
  valor_moderado: "Valor moderado",
  valor_alto: "Valor alto",
};

export const VALUE_LEVEL_COLOR: Record<ValueLevel, string> = {
  sin_valor: "text-muted-foreground",
  valor_leve: "text-brand-blue",
  valor_moderado: "text-brand-yellow",
  valor_alto: "text-brand-green-bright",
};

/** Simple, clearly-labelled estimate of P(stat total > threshold) from a mean/spread — not a real probabilistic model. */
export function probabilityAboveThreshold(estimatedMean: number, spread: number, threshold: number): number {
  const safeSpread = Math.max(1, spread);
  const z = (estimatedMean - threshold) / safeSpread;
  const p = 1 / (1 + Math.exp(-1.7 * z));
  return Math.round(Math.min(96, Math.max(4, p * 100)));
}
