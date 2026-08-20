import { auditTennisMarkets } from "@/lib/tennis-outcomes";
import { analyzeTennisMatch } from "@/services/tennis-analysis-service";
import type { TennisModelVersion, TennisRecordedOutcome, TennisStoredEvent } from "@/types/tennis";

export interface TennisModelMetrics {
  matches: number;
  winnerHits: number;
  winnerAccuracy: number;
  marketHits: number;
  marketTotal: number;
  marketAccuracy: number;
  actionableHits: number;
  actionableTotal: number;
  actionableAccuracy: number;
}

export interface TennisModelComparison {
  before: TennisModelMetrics;
  after: TennisModelMetrics;
  delta: {
    winnerAccuracy: number;
    marketAccuracy: number;
    actionableAccuracy: number;
  };
  jackknife: {
    samples: number;
    minMarketDelta: number;
    maxMarketDelta: number;
    minActionableDelta: number;
    maxActionableDelta: number;
  };
}

function roundRate(hits: number, total: number): number {
  return total ? Math.round(hits / total * 100) : 0;
}

export function officialTennisOutcome(event: TennisStoredEvent): TennisRecordedOutcome | undefined {
  if (!event.actualResult) return undefined;
  const winnerIsPlayer1 = event.actualResult.winner === event.input.player1.name;
  return {
    id: event.id,
    winner: event.actualResult.winner,
    score: event.actualResult.sets.map((set) => winnerIsPlayer1
      ? `${set.playerGames}-${set.opponentGames}`
      : `${set.opponentGames}-${set.playerGames}`
    ).join(" "),
    recordedAt: `${event.input.date}T${event.input.time ?? "00:00"}:00`,
  };
}

export function evaluateTennisModel(
  events: TennisStoredEvent[],
  recordedOutcomes: Record<string, TennisRecordedOutcome>,
  modelVersion: TennisModelVersion,
  excludedEventId?: string
): TennisModelMetrics {
  let matches = 0;
  let winnerHits = 0;
  let marketHits = 0;
  let marketTotal = 0;
  let actionableHits = 0;
  let actionableTotal = 0;

  for (const event of events) {
    if (event.id === excludedEventId) continue;
    const outcome = recordedOutcomes[event.id] ?? officialTennisOutcome(event);
    if (!outcome) continue;
    const analysis = analyzeTennisMatch(event.input, modelVersion);
    const audits = auditTennisMarkets(analysis, outcome);
    const actionableIds = new Set(
      analysis.markets.filter((market) => market.recommendation !== "evitar").map((market) => market.id)
    );

    matches += 1;
    if (analysis.projectedWinner === outcome.winner) winnerHits += 1;
    for (const audit of audits) {
      if (audit.status === "void") continue;
      marketTotal += 1;
      if (audit.status === "hit") marketHits += 1;
      if (actionableIds.has(audit.marketId)) {
        actionableTotal += 1;
        if (audit.status === "hit") actionableHits += 1;
      }
    }
  }

  return {
    matches,
    winnerHits,
    winnerAccuracy: roundRate(winnerHits, matches),
    marketHits,
    marketTotal,
    marketAccuracy: roundRate(marketHits, marketTotal),
    actionableHits,
    actionableTotal,
    actionableAccuracy: roundRate(actionableHits, actionableTotal),
  };
}

export function compareTennisModels(
  events: TennisStoredEvent[],
  recordedOutcomes: Record<string, TennisRecordedOutcome>
): TennisModelComparison {
  const before = evaluateTennisModel(events, recordedOutcomes, "legacy");
  const after = evaluateTennisModel(events, recordedOutcomes, "calibrated");
  const resolvedIds = events
    .filter((event) => recordedOutcomes[event.id] ?? officialTennisOutcome(event))
    .map((event) => event.id);
  const leaveOneOut = resolvedIds.map((eventId) => {
    const legacy = evaluateTennisModel(events, recordedOutcomes, "legacy", eventId);
    const calibrated = evaluateTennisModel(events, recordedOutcomes, "calibrated", eventId);
    return {
      marketDelta: calibrated.marketAccuracy - legacy.marketAccuracy,
      actionableDelta: calibrated.actionableAccuracy - legacy.actionableAccuracy,
    };
  });
  const marketDeltas = leaveOneOut.map((item) => item.marketDelta);
  const actionableDeltas = leaveOneOut.map((item) => item.actionableDelta);

  return {
    before,
    after,
    delta: {
      winnerAccuracy: after.winnerAccuracy - before.winnerAccuracy,
      marketAccuracy: after.marketAccuracy - before.marketAccuracy,
      actionableAccuracy: after.actionableAccuracy - before.actionableAccuracy,
    },
    jackknife: {
      samples: leaveOneOut.length,
      minMarketDelta: marketDeltas.length ? Math.min(...marketDeltas) : 0,
      maxMarketDelta: marketDeltas.length ? Math.max(...marketDeltas) : 0,
      minActionableDelta: actionableDeltas.length ? Math.min(...actionableDeltas) : 0,
      maxActionableDelta: actionableDeltas.length ? Math.max(...actionableDeltas) : 0,
    },
  };
}
