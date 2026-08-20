import type {
  RecordedMatchOutcome,
  MarketReliabilityProfile,
  ResultCalibrationProfile,
  TicketWinnerPrediction,
  TrackedBetSelection,
} from "@/types";

export const RESULT_MODEL_VERSION = "betanalyzer-result-2.0";

const SNAPSHOTS_STORAGE_KEY = "betanalyzer.prediction-snapshots.v2";
const OUTCOMES_STORAGE_KEY = "betanalyzer.recorded-outcomes.v1";
const MARKET_RELIABILITY_STORAGE_KEY = "betanalyzer.market-reliability.v2";
const MAX_CALIBRATION_MATCHES = 60;
const MIN_CALIBRATION_MATCHES = 5;

/** Foto que nunca se modifica después de guardarse antes del inicio. */
export interface PredictionSnapshot {
  matchId: string;
  modelVersion: string;
  createdAt: string;
  kickoffAt: string;
  /** Distingue una captura prepartido de una reconstruida al liquidar manualmente. */
  origin?: "pre_match" | "manual_result";
  winnerPrediction?: TicketWinnerPrediction;
  selections: TrackedBetSelection[];
}

function parseRecord<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function readPredictionSnapshots(): Record<string, PredictionSnapshot> {
  return parseRecord<PredictionSnapshot>(SNAPSHOTS_STORAGE_KEY);
}

function writePredictionSnapshots(snapshots: Record<string, PredictionSnapshot>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(snapshots));
}

/**
 * Guarda solo si el partido todavía no tenía foto. Esta inmutabilidad evita
 * que un reescaneo posterior al resultado reescriba lo que el modelo dijo.
 */
export function savePredictionSnapshot(snapshot: PredictionSnapshot): PredictionSnapshot {
  if (typeof window === "undefined") return snapshot;
  const current = readPredictionSnapshots();
  if (current[snapshot.matchId]) return current[snapshot.matchId];
  current[snapshot.matchId] = snapshot;
  writePredictionSnapshots(current);
  return snapshot;
}

export function readFeedbackOutcomes(): Record<string, RecordedMatchOutcome> {
  return parseRecord<RecordedMatchOutcome>(OUTCOMES_STORAGE_KEY);
}

function actualOutcome(outcome: RecordedMatchOutcome): "home" | "draw" | "away" {
  if (outcome.homeGoals > outcome.awayGoals) return "home";
  if (outcome.homeGoals < outcome.awayGoals) return "away";
  return "draw";
}

function predictedOutcome(prediction: TicketWinnerPrediction): "home" | "draw" | "away" {
  const options = [
    { outcome: "home" as const, probability: prediction.homeWinProbability },
    { outcome: "draw" as const, probability: prediction.drawProbability },
    { outcome: "away" as const, probability: prediction.awayWinProbability },
  ];
  return options.reduce((best, option) => option.probability > best.probability ? option : best).outcome;
}

function clampMultiplier(value: number): number {
  return Math.max(0.75, Math.min(1.25, value));
}

/**
 * Calibración bayesiana por clase 1/X/2. Solo acepta fotos creadas antes del
 * inicio y antes del registro del resultado. El prior de seis partidos por
 * clase y el límite ±25% reducen el sobreajuste con muestras pequeñas.
 */
export function buildResultCalibration(
  snapshots: Record<string, PredictionSnapshot>,
  outcomes: Record<string, RecordedMatchOutcome>,
  generatedAt = new Date().toISOString()
): ResultCalibrationProfile | undefined {
  const eligible = Object.values(snapshots)
    .filter((snapshot) => {
      const outcome = outcomes[snapshot.matchId];
      return Boolean(
        snapshot.winnerPrediction &&
        outcome &&
        (snapshot.origin === "manual_result" || snapshot.createdAt < snapshot.kickoffAt) &&
        (snapshot.origin === "manual_result" || snapshot.createdAt < outcome.recordedAt)
      );
    })
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, MAX_CALIBRATION_MATCHES);

  if (eligible.length < MIN_CALIBRATION_MATCHES) return undefined;

  const expected = { home: 0, draw: 0, away: 0 };
  const observed = { home: 0, draw: 0, away: 0 };
  let winnerHits = 0;
  let brierTotal = 0;

  for (const snapshot of eligible) {
    const prediction = snapshot.winnerPrediction!;
    const outcome = actualOutcome(outcomes[snapshot.matchId]);
    const probabilities = {
      home: prediction.homeWinProbability / 100,
      draw: prediction.drawProbability / 100,
      away: prediction.awayWinProbability / 100,
    };

    expected.home += probabilities.home;
    expected.draw += probabilities.draw;
    expected.away += probabilities.away;
    observed[outcome] += 1;
    if (predictedOutcome(prediction) === outcome) winnerHits += 1;
    brierTotal +=
      Math.pow(probabilities.home - (outcome === "home" ? 1 : 0), 2) +
      Math.pow(probabilities.draw - (outcome === "draw" ? 1 : 0), 2) +
      Math.pow(probabilities.away - (outcome === "away" ? 1 : 0), 2);
  }

  const prior = 6;
  return {
    sampleSize: eligible.length,
    winnerHits,
    winnerAccuracyRate: Math.round((winnerHits / eligible.length) * 100),
    brierScore: Number((brierTotal / eligible.length).toFixed(3)),
    homeMultiplier: Number(clampMultiplier((observed.home + prior) / (expected.home + prior)).toFixed(3)),
    drawMultiplier: Number(clampMultiplier((observed.draw + prior) / (expected.draw + prior)).toFixed(3)),
    awayMultiplier: Number(clampMultiplier((observed.away + prior) / (expected.away + prior)).toFixed(3)),
    generatedAt,
  };
}

export function readStoredResultCalibration(): ResultCalibrationProfile | undefined {
  return buildResultCalibration(readPredictionSnapshots(), readFeedbackOutcomes());
}

export interface SettledMarketFeedback {
  marketId: string;
  probability: number;
  fulfilled: boolean;
}

/**
 * Compara aciertos reales con los aciertos que prometían las probabilidades.
 * El prior y los límites evitan que cinco casos produzcan un cambio extremo.
 */
export function buildMarketReliability(rows: SettledMarketFeedback[]): MarketReliabilityProfile {
  const grouped = new Map<string, SettledMarketFeedback[]>();
  for (const row of rows) grouped.set(row.marketId, [...(grouped.get(row.marketId) ?? []), row]);

  const result: MarketReliabilityProfile = {};
  for (const [marketId, marketRows] of grouped) {
    if (marketRows.length < MIN_CALIBRATION_MATCHES) continue;
    const hits = marketRows.filter((row) => row.fulfilled).length;
    const expectedHits = marketRows.reduce((sum, row) => sum + row.probability / 100, 0);
    const prior = 4;
    const multiplier = Math.max(0.8, Math.min(1.15, (hits + prior) / (expectedHits + prior)));
    result[marketId] = {
      marketId,
      sampleSize: marketRows.length,
      hits,
      accuracyRate: Math.round((hits / marketRows.length) * 100),
      probabilityMultiplier: Number(multiplier.toFixed(3)),
    };
  }
  return result;
}

export function saveMarketReliability(profile: MarketReliabilityProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MARKET_RELIABILITY_STORAGE_KEY, JSON.stringify(profile));
}

export function readStoredMarketReliability(): MarketReliabilityProfile {
  return parseRecord(MARKET_RELIABILITY_STORAGE_KEY);
}
