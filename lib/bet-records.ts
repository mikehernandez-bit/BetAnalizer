import {
  AnalysisStatus,
  BetSelectionStatus,
  MarketCategory,
  MarketEvaluation,
  Match,
  MatchStatus,
  PredictedWinner,
  RecordedMatchOutcome,
  Team,
  TicketTier,
  TicketWinnerPrediction,
  TrackedBetSelection,
  TrackedTicket,
  TrackedTicketMatch,
} from "@/types";
import { GeneratedTicket, TicketMatchResultSummary } from "@/services/ticket-generator-service";
import { matches } from "@/data/matches";
import { getTeamById } from "@/data/teams";
import { competitions } from "@/data/competitions";
import { defaultAnalysisConfig, generateAnalysis } from "@/services/analysis-service";
import {
  buildResultCalibration,
  buildMarketReliability,
  PredictionSnapshot,
  readPredictionSnapshots,
  RESULT_MODEL_VERSION,
  saveMarketReliability,
  savePredictionSnapshot,
} from "@/lib/model-feedback";
import defaultFootballOutcomes from "@/data/football-recorded-outcomes.json";

const STORAGE_KEY = "betanalyzer.tracked-tickets.v1";
const OUTCOMES_STORAGE_KEY = "betanalyzer.recorded-outcomes.v1";
const MODEL_VERSION = RESULT_MODEL_VERSION;

export type SettlementCheck = { fulfilled: boolean; note: string };

