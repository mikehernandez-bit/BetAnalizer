import {
  BetSelectionStatus,
  MarketEvaluation,
  PredictedWinner,
  RecordedMatchOutcome,
  TicketTier,
  TicketWinnerPrediction,
  TrackedBetSelection,
  TrackedTicket,
  TrackedTicketMatch,
} from "@/types";
import { GeneratedTicket, TicketMatchResultSummary } from "@/services/ticket-generator-service";

const STORAGE_KEY = "betanalyzer.tracked-tickets.v1";
const MODEL_VERSION = "betanalyzer-1.2";

export type SettlementCheck = { fulfilled: boolean; note: string };

function idFor(prefix: string): string {
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${uuid}`;
}

function lineFromId(value: string): number | undefined {
  const match = value.match(/_(\d+)$/);
  return match ? Number(match[1]) / 10 : undefined;
}

function overUnder(value: number, marketId: string): boolean | undefined {
  const line = lineFromId(marketId);
  if (line === undefined) return undefined;
  if (marketId.includes("_over_")) return value > line;
  if (marketId.includes("_under_")) return value < line;
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
  if (outcome.homeGoalsFirstHalf === undefined || outcome.awayGoalsFirstHalf === undefined) return undefined;
  if (half === "first") return { home: outcome.homeGoalsFirstHalf, away: outcome.awayGoalsFirstHalf };
  return { home: outcome.homeGoals - outcome.homeGoalsFirstHalf, away: outcome.awayGoals - outcome.awayGoalsFirstHalf };
}

/** Devuelve undefined únicamente si falta una métrica oficial necesaria. */
export function evaluateTrackedSelection(selection: Pick<TrackedBetSelection, "marketId" | "targetSide">, outcome: RecordedMatchOutcome): SettlementCheck | undefined {
  const { marketId } = selection;
  const { homeGoals, awayGoals } = outcome;

  if (marketId.startsWith("first_half_") || marketId.startsWith("second_half_")) {
    const half = marketId.startsWith("first_half_") ? "first" : "second";
    const scores = halfScores(outcome, half);
    if (!scores) return undefined;
    const suffix = marketId.replace(`${half}_half_`, "");
    const diff = scores.home - scores.away;
    const direct: Record<string, boolean> = {
      win_home: diff > 0,
      win_away: diff < 0,
      dc_home: diff >= 0,
      dc_away: diff <= 0,
      btts: scores.home > 0 && scores.away > 0,
      home_over_05: scores.home > 0.5,
      away_over_05: scores.away > 0.5,
    };
    const fulfilled = suffix in direct ? direct[suffix] : overUnder(scores.home + scores.away, suffix);
    return fulfilled === undefined ? undefined : { fulfilled, note: `${half === "first" ? "1T" : "2T"}: ${scores.home}-${scores.away}` };
  }

  const result = finalResult(homeGoals, awayGoals, marketId);
  if (result !== undefined) return { fulfilled: result, note: `Final: ${homeGoals}-${awayGoals}` };
  if (marketId === "btts_yes") return { fulfilled: homeGoals > 0 && awayGoals > 0, note: `Final: ${homeGoals}-${awayGoals}` };
  if (marketId === "btts_no") return { fulfilled: homeGoals === 0 || awayGoals === 0, note: `Final: ${homeGoals}-${awayGoals}` };
  if (marketId === "home_team_scores") return { fulfilled: homeGoals > 0, note: `Final: ${homeGoals}-${awayGoals}` };
  if (marketId === "away_team_scores") return { fulfilled: awayGoals > 0, note: `Final: ${homeGoals}-${awayGoals}` };

  if (marketId.startsWith("goals_home_")) {
    const fulfilled = overUnder(homeGoals, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Goles local: ${homeGoals}` };
  }
  if (marketId.startsWith("goals_away_")) {
    const fulfilled = overUnder(awayGoals, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Goles visitante: ${awayGoals}` };
  }
  if (marketId.startsWith("goals_")) {
    const fulfilled = overUnder(homeGoals + awayGoals, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Goles totales: ${homeGoals + awayGoals}` };
  }

  if (marketId.startsWith("corners_")) {
    if (outcome.homeCorners === undefined || outcome.awayCorners === undefined) return undefined;
    const homeCorners = outcome.homeCorners;
    const awayCorners = outcome.awayCorners;
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

  if (marketId === "red_card_shown") {
    if (outcome.homeRedCards === undefined || outcome.awayRedCards === undefined) return undefined;
    return { fulfilled: outcome.homeRedCards + outcome.awayRedCards > 0, note: `Rojas: ${outcome.homeRedCards}-${outcome.awayRedCards}` };
  }
  if (marketId.startsWith("cards_")) {
    if (outcome.homeYellowCards === undefined || outcome.awayYellowCards === undefined) return undefined;
    const homeCards = outcome.homeYellowCards;
    const awayCards = outcome.awayYellowCards;
    if (marketId === "cards_btts") return { fulfilled: homeCards > 0 && awayCards > 0, note: `Amarillas: ${homeCards}-${awayCards}` };
    if (marketId.startsWith("cards_home_")) {
      const fulfilled = overUnder(homeCards, marketId);
      return fulfilled === undefined ? undefined : { fulfilled, note: `Amarillas local: ${homeCards}` };
    }
    if (marketId.startsWith("cards_away_")) {
      const fulfilled = overUnder(awayCards, marketId);
      return fulfilled === undefined ? undefined : { fulfilled, note: `Amarillas visitante: ${awayCards}` };
    }
    const fulfilled = overUnder(homeCards + awayCards, marketId);
    return fulfilled === undefined ? undefined : { fulfilled, note: `Amarillas totales: ${homeCards + awayCards}` };
  }

  return undefined;
}

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
  const leader = options.reduce((best, option) => option.probability > best.probability ? option : best);
  return { ...leader, homeWinProbability: summary.homeWin.statisticalEstimate, drawProbability: summary.draw.statisticalEstimate, awayWinProbability: summary.awayWin.statisticalEstimate };
}

function matchStatus(selections: TrackedBetSelection[]) {
  if (selections.some((selection) => selection.status === "pendiente" || selection.status === "sin_datos")) return "pendiente" as const;
  return selections.every((selection) => selection.status === "acertada") ? "ganada" as const : "perdida" as const;
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

  return {
    id: idFor(`ticket-${tier}`),
    tier,
    minConfidence: ticket.minConfidence,
    minProbability: ticket.minProbability,
    modelVersion: MODEL_VERSION,
    createdAt: new Date().toISOString(),
    status: "pendiente",
    matches: [...matchMap.values()].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
  };
}

export function settleTrackedTicketMatch(match: TrackedTicketMatch, outcome: RecordedMatchOutcome): TrackedTicketMatch {
  const settledAt = new Date().toISOString();
  const selections = match.selections.map((selection) => {
    const check = evaluateTrackedSelection(selection, outcome);
    if (!check) return { ...selection, status: "sin_datos" as BetSelectionStatus, settlementNote: "Falta una métrica oficial para auditar este mercado." };
    return { ...selection, status: check.fulfilled ? "acertada" as BetSelectionStatus : "fallida" as BetSelectionStatus, settlementNote: check.note, settledAt };
  });
  const actualWinner: PredictedWinner = outcome.homeGoals === outcome.awayGoals ? "empate" : outcome.homeGoals > outcome.awayGoals ? "local" : "visitante";
  const winnerPrediction = match.winnerPrediction ? { ...match.winnerPrediction, correct: match.winnerPrediction.outcome === actualWinner } : undefined;
  return { ...match, selections, winnerPrediction, outcome, status: matchStatus(selections), settledAt };
}

function ticketStatus(matches: TrackedTicketMatch[]) {
  if (matches.some((match) => match.status === "pendiente")) return "pendiente" as const;
  return matches.every((match) => match.status === "ganada") ? "ganada" as const : "perdida" as const;
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

export function updateTrackedTicketMatchOutcome(ticketId: string, matchId: string, outcome: RecordedMatchOutcome): TrackedTicket | undefined {
  const tickets = readTrackedTickets();
  const ticket = tickets.find((item) => item.id === ticketId);
  if (!ticket) return undefined;
  const matches = ticket.matches.map((match) => match.matchId === matchId ? settleTrackedTicketMatch(match, outcome) : match);
  const updated = { ...ticket, matches, status: ticketStatus(matches) };
  writeTrackedTickets(tickets.map((item) => item.id === ticketId ? updated : item));
  return updated;
}