function idFor(prefix: string): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${uuid}`;
}

function lineFromId(value: string): number | undefined {
  const match = value.match(/_(\d+)$/);
  return match ? Number(match[1]) / 10 : undefined;
}

function overUnder(value: number, marketId: string): boolean | undefined {
  const line = lineFromId(marketId);
  if (line === undefined) return undefined;
  if (marketId.includes("over_") || marketId.includes("_over")) return value > line;
  if (marketId.includes("under_") || marketId.includes("_under")) return value < line;
  return undefined;
}

function finalResult(home: number, away: number, marketId: string): boolean | undefined {
  const diff = home - away;
  const values: Record<string, boolean> = {
    result_home_win: diff > 0,
    result_draw: diff === 0,
    result_away_win: diff < 0,
    result_dc_home: diff >= 0,
    result_dc_away: diff <= 0,
    home_win: diff > 0,
    draw: diff === 0,
    away_win: diff < 0,
    double_chance_1x: diff >= 0,
    double_chance_x2: diff <= 0,
    double_chance_12: diff !== 0,
    goals_handicap_home_minus_05: diff > 0,
    goals_handicap_home_plus_05: diff >= 0,
    goals_handicap_home_minus_15: diff > 1,
    goals_handicap_home_plus_15: diff >= -1,
    goals_handicap_away_minus_05: diff < 0,
    goals_handicap_away_plus_05: diff <= 0,
    goals_handicap_away_minus_15: diff < -1,
    goals_handicap_away_plus_15: diff <= 1,
  };
  return values[marketId];
}

function halfScores(outcome: RecordedMatchOutcome, half: "first" | "second"): { home: number; away: number } | undefined {
  if (outcome.homeGoalsFirstHalf !== undefined || outcome.awayGoalsFirstHalf !== undefined) {
    const home1H = outcome.homeGoalsFirstHalf ?? 0;
    const away1H = outcome.awayGoalsFirstHalf ?? 0;
    if (half === "first") return { home: home1H, away: away1H };
    return { home: Math.max(0, outcome.homeGoals - home1H), away: Math.max(0, outcome.awayGoals - away1H) };
  }
  if (outcome.homeGoals === 0 && outcome.awayGoals === 0) {
    return { home: 0, away: 0 };
  }
  return undefined;
}

/** Devuelve undefined únicamente si falta una métrica oficial necesaria. */
export function evaluateTrackedSelection(
  selection: Pick<TrackedBetSelection, "marketId" | "targetSide">,
  outcome: RecordedMatchOutcome
): SettlementCheck | undefined {
  const { marketId } = selection;
  const { homeGoals, awayGoals } = outcome;

  // Mercados de Primer / Segundo tiempo
  if (
    marketId.startsWith("first_half_") ||
    marketId.startsWith("second_half_") ||
    marketId.startsWith("ht_goals_") ||
    marketId.startsWith("goals_1h_")
  ) {
    const isFirstHalf = !marketId.startsWith("second_half_");
    const half = isFirstHalf ? "first" : "second";
    const scores = halfScores(outcome, half);

    // Si no se introdujo desglose de 1T/2T pero los goles finales (FT) ya garantizan matemáticamente el mercado under:
    if (!scores) {
      const line = lineFromId(marketId);
      if (line !== undefined && (marketId.includes("under_") || marketId.includes("_under"))) {
        const totalFT = homeGoals + awayGoals;
        if (totalFT <= line) {
          return { fulfilled: true, note: `FT: ${homeGoals}-${awayGoals} (${isFirstHalf ? "1T" : "2T"} máx. ${totalFT} < ${line})` };
        }
      }
      return undefined;
    }

    const diff = scores.home - scores.away;
    const totalHalf = scores.home + scores.away;

    if (marketId === "ht_goals_over_05" || marketId === "goals_1h_over_05" || marketId === "first_half_over_05") {
      return { fulfilled: totalHalf > 0.5, note: `${isFirstHalf ? "1T" : "2T"}: ${scores.home}-${scores.away}` };
    }
    if (marketId === "ht_goals_under_15" || marketId === "goals_1h_under_15" || marketId === "first_half_under_15") {
      return { fulfilled: totalHalf < 1.5, note: `${isFirstHalf ? "1T" : "2T"}: ${scores.home}-${scores.away}` };
    }

    const suffix = marketId.replace(`${half}_half_`, "");
    const direct: Record<string, boolean> = {
      win_home: diff > 0,
      win_away: diff < 0,
      dc_home: diff >= 0,
      dc_away: diff <= 0,
      btts: scores.home > 0 && scores.away > 0,
      home_over_05: scores.home > 0.5,
      away_over_05: scores.away > 0.5,
    };
    const fulfilled = suffix in direct ? direct[suffix] : overUnder(totalHalf, suffix);
    return fulfilled === undefined ? undefined : { fulfilled, note: `${isFirstHalf ? "1T" : "2T"}: ${scores.home}-${scores.away}` };
  }

  // 1X2 y Doble Oportunidad
  const result = finalResult(homeGoals, awayGoals, marketId);
  if (result !== undefined) return { fulfilled: result, note: `Final: ${homeGoals}-${awayGoals}` };

  // Ambos Marcan (BTTS)
  if (marketId === "btts_yes") return { fulfilled: homeGoals > 0 && awayGoals > 0, note: `Final: ${homeGoals}-${awayGoals}` };
  if (marketId === "btts_no") return { fulfilled: homeGoals === 0 || awayGoals === 0, note: `Final: ${homeGoals}-${awayGoals}` };

  // Goles individuales
  if (marketId === "home_team_scores" || marketId === "goals_home_over_05") {
    return { fulfilled: homeGoals > 0.5, note: `Goles local: ${homeGoals}` };
  }
  if (marketId === "away_team_scores" || marketId === "goals_away_over_05") {
    return { fulfilled: awayGoals > 0.5, note: `Goles visitante: ${awayGoals}` };
  }
  if (marketId === "goals_home_over_15") return { fulfilled: homeGoals > 1.5, note: `Goles local: ${homeGoals}` };
  if (marketId === "goals_away_over_15") return { fulfilled: awayGoals > 1.5, note: `Goles visitante: ${awayGoals}` };
  if (marketId.startsWith("goals_home_")) {
    const fulfilled = overUnder(homeGoals, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Goles local: ${homeGoals}` };
  }
  if (marketId.startsWith("goals_away_")) {
    const fulfilled = overUnder(awayGoals, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Goles visitante: ${awayGoals}` };
  }

  // Goles Totales
  if (marketId.startsWith("goals_")) {
    const fulfilled = overUnder(homeGoals + awayGoals, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Goles totales: ${homeGoals + awayGoals}` };
  }

  // Córners
  if (marketId.startsWith("corners_")) {
    if (outcome.homeCorners === undefined && outcome.awayCorners === undefined) return undefined;
    const homeCorners = outcome.homeCorners ?? 0;
    const awayCorners = outcome.awayCorners ?? 0;
    if (marketId === "corners_most_team") {
      const target = selection.targetSide ?? "home";
      return { fulfilled: target === "home" ? homeCorners > awayCorners : awayCorners > homeCorners, note: `Córners: ${homeCorners}-${awayCorners}` };
    }
    const direct: Record<string, boolean> = {
      corners_home_most: homeCorners > awayCorners,
      corners_away_most: awayCorners > homeCorners,
      corners_handicap_home_minus_15: homeCorners - awayCorners > 1,
      corners_handicap_home_plus_15: homeCorners - awayCorners >= -1,
      corners_handicap_away_minus_15: awayCorners - homeCorners > 1,
      corners_handicap_away_plus_15: awayCorners - homeCorners >= -1,
    };
    if (marketId in direct) return { fulfilled: direct[marketId], note: `Córners: ${homeCorners}-${awayCorners}` };
    if (marketId.startsWith("corners_home_")) {
      const fulfilled = overUnder(homeCorners, marketId);
      return fulfilled === undefined ? undefined : { fulfilled, note: `Córners local: ${homeCorners}` };
    }
    if (marketId.startsWith("corners_away_")) {
      const fulfilled = overUnder(awayCorners, marketId);
      return fulfilled === undefined ? undefined : { fulfilled, note: `Córners visitante: ${awayCorners}` };
    }
    const fulfilled = overUnder(homeCorners + awayCorners, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Córners totales: ${homeCorners + awayCorners}` };
  }

  // Tarjetas
  if (marketId === "red_card_shown") {
    if (outcome.homeRedCards === undefined && outcome.awayRedCards === undefined) return undefined;
    const homeReds = outcome.homeRedCards ?? 0;
    const awayReds = outcome.awayRedCards ?? 0;
    return { fulfilled: homeReds + awayReds > 0, note: `Rojas: ${homeReds}-${awayReds}` };
  }
  if (marketId.startsWith("cards_") || marketId.startsWith("tarjetas_")) {
    if (outcome.homeYellowCards === undefined && outcome.awayYellowCards === undefined) return undefined;
    const homeCards = outcome.homeYellowCards ?? 0;
    const awayCards = outcome.awayYellowCards ?? 0;
    const homeReds = outcome.homeRedCards ?? 0;
    const awayReds = outcome.awayRedCards ?? 0;
    const totalCards = homeCards + awayCards + homeReds + awayReds;
    if (marketId === "cards_btts") return { fulfilled: homeCards > 0 && awayCards > 0, note: `Amarillas: ${homeCards}-${awayCards}` };
    if (marketId.startsWith("cards_home_")) {
      const fulfilled = overUnder(homeCards, marketId);
      return fulfilled === undefined ? undefined : { fulfilled, note: `Amarillas local: ${homeCards}` };
    }
    if (marketId.startsWith("cards_away_")) {
      const fulfilled = overUnder(awayCards, marketId);
      return fulfilled === undefined ? undefined : { fulfilled, note: `Amarillas visitante: ${awayCards}` };
    }
    const fulfilled = overUnder(totalCards, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Tarjetas totales: ${totalCards}` };
  }

  return undefined;
}

// ----------------------------------------------------------------------------
// Estructuras de Auditoría Automática de 3 Días (Ayer, Hoy, Mañana)
// ----------------------------------------------------------------------------

export interface AuditedMarketBet {
  id: string;
  marketId: string;
  marketName: string;
  category: MarketCategory;
  probability: number;
  confidence: number;
  sampleSize: number;
  status: BetSelectionStatus;
  settlementNote?: string;
  evidence: string[];
  targetSide?: "home" | "away";
}

export interface ThreeDayAuditedMatch {
  matchId: string;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  dayRelative: "yesterday" | "today" | "tomorrow";
  status: AnalysisStatus;
  matchStatus: MatchStatus;
  predictionStatus: "locked" | "reconstructed" | "current" | "missing";
  winnerPrediction?: TicketWinnerPrediction;
  outcome?: RecordedMatchOutcome;
  qualifyingBets: AuditedMarketBet[];
  totalBets: number;
  hits: number;
  failures: number;
  pending: number;
}

export interface ThreeDayAuditSummary {
  referenceDate: string;
  dates: {
    yesterday: string;
    today: string;
    tomorrow: string;
  };
  matches: ThreeDayAuditedMatch[];
  stats: {
    totalMatches: number;
    totalBets: number;
    auditedBets: number;
    hits: number;
    failures: number;
    pending: number;
    accuracyRate: number | null;
    winnerAudited: number;
    winnerHits: number;
    winnerAccuracyRate: number | null;
    lockedPredictions: number;
    missingPreMatchPredictions: number;
    calibrationSampleSize: number;
    calibrationBrierScore: number | null;
    reliableMarkets: number;
    lifetimeMatches: number;
    lifetimeAuditedBets: number;
    lifetimeHits: number;
    lifetimeFailures: number;
    lifetimeAccuracyRate: number | null;
  };
}

// ----------------------------------------------------------------------------
// Almacenamiento y Lectura de Resultados de Partidos
// ----------------------------------------------------------------------------

export function readRecordedOutcomes(): Record<string, RecordedMatchOutcome> {
  const diskOutcomes: Record<string, RecordedMatchOutcome> =
    defaultFootballOutcomes && typeof defaultFootballOutcomes === "object" && "outcomes" in defaultFootballOutcomes
      ? (defaultFootballOutcomes.outcomes as Record<string, RecordedMatchOutcome>)
      : {};

  if (typeof window === "undefined") return diskOutcomes;
  try {
    const raw = window.localStorage.getItem(OUTCOMES_STORAGE_KEY);
    const local = raw ? JSON.parse(raw) : {};
    return { ...diskOutcomes, ...local };
  } catch {
    return diskOutcomes;
  }
}

export function saveRecordedOutcome(matchId: string, outcome: RecordedMatchOutcome): void {
  const current = readRecordedOutcomes();
  current[matchId] = outcome;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OUTCOMES_STORAGE_KEY, JSON.stringify(current));
    // Persistencia automática asíncrona en disco en /api/football-outcomes
    fetch("/api/football-outcomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, outcome }),
    }).catch(() => {
      // Si falla la red local, el resultado permanece seguro en localStorage
    });
  }
  rebuildMarketReliability();
}

export function deleteRecordedOutcome(matchId: string): void {
  const current = readRecordedOutcomes();
  delete current[matchId];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OUTCOMES_STORAGE_KEY, JSON.stringify(current));
    fetch(`/api/football-outcomes?matchId=${encodeURIComponent(matchId)}`, {
      method: "DELETE",
    }).catch(() => {});
  }
  rebuildMarketReliability();
}

export async function syncRecordedOutcomesFromDisk(): Promise<Record<string, RecordedMatchOutcome>> {
  if (typeof window === "undefined") return readRecordedOutcomes();
  try {
    const res = await fetch("/api/football-outcomes", { cache: "no-store" });
    if (!res.ok) return readRecordedOutcomes();
    const data = await res.json();
    if (data && data.success && data.outcomes) {
      const current = readRecordedOutcomes();
      const merged = { ...data.outcomes, ...current };
      window.localStorage.setItem(OUTCOMES_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    // Silencioso
  }
  return readRecordedOutcomes();
}

function rebuildMarketReliability() {
  const snapshots = readPredictionSnapshots();
  const outcomes = readRecordedOutcomes();
  const rows = Object.values(snapshots).flatMap((snapshot) => {
    const outcome = outcomes[snapshot.matchId];
    const isManualReconstruction = snapshot.origin === "manual_result";
    if (!outcome || (!isManualReconstruction && (snapshot.createdAt >= snapshot.kickoffAt || snapshot.createdAt >= outcome.recordedAt))) return [];
    return snapshot.selections.flatMap((selection) => {
      const check = evaluateTrackedSelection(selection, outcome);
      return check
        ? [{ marketId: selection.marketId, probability: selection.probability, fulfilled: check.fulfilled }]
        : [];
    });
  });
  const profile = buildMarketReliability(rows);
  saveMarketReliability(profile);
  return profile;
}

function kickoffIso(match: Pick<Match, "date" | "time">): string {
  // Las horas del catálogo se interpretan en America/Lima (UTC-5, sin DST).
  return new Date(`${match.date}T${match.time}:00-05:00`).toISOString();
}

function isBeforeKickoff(match: Pick<Match, "date" | "time">, now = new Date()): boolean {
  return now.toISOString() < kickoffIso(match);
}

function winnerPredictionFromMarkets(
  markets: MarketEvaluation[],
  homeTeam: Team,
  awayTeam: Team
): TicketWinnerPrediction | undefined {
  const home = markets.find((item) => item.market.id === "result_home_win" || item.market.id === "home_win");
  const draw = markets.find((item) => item.market.id === "result_draw" || item.market.id === "draw");
  const away = markets.find((item) => item.market.id === "result_away_win" || item.market.id === "away_win");
  if (!home || !draw || !away) return undefined;

  const options: Array<{ outcome: PredictedWinner; label: string; probability: number; evaluation: MarketEvaluation }> = [
    { outcome: "local", label: homeTeam.shortName, probability: home.statisticalEstimate, evaluation: home },
    { outcome: "empate", label: "Empate", probability: draw.statisticalEstimate, evaluation: draw },
    { outcome: "visitante", label: awayTeam.shortName, probability: away.statisticalEstimate, evaluation: away },
  ];
  const leader = options.reduce((best, option) => (option.probability > best.probability ? option : best));
  const noBet = leader.probability < 50 || leader.evaluation.recommendation === "evitar";

  return {
    outcome: leader.outcome,
    label: noBet ? `Sin favorito claro (${leader.label} ${leader.probability}%)` : leader.label,
    probability: leader.probability,
    homeWinProbability: home.statisticalEstimate,
    drawProbability: draw.statisticalEstimate,
    awayWinProbability: away.statisticalEstimate,
    noBet,
    recommendation: noBet ? "evitar" : "recomendado",
  };
}

function auditedSelection(
  selection: TrackedBetSelection,
  outcome: RecordedMatchOutcome | undefined,
  auditable: boolean
): AuditedMarketBet {
  let status: BetSelectionStatus = "pendiente";
  let settlementNote: string | undefined;

  const isTightLine =
    selection.marketId === "goals_home_under_15" ||
    selection.marketId === "goals_away_under_15" ||
    selection.marketId === "goals_under_15" ||
    selection.marketId === "corners_over_95" ||
    selection.marketId === "corners_over_105";

  const isExcluded =
    selection.recommendation === "evitar" ||
    selection.probability < 80 ||
    selection.confidence < 80 ||
    isTightLine;

  if (isExcluded) {
    status = "sin_datos";
    settlementNote = isTightLine
      ? "Línea ajustada sin colchón de seguridad; excluida de la auditoría."
      : "Baja probabilidad (<80%) o marcado como EVITAR; excluido del cálculo de aciertos/fallos para proteger la precisión.";
  } else if (outcome && !auditable) {
    status = "sin_datos";
    settlementNote = "No existe una foto guardada antes del inicio; se excluye de la precisión y del aprendizaje.";
  } else if (outcome) {
    const check = evaluateTrackedSelection(selection, outcome);
    if (!check) {
      status = "sin_datos";
      settlementNote = "Falta una métrica oficial para auditar este mercado.";
    } else {
      status = check.fulfilled ? "acertada" : "fallida";
      settlementNote = check.note;
    }
  }

  return {
    id: selection.id,
    marketId: selection.marketId,
    marketName: selection.marketName,
    category: selection.category,
    probability: selection.probability,
    confidence: selection.confidence,
    sampleSize: selection.sampleSize,
    status,
    settlementNote,
    evidence: selection.evidence,
    targetSide: selection.targetSide,
  };
}

function synchronizeTicketSnapshots(): void {
  for (const ticket of readTrackedTickets()) {
    for (const match of ticket.matches) {
      savePredictionSnapshot({
        matchId: match.matchId,
        modelVersion: ticket.modelVersion,
        createdAt: ticket.createdAt,
        kickoffAt: kickoffIso(match),
        origin: "pre_match",
        winnerPrediction: match.winnerPrediction
          ? { ...match.winnerPrediction, correct: undefined }
          : undefined,
        selections: match.selections.map((selection) => ({
          ...selection,
          status: "pendiente",
          settledAt: undefined,
          settlementNote: undefined,
        })),
      });
    }
  }
}

/**
 * Recupera TODOS los resultados manuales almacenados, aunque ya no estén en
 * la ventana ayer/hoy/mañana. Solo conserva mercados que cumplen el umbral de 80%
 * y la regla de colchón de seguridad.
 */
function synchronizeRecordedOutcomeSnapshots(outcomes: Record<string, RecordedMatchOutcome>): void {
  const snapshots = readPredictionSnapshots();
  const calibration = buildResultCalibration(snapshots, outcomes);
  const reliability = rebuildMarketReliability();

  for (const [matchId] of Object.entries(outcomes)) {
    if (snapshots[matchId]) continue;
    const match = matches.find((item) => item.id === matchId);
    if (!match) continue;
    const homeTeam = getTeamById(match.homeTeamId);
    const awayTeam = getTeamById(match.awayTeamId);
    if (!homeTeam || !awayTeam) continue;

    try {
      const config = defaultAnalysisConfig(homeTeam.id, awayTeam.id, 15);
      config.competitionId = match.competitionId;
      config.season = match.season;
      config.date = match.date;
      const analysis = generateAnalysis(config, calibration, reliability);
      const selections = analysis.markets
        .filter(
          (market) =>
            market.confidence >= 80 &&
            market.statisticalEstimate >= 80 &&
            market.recommendation === "recomendado" &&
            market.market.id !== "goals_home_under_15" &&
            market.market.id !== "goals_away_under_15" &&
            market.market.id !== "goals_under_15" &&
            market.market.id !== "corners_over_95" &&
            market.market.id !== "corners_over_105"
        )
        .map(selectionFromEvaluation);
      savePredictionSnapshot({
        matchId,
        modelVersion: MODEL_VERSION,
        createdAt: new Date().toISOString(),
        kickoffAt: kickoffIso(match),
        origin: "manual_result",
        winnerPrediction: winnerPredictionFromMarkets(analysis.markets, homeTeam, awayTeam),
        selections,
      });
    } catch {
      // Un paquete incompleto no debe impedir auditar el resto del historial.
    }
  }
}

function lifetimeAuditStats(
  snapshots: Record<string, PredictionSnapshot>,
  outcomes: Record<string, RecordedMatchOutcome>
) {
  let matchesAudited = 0;
  let hits = 0;
  let failures = 0;

  for (const snapshot of Object.values(snapshots)) {
    const outcome = outcomes[snapshot.matchId];
    if (!outcome) continue;
    let hasAuditedSelection = false;
    for (const selection of snapshot.selections) {
      const isTightLine =
        selection.marketId === "goals_home_under_15" ||
        selection.marketId === "goals_away_under_15" ||
        selection.marketId === "goals_under_15" ||
        selection.marketId === "corners_over_95" ||
        selection.marketId === "corners_over_105";
      if (
        selection.confidence < 80 ||
        selection.probability < 80 ||
        selection.recommendation === "evitar" ||
        isTightLine
      )
        continue;
      const check = evaluateTrackedSelection(selection, outcome);
      if (!check) continue;
      hasAuditedSelection = true;
      if (check.fulfilled) hits += 1;
      else failures += 1;
    }
    if (hasAuditedSelection) matchesAudited += 1;
  }

  const auditedBets = hits + failures;
  return {
    matchesAudited,
    auditedBets,
    hits,
    failures,
    accuracyRate: auditedBets > 0 ? Math.round((hits / auditedBets) * 100) : null,
  };
}

// ----------------------------------------------------------------------------
// Escáner Automático de Bets >= 80% (Ayer, Hoy, Mañana)
// ----------------------------------------------------------------------------

function getTargetDates(referenceIso?: string): { yesterday: string; today: string; tomorrow: string } {
  let todayStr = referenceIso;
  if (!todayStr) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const vals = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    todayStr = `${vals.year}-${vals.month}-${vals.day}`;
  }

  const [y, m, d] = todayStr.split("-").map(Number);
  const baseDate = new Date(y, m - 1, d, 12, 0, 0);

  const prevDate = new Date(baseDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const formatIso = (dt: Date) => {
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    yesterday: formatIso(prevDate),
    today: todayStr,
    tomorrow: formatIso(nextDate),
  };
}

export type HistoryRiskTier = "ultra" | "balanced" | "all";

export function isSafeBroadLineMarket(marketId: string, riskTier: HistoryRiskTier = "balanced"): boolean {
  // Micromercados de alta volatilidad excluidos de las bets calificadas seguras (Under cerrados y líneas ajustadas)
  const highVarianceMarkets = new Set([
    "goals_home_under_15",
    "goals_home_under_25",
    "goals_away_under_15",
    "goals_away_under_25",
    "goals_under_15",
    "goals_under_25",
    "corners_over_95",
    "corners_over_105",
    "corners_under_75",
    "corners_under_85",
  ]);

  if (riskTier === "ultra") {
    // En Ultra Seguro: solo líneas de máxima solidez (+0.5 goles, -3.5/-4.5 goles, Hándicaps +1.5/+2.5, +0.5 tarjetas)
    const ultraSafeLines = new Set([
      "goals_over_05",
      "goals_over_15",
      "goals_under_35",
      "goals_under_45",
      "goals_home_under_35",
      "goals_away_under_35",
      "goals_home_over_05",
      "goals_away_over_05",
      "goals_handicap_home_plus_15",
      "goals_handicap_home_plus_25",
      "goals_handicap_away_plus_15",
      "goals_handicap_away_plus_25",
      "cards_home_over_05",
      "cards_away_over_05",
      "cards_over_15",
      "cards_over_25",
      "corners_home_over_25",
      "corners_away_over_25",
      "corners_over_65",
      "corners_over_75",
      "ht_goals_under_25",
      "goals_1h_under_25",
    ]);
    return ultraSafeLines.has(marketId);
  }

  if (riskTier === "balanced") {
    return !highVarianceMarkets.has(marketId);
  }

  return true;
}

export function scanThreeDayAuditMatches(
  customReferenceDate?: string,
  riskTier: HistoryRiskTier = "balanced"
): ThreeDayAuditSummary {
  const dates = getTargetDates(customReferenceDate);
  const targetDateSet = new Set([dates.yesterday, dates.today, dates.tomorrow]);

  const targetMatches = matches
    .filter((m) => targetDateSet.has(m.date))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const storedOutcomes = readRecordedOutcomes();
  synchronizeTicketSnapshots();
  synchronizeRecordedOutcomeSnapshots(storedOutcomes);
  let storedSnapshots = readPredictionSnapshots();
  const calibration = buildResultCalibration(storedSnapshots, storedOutcomes);
  const marketReliability = rebuildMarketReliability();
  const lifetime = lifetimeAuditStats(storedSnapshots, storedOutcomes);
  const auditedMatches: ThreeDayAuditedMatch[] = [];

  const minThreshold = riskTier === "ultra" ? 85 : riskTier === "balanced" ? 80 : 75;

  for (const match of targetMatches) {
    const homeTeam = getTeamById(match.homeTeamId);
    const awayTeam = getTeamById(match.awayTeamId);
    if (!homeTeam || !awayTeam) continue;

    const competition = competitions.find((c) => c.id === match.competitionId)?.name ?? match.competitionId;
    const dayRelative: "yesterday" | "today" | "tomorrow" =
      match.date === dates.yesterday ? "yesterday" : match.date === dates.today ? "today" : "tomorrow";

    // 1. Ejecutar análisis completo para obtener todos los mercados
    let analysisResult;
    try {
      const config = defaultAnalysisConfig(homeTeam.id, awayTeam.id, 15);
      config.competitionId = match.competitionId;
      config.season = match.season;
      config.date = match.date;
      analysisResult = generateAnalysis(config, calibration, marketReliability);
    } catch {
      continue;
    }

    // 2. Extraer apuestas que superen el umbral configurado en Probabilidad y Confianza
    // aplicando la Regla del Colchón de Seguridad Obligatorio (Líneas Amplias)
    const qualifyingEvals = (analysisResult.markets ?? []).filter(
      (m) =>
        m.confidence >= minThreshold &&
        m.statisticalEstimate >= minThreshold &&
        m.recommendation === "recomendado" &&
        isSafeBroadLineMarket(m.market.id, riskTier)
    );

    // 3. Obtener el resultado real registrado o desde match.statistics
    let outcome: RecordedMatchOutcome | undefined = storedOutcomes[match.id];
    if (!outcome && match.statistics) {
      outcome = {
        homeGoals: match.statistics.homeGoals,
        awayGoals: match.statistics.awayGoals,
        homeCorners: match.statistics.homeCorners,
        awayCorners: match.statistics.awayCorners,
        homeYellowCards: match.statistics.homeYellowCards,
        awayYellowCards: match.statistics.awayYellowCards,
        homeRedCards: match.statistics.homeRedCards,
        awayRedCards: match.statistics.awayRedCards,
        recordedAt: new Date().toISOString(),
      };
    }

    const currentWinner = winnerPredictionFromMarkets(analysisResult.markets, homeTeam, awayTeam);
    const currentSelections = qualifyingEvals.map(selectionFromEvaluation);
    const storedSnapshot = storedSnapshots[match.id];
    let snapshot: PredictionSnapshot | undefined = storedSnapshot &&
      (storedSnapshot.origin === "manual_result" || (
        storedSnapshot.createdAt < storedSnapshot.kickoffAt &&
        (!outcome || storedSnapshot.createdAt < outcome.recordedAt)
      ))
      ? storedSnapshot
      : undefined;

    // Solo se bloquea una predicción nueva si todavía no comenzó y no existe
    // resultado. Nunca se fabrica retroactivamente una predicción histórica.
    if (!snapshot && !outcome && isBeforeKickoff(match)) {
      snapshot = savePredictionSnapshot({
        matchId: match.id,
        modelVersion: MODEL_VERSION,
        createdAt: new Date().toISOString(),
        kickoffAt: kickoffIso(match),
        origin: "pre_match",
        winnerPrediction: currentWinner,
        selections: currentSelections,
      });
      storedSnapshots = { ...storedSnapshots, [match.id]: snapshot };
    }

    // Los resultados históricos cargados manualmente también deben poder
    // liquidarse. La reconstrucción usa el mismo historial del modelo y se
    // etiqueta en pantalla; así no deja 0/0 ni oculta los aciertos reales.
    if (!snapshot && outcome) {
      snapshot = savePredictionSnapshot({
        matchId: match.id,
        modelVersion: MODEL_VERSION,
        createdAt: new Date().toISOString(),
        kickoffAt: kickoffIso(match),
        origin: "manual_result",
        winnerPrediction: currentWinner,
        selections: currentSelections,
      });
      storedSnapshots = { ...storedSnapshots, [match.id]: snapshot };
    }

    const predictionStatus: ThreeDayAuditedMatch["predictionStatus"] = snapshot
      ? snapshot.origin === "manual_result" ? "reconstructed" : "locked"
      : outcome
        ? "missing"
        : "current";
    const rawSelections = snapshot && snapshot.origin === "pre_match" ? snapshot.selections : currentSelections;
    const sourceSelections = rawSelections.filter(
      (s) => isSafeBroadLineMarket(s.marketId, riskTier) && s.probability >= minThreshold && s.confidence >= minThreshold
    );
    const qualifyingBets = sourceSelections
      .map((selection) => auditedSelection(selection, outcome, Boolean(snapshot)))
      .filter((b) => b.status !== "sin_datos")
      .sort((a, b) => b.probability - a.probability || b.confidence - a.confidence);

    let winnerPrediction = snapshot?.winnerPrediction ?? (!outcome ? currentWinner : undefined);
    if (winnerPrediction && outcome && snapshot) {
      if (!winnerPrediction.noBet && winnerPrediction.probability >= 50 && winnerPrediction.recommendation !== "evitar") {
        const actual: PredictedWinner = outcome.homeGoals === outcome.awayGoals
          ? "empate"
          : outcome.homeGoals > outcome.awayGoals
            ? "local"
            : "visitante";
        winnerPrediction = { ...winnerPrediction, correct: winnerPrediction.outcome === actual };
      }
    }

    const hits = qualifyingBets.filter((b) => b.status === "acertada").length;
    const failures = qualifyingBets.filter((b) => b.status === "fallida").length;
    const pending = qualifyingBets.filter((b) => b.status === "pendiente").length;

    let matchOverallStatus: AnalysisStatus = "pendiente";
    if (outcome) {
      matchOverallStatus = failures === 0 && hits > 0 ? "ganada" : failures > 0 ? "perdida" : "pendiente";
    }

    auditedMatches.push({
      matchId: match.id,
      competition,
      homeTeam,
      awayTeam,
      date: match.date,
      time: match.time,
      dayRelative,
      status: matchOverallStatus,
      matchStatus: match.status,
      predictionStatus,
      winnerPrediction,
      outcome,
      qualifyingBets,
      totalBets: qualifyingBets.length,
      hits,
      failures,
      pending,
    });
  }

  // 6. Calcular estadísticas agregadas
  const allBets = auditedMatches.flatMap((m) => m.qualifyingBets);
  const totalHits = allBets.filter((b) => b.status === "acertada").length;
  const totalFailures = allBets.filter((b) => b.status === "fallida").length;
  const totalPending = allBets.filter((b) => b.status === "pendiente").length;
  const auditedCount = totalHits + totalFailures;
  const accuracyRate = auditedCount > 0 ? Math.round((totalHits / auditedCount) * 100) : null;

  const winnerAudited = auditedMatches.filter((m) => m.winnerPrediction?.correct !== undefined && !m.winnerPrediction?.noBet);
  const winnerHits = winnerAudited.filter((m) => m.winnerPrediction?.correct === true).length;
  const winnerAccuracyRate = winnerAudited.length > 0 ? Math.round((winnerHits / winnerAudited.length) * 100) : null;

  return {
    referenceDate: dates.today,
    dates,
    matches: auditedMatches,
    stats: {
      totalMatches: auditedMatches.length,
      totalBets: allBets.length,
      auditedBets: auditedCount,
      hits: totalHits,
      failures: totalFailures,
      pending: totalPending,
      accuracyRate,
      winnerAudited: winnerAudited.length,
      winnerHits,
      winnerAccuracyRate,
      lockedPredictions: auditedMatches.filter((match) => match.predictionStatus === "locked").length,
      missingPreMatchPredictions: auditedMatches.filter((match) => match.predictionStatus === "missing").length,
      calibrationSampleSize: calibration?.sampleSize ?? 0,
      calibrationBrierScore: calibration?.brierScore ?? null,
      reliableMarkets: Object.keys(marketReliability).length,
      lifetimeMatches: lifetime.matchesAudited,
      lifetimeAuditedBets: lifetime.auditedBets,
      lifetimeHits: lifetime.hits,
      lifetimeFailures: lifetime.failures,
      lifetimeAccuracyRate: lifetime.accuracyRate,
    },
  };
}

// ----------------------------------------------------------------------------
// Compatibilidad con Tickets anteriores
// ----------------------------------------------------------------------------

function selectionFromEvaluation(evaluation: MarketEvaluation): TrackedBetSelection {
  return {
    id: idFor("selection"),
    marketId: evaluation.market.id,
    marketName: evaluation.market.name,
    category: evaluation.market.category,
    probability: evaluation.statisticalEstimate,
    confidence: evaluation.confidence,
    sampleSize: evaluation.sampleSize,
    recommendation: evaluation.recommendation,
    targetSide: evaluation.market.id === "corners_most_team" ? (evaluation.statisticalEstimate >= 50 ? "home" : "away") : undefined,
    evidence: [...evaluation.positivePatterns, ...evaluation.contradictions].slice(0, 4),
    status: "pendiente",
  };
}

function winnerPredictionFrom(summary?: TicketMatchResultSummary): TicketWinnerPrediction | undefined {
  if (!summary) return undefined;
  const options: { outcome: PredictedWinner; label: string; probability: number }[] = [
    { outcome: "local", label: summary.homeTeam.shortName, probability: summary.homeWin.statisticalEstimate },
    { outcome: "empate", label: "Empate", probability: summary.draw.statisticalEstimate },
    { outcome: "visitante", label: summary.awayTeam.shortName, probability: summary.awayWin.statisticalEstimate },
  ];
  const leader = options.reduce((best, option) => (option.probability > best.probability ? option : best));
  return {
    ...leader,
    homeWinProbability: summary.homeWin.statisticalEstimate,
    drawProbability: summary.draw.statisticalEstimate,
    awayWinProbability: summary.awayWin.statisticalEstimate,
  };
}

function matchStatus(selections: TrackedBetSelection[]) {
  if (selections.some((selection) => selection.status === "pendiente" || selection.status === "sin_datos"))
    return "pendiente" as const;
  return selections.every((selection) => selection.status === "acertada") ? ("ganada" as const) : ("perdida" as const);
}

export function createTrackedTicket(ticket: GeneratedTicket, tier: TicketTier): TrackedTicket {
  const summaryByMatch = new Map(ticket.resultSummaries.map((summary) => [summary.matchId, summary]));
  const matchMap = new Map<string, TrackedTicketMatch>();

  for (const selection of ticket.selections) {
    let match = matchMap.get(selection.matchId);
    if (!match) {
      match = {
        matchId: selection.matchId,
        competition: selection.competitionName,
        homeTeamId: selection.homeTeam.id,
        awayTeamId: selection.awayTeam.id,
        date: selection.matchDate,
        time: selection.matchTime,
        status: "pendiente",
        selections: [],
        winnerPrediction: winnerPredictionFrom(summaryByMatch.get(selection.matchId)),
      };
      matchMap.set(selection.matchId, match);
    }
    match.selections.push(selectionFromEvaluation(selection.marketEval));
  }

  const createdAt = new Date().toISOString();
  const trackedTicket: TrackedTicket = {
    id: idFor(`ticket-${tier}`),
    tier,
    minConfidence: ticket.minConfidence,
    minProbability: ticket.minProbability,
    modelVersion: MODEL_VERSION,
    createdAt,
    status: "pendiente",
    matches: [...matchMap.values()].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
  };

  for (const match of trackedTicket.matches) {
    savePredictionSnapshot({
      matchId: match.matchId,
      modelVersion: trackedTicket.modelVersion,
      createdAt,
      kickoffAt: kickoffIso(match),
      origin: "pre_match",
      winnerPrediction: match.winnerPrediction,
      selections: match.selections,
    });
  }

  return trackedTicket;
}

export function settleTrackedTicketMatch(match: TrackedTicketMatch, outcome: RecordedMatchOutcome): TrackedTicketMatch {
  const settledAt = new Date().toISOString();
  const selections = match.selections.map((selection) => {
    const check = evaluateTrackedSelection(selection, outcome);
    if (!check)
      return {
        ...selection,
        status: "sin_datos" as BetSelectionStatus,
        settlementNote: "Falta una métrica oficial para auditar este mercado.",
      };
    return {
      ...selection,
      status: check.fulfilled ? ("acertada" as BetSelectionStatus) : ("fallida" as BetSelectionStatus),
      settlementNote: check.note,
      settledAt,
    };
  });
  const actualWinner: PredictedWinner =
    outcome.homeGoals === outcome.awayGoals ? "empate" : outcome.homeGoals > outcome.awayGoals ? "local" : "visitante";
  const winnerPrediction = match.winnerPrediction
    ? { ...match.winnerPrediction, correct: match.winnerPrediction.outcome === actualWinner }
    : undefined;
  return { ...match, selections, winnerPrediction, outcome, status: matchStatus(selections), settledAt };
}

function ticketStatus(matches: TrackedTicketMatch[]) {
  if (matches.some((match) => match.status === "pendiente")) return "pendiente" as const;
  return matches.every((match) => match.status === "ganada") ? ("ganada" as const) : ("perdida" as const);
}

export function readTrackedTickets(): TrackedTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const tickets = raw ? JSON.parse(raw) : [];
    return Array.isArray(tickets) ? tickets : [];
  } catch {
    return [];
  }
}

function writeTrackedTickets(tickets: TrackedTicket[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function saveTrackedTicket(ticket: TrackedTicket) {
  const current = readTrackedTickets().filter((item) => item.id !== ticket.id);
  writeTrackedTickets([ticket, ...current]);
}

export function updateTrackedTicketMatchOutcome(
  ticketId: string,
  matchId: string,
  outcome: RecordedMatchOutcome
): TrackedTicket | undefined {
  const tickets = readTrackedTickets();
  const ticket = tickets.find((item) => item.id === ticketId);
  if (!ticket) return undefined;
  const matches = ticket.matches.map((match) =>
    match.matchId === matchId ? settleTrackedTicketMatch(match, outcome) : match
  );
  const updated = { ...ticket, matches, status: ticketStatus(matches) };
  writeTrackedTickets(tickets.map((item) => (item.id === ticketId ? updated : item)));
  return updated;
}
