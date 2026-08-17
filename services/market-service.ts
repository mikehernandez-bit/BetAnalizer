import {
  BettingOdds,
  BettingRecommendation,
  CommonOpponentsAnalysis,
  HeadToHead,
  MarketEvidence,
  MarketEvidenceSeries,
  MarketEvaluation,
  MarketSignal,
  MarketRecommendationState,
  RiskFactor,
  RiskLevel,
  Team,
  TeamMatchRecord,
} from "@/types";
import { bettingMarkets } from "@/data/markets";
import { classifyConfidence, computeConfidenceBreakdown, dataQualityFromSampleSize, dataQualityLabel, ConfidenceInputs } from "@/utils/confidence";
import { classifyValue, impliedProbability, valueDifference } from "@/utils/odds";

export interface MarketEvalContext {
  homeTeam: Team;
  awayTeam: Team;
  homeRecords: TeamMatchRecord[];
  awayRecords: TeamMatchRecord[];
  headToHead: HeadToHead;
  commonOpponents: CommonOpponentsAnalysis;
  includeH2H: boolean;
  includeCommonOpponents: boolean;
}

function ratio(records: TeamMatchRecord[], predicate: (r: TeamMatchRecord) => boolean) {
  if (records.length === 0) return { hits: 0, total: 0, pct: 0 };
  const hits = records.filter(predicate).length;
  return { hits, total: records.length, pct: Math.round((hits / records.length) * 100) };
}

function last3Ratio(records: TeamMatchRecord[], predicate: (r: TeamMatchRecord) => boolean): number {
  const sample = records.slice(0, 3);
  if (sample.length === 0) return 50;
  const hits = sample.filter(predicate).length;
  return Math.round((hits / sample.length) * 100);
}

type MetricKey = "goals" | "corners" | "shotsOnTarget" | "shots";

interface RateEvidence {
  hits: number;
  total: number;
  pct: number;
  rawPct: number;
  venuePct?: number;
  score: number;
  venueApplied: boolean;
  overallHits?: number;
  overallTotal?: number;
  overallPct?: number;
  venueName?: string;
}

interface AverageEvidence {
  value: number;
  total: number;
  venueApplied: boolean;
}

const MIN_VENUE_SAMPLE = 3;

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function percentageEvidence<T>(items: T[], predicate: (item: T) => boolean): RateEvidence {
  const total = items.length;
  const hits = items.filter(predicate).length;
  const rawPct = total === 0 ? 0 : Math.round((hits / total) * 100);
  // Laplace smoothing avoids treating a small 100% or 0% sample as certainty.
  const score = total === 0 ? 50 : Math.round(((hits + 1) / (total + 2)) * 100);
  return { hits, total, pct: rawPct, rawPct, score, venueApplied: false };
}

function contextualRecords(records: TeamMatchRecord[], venue: "local" | "visitante"): TeamMatchRecord[] {
  const scoped = records.filter((record) => record.venue === venue);
  return scoped.length >= MIN_VENUE_SAMPLE ? scoped : records;
}

function contextualRate(
  records: TeamMatchRecord[],
  venue: "local" | "visitante",
  predicate: (record: TeamMatchRecord) => boolean
): RateEvidence {
  const overall = percentageEvidence(records, predicate);
  const scoped = records.filter((record) => record.venue === venue);
  if (scoped.length < MIN_VENUE_SAMPLE) return overall;

  const venueRate = percentageEvidence(scoped, predicate);
  const weightedPct = Math.round(venueRate.rawPct * 0.65 + overall.rawPct * 0.35);

  return {
    ...venueRate,
    pct: weightedPct,
    rawPct: weightedPct,
    venuePct: venueRate.rawPct,
    overallHits: overall.hits,
    overallTotal: overall.total,
    overallPct: overall.rawPct,
    score: clampPercentage(venueRate.score * 0.65 + overall.score * 0.35),
    venueApplied: true,
    venueName: venue === "local" ? "en casa" : "fuera",
  };
}

function contextualAverage(
  records: TeamMatchRecord[],
  venue: "local" | "visitante",
  selector: (record: TeamMatchRecord) => number
): AverageEvidence {
  const overall = records.length === 0 ? 0 : records.reduce((sum, record) => sum + selector(record), 0) / records.length;
  const scoped = records.filter((record) => record.venue === venue);
  if (scoped.length < MIN_VENUE_SAMPLE) return { value: overall, total: records.length, venueApplied: false };

  const venueAverage = scoped.reduce((sum, record) => sum + selector(record), 0) / scoped.length;
  return { value: venueAverage * 0.65 + overall * 0.35, total: scoped.length, venueApplied: true };
}

function weightedPercentage(parts: Array<{ value: number; weight: number }>): number {
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  if (totalWeight === 0) return 50;
  return clampPercentage(parts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight);
}

function signalAgreement(first: number, second: number): number {
  return clampPercentage(100 - Math.abs(first - second));
}

function evidenceDetail(evidence: RateEvidence): string {
  if (evidence.venueApplied && evidence.overallTotal !== undefined && evidence.venuePct !== undefined) {
    return `${evidence.hits}/${evidence.total} ${evidence.venueName} (${evidence.venuePct}%) · ${evidence.overallHits}/${evidence.overallTotal} en historial completo (${evidence.overallPct}%)`;
  }
  return `${evidence.hits}/${evidence.total} en historial reciente (${evidence.rawPct}%)`;
}

function poissonProbability(mean: number, comparator: "over" | "under", threshold: number): number {
  const lambda = Math.max(0.05, mean);
  const limit = Math.floor(threshold);
  let atMost = 0;
  let probability = Math.exp(-lambda);
  for (let goals = 0; goals <= limit; goals += 1) {
    if (goals > 0) probability *= lambda / goals;
    atMost += probability;
  }
  const result = comparator === "over" ? 1 - atMost : atMost;
  return clampPercentage(result * 100);
}

/** Límite inferior de Wilson (90%) para no convertir una racha corta en certeza. */
function wilsonLowerBound(hits: number, total: number, z = 1.645): number {
  if (total === 0) return 0;
  const proportion = hits / total;
  const zSquared = z * z;
  const denominator = 1 + zSquared / total;
  const centre = proportion + zSquared / (2 * total);
  const margin = z * Math.sqrt((proportion * (1 - proportion)) / total + zSquared / (4 * total * total));
  return clampPercentage(((centre - margin) / denominator) * 100);
}

function metricKeys(metric: MetricKey): { forKey: keyof TeamMatchRecord; againstKey: keyof TeamMatchRecord; label: string } {
  if (metric === "goals") return { forKey: "goalsFor", againstKey: "goalsAgainst", label: "goles" };
  if (metric === "corners") return { forKey: "cornersFor", againstKey: "cornersAgainst", label: "corners" };
  if (metric === "shotsOnTarget") return { forKey: "shotsOnTargetFor", againstKey: "shotsOnTargetAgainst", label: "tiros al arco" };
  return { forKey: "shotsFor", againstKey: "shotsAgainst", label: "remates" };
}

interface ResolvedMarket {
  estimate: number;
  sampleSize: number;
  positivePatterns: string[];
  probabilitySignals?: MarketSignal[];
  contradictions: string[];
  confidenceInputs: ConfidenceInputs;
  /** Límite prudencial para mercados sensibles a muestras cortas o volatilidad. */
  confidenceCap?: number;
  recommendationThreshold?: number;
  /** Probabilidad mínima para que un mercado pueda etiquetarse como recomendado. */
  recommendationProbabilityThreshold?: number;
  favoredTeamId?: string;
}

const TEAM_SIDE_MARKETS: Record<
  string,
  { side: "home" | "away"; statForKey: keyof TeamMatchRecord; statAgainstKey: keyof TeamMatchRecord; comparator: "gt" | "gte" | "lt" | "lte"; threshold: number }
> = {
  home_team_scores: { side: "home", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "gte", threshold: 1 },
  away_team_scores: { side: "away", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "gte", threshold: 1 },

  goals_home_over_05: { side: "home", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "gt", threshold: 0.5 },
  goals_home_over_15: { side: "home", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "gt", threshold: 1.5 },
  goals_home_under_05: { side: "home", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "lt", threshold: 0.5 },
  goals_home_under_15: { side: "home", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "lt", threshold: 1.5 },
  goals_home_under_25: { side: "home", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "lt", threshold: 2.5 },
  goals_home_under_35: { side: "home", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "lt", threshold: 3.5 },

  goals_away_over_05: { side: "away", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "gt", threshold: 0.5 },
  goals_away_over_15: { side: "away", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "gt", threshold: 1.5 },
  goals_away_under_05: { side: "away", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "lt", threshold: 0.5 },
  goals_away_under_15: { side: "away", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "lt", threshold: 1.5 },
  goals_away_under_25: { side: "away", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "lt", threshold: 2.5 },
  goals_away_under_35: { side: "away", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "lt", threshold: 3.5 },

  first_half_home_over_05: { side: "home", statForKey: "goalsForFirstHalf", statAgainstKey: "goalsAgainstFirstHalf", comparator: "gt", threshold: 0.5 },
  first_half_away_over_05: { side: "away", statForKey: "goalsForFirstHalf", statAgainstKey: "goalsAgainstFirstHalf", comparator: "gt", threshold: 0.5 },
  second_half_home_over_05: { side: "home", statForKey: "goalsForSecondHalf", statAgainstKey: "goalsAgainstSecondHalf", comparator: "gt", threshold: 0.5 },
  second_half_away_over_05: { side: "away", statForKey: "goalsForSecondHalf", statAgainstKey: "goalsAgainstSecondHalf", comparator: "gt", threshold: 0.5 },

  corners_home_over_35: { side: "home", statForKey: "cornersFor", statAgainstKey: "cornersAgainst", comparator: "gt", threshold: 3.5 },
  corners_home_over_45: { side: "home", statForKey: "cornersFor", statAgainstKey: "cornersAgainst", comparator: "gt", threshold: 4.5 },
  corners_away_over_35: { side: "away", statForKey: "cornersFor", statAgainstKey: "cornersAgainst", comparator: "gt", threshold: 3.5 },
  corners_away_over_45: { side: "away", statForKey: "cornersFor", statAgainstKey: "cornersAgainst", comparator: "gt", threshold: 4.5 },
  sot_home_over_25: { side: "home", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 2.5 },
  sot_home_over_35: { side: "home", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 3.5 },
  sot_home_over_45: { side: "home", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 4.5 },
  sot_away_over_25: { side: "away", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 2.5 },
  sot_away_over_35: { side: "away", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 3.5 },
  sot_away_over_45: { side: "away", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 4.5 },
  shots_home_over_85: { side: "home", statForKey: "shotsFor", statAgainstKey: "shotsAgainst", comparator: "gt", threshold: 8.5 },
  shots_home_over_105: { side: "home", statForKey: "shotsFor", statAgainstKey: "shotsAgainst", comparator: "gt", threshold: 10.5 },
  shots_away_over_85: { side: "away", statForKey: "shotsFor", statAgainstKey: "shotsAgainst", comparator: "gt", threshold: 8.5 },
  shots_away_over_105: { side: "away", statForKey: "shotsFor", statAgainstKey: "shotsAgainst", comparator: "gt", threshold: 10.5 },
};

const MATCH_TOTAL_MARKETS: Record<string, { sum: (r: TeamMatchRecord) => number; comparator: "over" | "under"; threshold: number; label: string }> = {
  goals_over_05: { sum: (r) => r.goalsFor + r.goalsAgainst, comparator: "over", threshold: 0.5, label: "goles" },
  goals_over_15: { sum: (r) => r.goalsFor + r.goalsAgainst, comparator: "over", threshold: 1.5, label: "goles" },
  goals_over_25: { sum: (r) => r.goalsFor + r.goalsAgainst, comparator: "over", threshold: 2.5, label: "goles" },
  goals_over_35: { sum: (r) => r.goalsFor + r.goalsAgainst, comparator: "over", threshold: 3.5, label: "goles" },
  goals_under_25: { sum: (r) => r.goalsFor + r.goalsAgainst, comparator: "under", threshold: 2.5, label: "goles" },
  goals_under_35: { sum: (r) => r.goalsFor + r.goalsAgainst, comparator: "under", threshold: 3.5, label: "goles" },
  corners_over_65: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "over", threshold: 6.5, label: "córners" },
  corners_over_75: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "over", threshold: 7.5, label: "córners" },
  corners_over_85: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "over", threshold: 8.5, label: "córners" },
  corners_over_95: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "over", threshold: 9.5, label: "córners" },
  corners_over_105: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "over", threshold: 10.5, label: "córners" },
  corners_over_115: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "over", threshold: 11.5, label: "córners" },
  corners_under_65: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "under", threshold: 6.5, label: "córners" },
  corners_under_75: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "under", threshold: 7.5, label: "córners" },
  corners_under_85: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "under", threshold: 8.5, label: "córners" },
  corners_under_95: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "under", threshold: 9.5, label: "córners" },
  corners_under_105: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "under", threshold: 10.5, label: "córners" },
  corners_under_115: { sum: (r) => r.cornersFor + r.cornersAgainst, comparator: "under", threshold: 11.5, label: "córners" },
  sot_total_over_75: { sum: (r) => (r.shotsOnTargetFor ?? 0) + (r.shotsOnTargetAgainst ?? 0), comparator: "over", threshold: 7.5, label: "tiros al arco" },
  sot_total_over_85: { sum: (r) => (r.shotsOnTargetFor ?? 0) + (r.shotsOnTargetAgainst ?? 0), comparator: "over", threshold: 8.5, label: "tiros al arco" },
  shots_total_over_195: { sum: (r) => (r.shotsFor ?? 0) + (r.shotsAgainst ?? 0), comparator: "over", threshold: 19.5, label: "remates" },
  shots_total_over_215: { sum: (r) => (r.shotsFor ?? 0) + (r.shotsAgainst ?? 0), comparator: "over", threshold: 21.5, label: "remates" },
  shots_total_over_235: { sum: (r) => (r.shotsFor ?? 0) + (r.shotsAgainst ?? 0), comparator: "over", threshold: 23.5, label: "remates" },
};

function combinedRatio(
  homeRecords: TeamMatchRecord[],
  awayRecords: TeamMatchRecord[],
  predicate: (r: TeamMatchRecord) => boolean
) {
  const combined = [...homeRecords, ...awayRecords];
  return ratio(combined, predicate);
}

function buildConfidenceInputs(params: {
  recentPerformance?: number;
  rivalVulnerability?: number;
  homeAwayCondition?: number;
  h2hEstimate?: number;
  includeH2H?: boolean;
  commonOpponentsScore?: number;
  includeCommonOpponents?: boolean;
  lastThreeTrend?: number;
  sampleSize?: number;
}): ConfidenceInputs {
  const basePerf = params.recentPerformance ?? 50;
  const useH2H = params.includeH2H === true;
  const useCommonOpponents = params.includeCommonOpponents === true;
  return {
    recentPerformance: basePerf,
    rivalVulnerability: params.rivalVulnerability ?? basePerf,
    homeAwayCondition: params.homeAwayCondition ?? basePerf,
    headToHead: useH2H ? (params.h2hEstimate ?? 50) : 50,
    commonOpponents: useCommonOpponents ? (params.commonOpponentsScore ?? 50) : 50,
    lastThreeTrend: params.lastThreeTrend ?? basePerf,
    dataQuality: dataQualityFromSampleSize(params.sampleSize ?? 10),
    availableSignals: {
      headToHead: useH2H,
      commonOpponents: useCommonOpponents,
    },
  };
}

function commonOpponentsScoreFor(ctx: MarketEvalContext, favoredTeamId: string | undefined): number {
  const { relevance, betterTeamId } = ctx.commonOpponents.summary;
  const base = relevance === "alta" ? 75 : relevance === "media" ? 58 : 42;
  if (!favoredTeamId || !betterTeamId) return base;
  return betterTeamId === favoredTeamId ? Math.min(96, base + 15) : Math.max(15, base - 20);
}

function resolveTeamSideMarket(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  const def = TEAM_SIDE_MARKETS[marketId];
  const isHome = def.side === "home";
  const team = isHome ? ctx.homeTeam : ctx.awayTeam;
  const records = isHome ? ctx.homeRecords : ctx.awayRecords;
  const rivalRecords = isHome ? ctx.awayRecords : ctx.homeRecords;
  const cmp =
    def.comparator === "gt"
      ? (v: number) => v > def.threshold
      : def.comparator === "gte"
        ? (v: number) => v >= def.threshold
        : def.comparator === "lt"
          ? (v: number) => v < def.threshold
          : (v: number) => v <= def.threshold;

  const getStat = (r: TeamMatchRecord, key: keyof TeamMatchRecord): number => (r[key] as number | undefined) ?? 0;

  const own = contextualRate(records, isHome ? "local" : "visitante", (r) => cmp(getStat(r, def.statForKey)));
  const rivalAgainst = contextualRate(rivalRecords, isHome ? "visitante" : "local", (r) => cmp(getStat(r, def.statAgainstKey)));
  const homeOnly = ratio(records.filter((r) => r.venue === (isHome ? "local" : "visitante")), (r) => cmp(getStat(r, def.statForKey)));
  const lastThree = last3Ratio(records, (r) => cmp(getStat(r, def.statForKey)));

  const positivePatterns = [`${team.shortName} cumplió en ${own.hits} de sus últimos ${own.total} partidos (${own.pct}%).`];
  if (rivalAgainst.total > 0) {
    positivePatterns.push(`El rival lo permitió en ${rivalAgainst.pct}% de sus últimos ${rivalAgainst.total} partidos.`);
  }
  if (homeOnly.total >= 3 && homeOnly.pct >= own.pct + 10) {
    positivePatterns.push(`En condición de ${isHome ? "local" : "visitante"} el cumplimiento sube a ${homeOnly.pct}%.`);
  }

  const contradictions: string[] = [];
  if (Math.abs(own.score - rivalAgainst.score) > 35) {
    contradictions.push("El dato ofensivo y el defensivo no están alineados en la misma dirección.");
  }
  if (records.length < 6) contradictions.push("La muestra disponible para este equipo es reducida.");
  const validOwn = records.filter((r) => r[def.statForKey] !== undefined).length;
  if (validOwn < records.length) {
    contradictions.push(`⚠️ Muestra incompleta: solo ${validOwn} de ${records.length} partidos de ${team.shortName} tienen registro oficial de esta métrica en la fuente.`);
  }

  const estimate = weightedPercentage([
    { value: own.score, weight: 0.6 },
    { value: rivalAgainst.score, weight: 0.4 },
  ]);

  return {
    estimate,
    sampleSize: Math.min(own.total, rivalRecords.length || own.total),
    positivePatterns,
    probabilitySignals: [
      {
        label: `${team.shortName} cumple la linea`,
        value: `${own.rawPct}%`,
        detail: evidenceDetail(own),
      },
      {
        label: `${ctx.awayTeam.id === team.id ? ctx.homeTeam.shortName : ctx.awayTeam.shortName} la permite`,
        value: `${rivalAgainst.rawPct}%`,
        detail: evidenceDetail(rivalAgainst),
      },
      {
        label: "Cruce ataque-defensa",
        value: `${estimate}%`,
        detail: "Ataque 60% y concesion rival 40%",
      },
    ],
    contradictions,
    favoredTeamId: team.id,
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: own.score,
      rivalVulnerability: rivalAgainst.score,
      homeAwayCondition: homeOnly.total >= 3 ? homeOnly.pct : own.score,
      h2hEstimate: 50,
      includeH2H: false,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, team.id),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: lastThree,
      sampleSize: own.total,
    }),
  };
}

function resolveGoalsOver05(ctx: MarketEvalContext): ResolvedMarket {
  const homeScores = contextualRate(ctx.homeRecords, "local", (record) => record.goalsFor >= 1);
  const awayConcedes = contextualRate(ctx.awayRecords, "visitante", (record) => record.goalsAgainst >= 1);
  const awayScores = contextualRate(ctx.awayRecords, "visitante", (record) => record.goalsFor >= 1);
  const homeConcedes = contextualRate(ctx.homeRecords, "local", (record) => record.goalsAgainst >= 1);

  const homeGoalChance = weightedPercentage([
    { value: homeScores.score, weight: 0.6 },
    { value: awayConcedes.score, weight: 0.4 },
  ]);
  const awayGoalChance = weightedPercentage([
    { value: awayScores.score, weight: 0.6 },
    { value: homeConcedes.score, weight: 0.4 },
  ]);
  const atLeastOneGoal = clampPercentage(100 * (1 - (1 - homeGoalChance / 100) * (1 - awayGoalChance / 100)));

  const homeContext = contextualRecords(ctx.homeRecords, "local");
  const awayContext = contextualRecords(ctx.awayRecords, "visitante");
  const historic = percentageEvidence([...homeContext, ...awayContext], (record) => record.goalsFor + record.goalsAgainst >= 1);
  const h2h = percentageEvidence(ctx.headToHead.matches, (match) => match.homeGoals + match.awayGoals >= 1);
  const baseEstimate = weightedPercentage([
    { value: atLeastOneGoal, weight: 0.6 },
    { value: historic.score, weight: 0.4 },
  ]);
  const estimate = ctx.includeH2H && h2h.total >= 2
    ? weightedPercentage([
        { value: baseEstimate, weight: 0.9 },
        { value: h2h.score, weight: 0.1 },
      ])
    : baseEstimate;

  const homeAgreement = signalAgreement(homeScores.score, awayConcedes.score);
  const awayAgreement = signalAgreement(awayScores.score, homeConcedes.score);
  const alignment = Math.min(homeAgreement, awayAgreement);
  const lastThree = weightedPercentage([
    { value: last3Ratio(ctx.homeRecords, (record) => record.goalsFor + record.goalsAgainst >= 1), weight: 0.5 },
    { value: last3Ratio(ctx.awayRecords, (record) => record.goalsFor + record.goalsAgainst >= 1), weight: 0.5 },
  ]);

  return {
    estimate,
    sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    probabilitySignals: [
      { label: `${ctx.homeTeam.shortName} anota +0.5 goles`, value: `${homeScores.rawPct}%`, detail: evidenceDetail(homeScores) },
      { label: `${ctx.awayTeam.shortName} concede +0.5 goles`, value: `${awayConcedes.rawPct}%`, detail: evidenceDetail(awayConcedes) },
      { label: `${ctx.awayTeam.shortName} anota +0.5 goles`, value: `${awayScores.rawPct}%`, detail: evidenceDetail(awayScores) },
      { label: `${ctx.homeTeam.shortName} concede +0.5 goles`, value: `${homeConcedes.rawPct}%`, detail: evidenceDetail(homeConcedes) },
    ],
    positivePatterns: [
      `Modelo de +0.5: local ${homeGoalChance}% y visitante ${awayGoalChance}%; probabilidad conjunta ${atLeastOneGoal}%.`,
      `Historial en condicion local/visitante: ${historic.rawPct}% (${historic.hits}/${historic.total}).`,
    ],
    contradictions:
      alignment < 60
        ? ["Ataque y concesion rival no estan alineados en ambos caminos de gol; la certeza fue penalizada."]
        : [],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: historic.score,
      rivalVulnerability: weightedPercentage([
        { value: awayConcedes.score, weight: 0.5 },
        { value: homeConcedes.score, weight: 0.5 },
      ]),
      homeAwayCondition: atLeastOneGoal,
      h2hEstimate: h2h.score,
      includeH2H: ctx.includeH2H && h2h.total >= 2,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, undefined),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: lastThree,
      sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    }),
  };
}

function metricForTotalMarket(marketId: string): MetricKey | undefined {
  if (marketId.startsWith("goals_")) return "goals";
  if (marketId.startsWith("corners_")) return "corners";
  if (marketId.startsWith("sot_")) return "shotsOnTarget";
  if (marketId.startsWith("shots_")) return "shots";
  return undefined;
}

function resolveMetricTotalMarket(marketId: string, ctx: MarketEvalContext, metric: MetricKey): ResolvedMarket {
  const def = MATCH_TOTAL_MARKETS[marketId];
  const keys = metricKeys(metric);
  const predicate = (record: TeamMatchRecord) =>
    def.comparator === "over" ? def.sum(record) > def.threshold : def.sum(record) < def.threshold;
  const homeContext = contextualRecords(ctx.homeRecords, "local");
  const awayContext = contextualRecords(ctx.awayRecords, "visitante");
  const historic = percentageEvidence([...homeContext, ...awayContext], predicate);
  const homeFor = contextualAverage(ctx.homeRecords, "local", (record) => record[keys.forKey] as number);
  const awayAgainst = contextualAverage(ctx.awayRecords, "visitante", (record) => record[keys.againstKey] as number);
  const awayFor = contextualAverage(ctx.awayRecords, "visitante", (record) => record[keys.forKey] as number);
  const homeAgainst = contextualAverage(ctx.homeRecords, "local", (record) => record[keys.againstKey] as number);
  const expectedHome = homeFor.value * 0.58 + awayAgainst.value * 0.42;
  const expectedAway = awayFor.value * 0.58 + homeAgainst.value * 0.42;
  const expectedTotal = expectedHome + expectedAway;
  const modelPct = poissonProbability(expectedTotal, def.comparator, def.threshold);
  const h2hAvailable = metric === "goals" || metric === "corners";
  const h2h = h2hAvailable
    ? percentageEvidence(ctx.headToHead.matches, (match) => {
        const total = metric === "goals" ? match.homeGoals + match.awayGoals : (match.homeCorners ?? 0) + (match.awayCorners ?? 0);
        return def.comparator === "over" ? total > def.threshold : total < def.threshold;
      })
    : percentageEvidence<TeamMatchRecord>([], () => false);
  const baseEstimate = weightedPercentage([
    { value: historic.score, weight: 0.55 },
    { value: modelPct, weight: 0.45 },
  ]);
  const estimate = ctx.includeH2H && h2hAvailable && h2h.total >= 2
    ? weightedPercentage([
        { value: baseEstimate, weight: 0.9 },
        { value: h2h.score, weight: 0.1 },
      ])
    : baseEstimate;
  const lastThree = weightedPercentage([
    { value: last3Ratio(ctx.homeRecords, predicate), weight: 0.5 },
    { value: last3Ratio(ctx.awayRecords, predicate), weight: 0.5 },
  ]);
  const modelGap = Math.abs(modelPct - historic.score);

  return {
    estimate,
    sampleSize: homeContext.length + awayContext.length,
    probabilitySignals: [
      { label: `${ctx.homeTeam.shortName} genera`, value: homeFor.value.toFixed(1), detail: `${keys.label} por partido` },
      { label: `${ctx.awayTeam.shortName} concede`, value: awayAgainst.value.toFixed(1), detail: `${keys.label} por partido` },
      { label: `${ctx.awayTeam.shortName} genera`, value: awayFor.value.toFixed(1), detail: `${keys.label} por partido` },
      { label: `${ctx.homeTeam.shortName} concede`, value: homeAgainst.value.toFixed(1), detail: `${keys.label} por partido` },
    ],
    positivePatterns: [
      `Media cruzada prevista: ${expectedHome.toFixed(1)} ${keys.label} local + ${expectedAway.toFixed(1)} visitante (${expectedTotal.toFixed(1)} total).`,
      `Cumplimiento historico en condicion local/visitante: ${historic.rawPct}% (${historic.hits}/${historic.total}); modelo ${modelPct}%.`,
    ],
    contradictions: modelGap > 28 ? ["El modelo de ataque-defensa y el historial directo difieren; la certeza fue reducida."] : [],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: historic.score,
      rivalVulnerability: modelPct,
      homeAwayCondition: weightedPercentage([
        { value: historic.score, weight: 0.5 },
        { value: modelPct, weight: 0.5 },
      ]),
      h2hEstimate: h2h.score,
      includeH2H: ctx.includeH2H && h2hAvailable && h2h.total >= 2,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, undefined),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: lastThree,
      sampleSize: homeContext.length + awayContext.length,
    }),
  };
}

function resolveMatchTotalMarket(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  if (marketId === "goals_over_05") return resolveGoalsOver05(ctx);
  const metric = metricForTotalMarket(marketId);
  if (metric) return resolveMetricTotalMarket(marketId, ctx, metric);
  const def = MATCH_TOTAL_MARKETS[marketId];
  const predicate = (r: TeamMatchRecord) => (def.comparator === "over" ? def.sum(r) > def.threshold : def.sum(r) < def.threshold);
  const combined = combinedRatio(ctx.homeRecords, ctx.awayRecords, predicate);
  const homeSide = ratio(ctx.homeRecords, predicate);
  const awaySide = ratio(ctx.awayRecords, predicate);
  const lastThree = last3Ratio([...ctx.homeRecords.slice(0, 3), ...ctx.awayRecords.slice(0, 3)], predicate);

  const h2hAvg = def.label === "goles" ? ctx.headToHead.summary.avgGoals : def.label === "córners" ? ctx.headToHead.summary.avgCorners : null;
  const h2hDelta = h2hAvg === null ? 0 : def.comparator === "over" ? h2hAvg - def.threshold : def.threshold - h2hAvg;
  const h2hEstimate = h2hAvg === null ? 50 : Math.round(Math.min(95, Math.max(5, 50 + h2hDelta * 12)));

  return {
    estimate: combined.pct,
    sampleSize: combined.total,
    probabilitySignals: [
      { label: `${ctx.homeTeam.shortName}: tabla local`, value: `${homeSide.pct}%`, detail: `${homeSide.hits}/${homeSide.total} cumple la linea en sus partidos` },
      { label: `${ctx.awayTeam.shortName}: tabla visitante`, value: `${awaySide.pct}%`, detail: `${awaySide.hits}/${awaySide.total} cumple la linea en sus partidos` },
      { label: "Cruce combinado de ambas tablas", value: `${combined.pct}%`, detail: `Integracion de ${combined.hits}/${combined.total} partidos totales` },
    ],
    positivePatterns: [
      `Se cumplió en ${combined.hits} de los últimos ${combined.total} partidos combinados de ambos equipos (${combined.pct}%).`,
      `${ctx.homeTeam.shortName} (Local): ${homeSide.pct}% · ${ctx.awayTeam.shortName} (Visitante): ${awaySide.pct}%.`,
    ],
    contradictions: Math.abs(homeSide.pct - awaySide.pct) > 40 ? ["Existe una diferencia notable entre la tabla del local y la del visitante para este mercado."] : [],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: combined.pct,
      rivalVulnerability: Math.round((homeSide.pct + awaySide.pct) / 2),
      homeAwayCondition: combined.pct,
      h2hEstimate,
      includeH2H: ctx.includeH2H,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, undefined),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: lastThree,
      sampleSize: combined.total,
    }),
  };
}

function resolveBtts(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  const homeSide = ratio(ctx.homeRecords, (r) => r.goalsFor >= 1 && r.goalsAgainst >= 1);
  const awaySide = ratio(ctx.awayRecords, (r) => r.goalsFor >= 1 && r.goalsAgainst >= 1);
  const combined = combinedRatio(ctx.homeRecords, ctx.awayRecords, (r) => r.goalsFor >= 1 && r.goalsAgainst >= 1);

  const homeScores = contextualRate(ctx.homeRecords, "local", (r) => r.goalsFor >= 1);
  const awayConcedes = contextualRate(ctx.awayRecords, "visitante", (r) => r.goalsAgainst >= 1);
  const awayScores = contextualRate(ctx.awayRecords, "visitante", (r) => r.goalsFor >= 1);
  const homeConcedes = contextualRate(ctx.homeRecords, "local", (r) => r.goalsAgainst >= 1);

  const homeGoalProb = (homeScores.score * 0.6 + awayConcedes.score * 0.4) / 100;
  const awayGoalProb = (awayScores.score * 0.6 + homeConcedes.score * 0.4) / 100;
  const bttsYesProb = Math.round(homeGoalProb * awayGoalProb * 100);
  const rawEstimate = marketId === "btts_yes" ? bttsYesProb : 100 - bttsYesProb;
  const estimate = weightedPercentage([
    { value: rawEstimate, weight: 0.6 },
    { value: marketId === "btts_yes" ? combined.pct : 100 - combined.pct, weight: 0.4 },
  ]);

  const lastThree = last3Ratio(
    [...ctx.homeRecords.slice(0, 3), ...ctx.awayRecords.slice(0, 3)],
    (r) => r.goalsFor >= 1 && r.goalsAgainst >= 1
  );

  return {
    estimate,
    sampleSize: combined.total,
    probabilitySignals: [
      {
        label: `${ctx.homeTeam.shortName} marca (vs permite ${ctx.awayTeam.shortName})`,
        value: `${Math.round(homeGoalProb * 100)}%`,
        detail: `Local marca en ${homeScores.rawPct}%, visitante concede en ${awayConcedes.rawPct}%`,
      },
      {
        label: `${ctx.awayTeam.shortName} marca (vs permite ${ctx.homeTeam.shortName})`,
        value: `${Math.round(awayGoalProb * 100)}%`,
        detail: `Visitante marca en ${awayScores.rawPct}%, local concede en ${homeConcedes.rawPct}%`,
      },
      {
        label: `Cruce ambas tablas (BTTS ${marketId === "btts_yes" ? "Sí" : "No"})`,
        value: `${estimate}%`,
        detail: `Modelo cruzado de ataque-defensa de ambos equipos`,
      },
    ],
    positivePatterns: [
      `Cruce de ambas tablas: ${ctx.homeTeam.shortName} anota en ${homeScores.rawPct}% en casa y ${ctx.awayTeam.shortName} en ${awayScores.rawPct}% fuera.`,
      `Cumplimiento BTTS directo: ${ctx.homeTeam.shortName} (Local): ${homeSide.pct}% · ${ctx.awayTeam.shortName} (Visitante): ${awaySide.pct}%.`,
    ],
    contradictions: [],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: estimate,
      rivalVulnerability: estimate,
      homeAwayCondition: estimate,
      h2hEstimate: ctx.headToHead.summary.bothScoredPct,
      includeH2H: ctx.includeH2H,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, undefined),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: marketId === "btts_yes" ? lastThree : 100 - lastThree,
      sampleSize: combined.total,
    }),
  };
}

interface HandicapMarketDefinition {
  metric: "goals" | "corners";
  side: "home" | "away";
  handicap: number;
}

const GOALS_HANDICAP_MARKETS: Record<string, HandicapMarketDefinition> = {
  goals_handicap_home_minus_05: { metric: "goals", side: "home", handicap: -0.5 },
  goals_handicap_home_plus_05: { metric: "goals", side: "home", handicap: 0.5 },
  goals_handicap_home_minus_15: { metric: "goals", side: "home", handicap: -1.5 },
  goals_handicap_home_plus_15: { metric: "goals", side: "home", handicap: 1.5 },
  goals_handicap_away_minus_05: { metric: "goals", side: "away", handicap: -0.5 },
  goals_handicap_away_plus_05: { metric: "goals", side: "away", handicap: 0.5 },
  goals_handicap_away_minus_15: { metric: "goals", side: "away", handicap: -1.5 },
  goals_handicap_away_plus_15: { metric: "goals", side: "away", handicap: 1.5 },
};

const CORNERS_HANDICAP_MARKETS: Record<string, HandicapMarketDefinition> = {
  corners_home_most: { metric: "corners", side: "home", handicap: -0.5 },
  corners_away_most: { metric: "corners", side: "away", handicap: -0.5 },
  corners_handicap_home_minus_15: { metric: "corners", side: "home", handicap: -1.5 },
  corners_handicap_home_plus_15: { metric: "corners", side: "home", handicap: 1.5 },
  corners_handicap_away_minus_15: { metric: "corners", side: "away", handicap: -1.5 },
  corners_handicap_away_plus_15: { metric: "corners", side: "away", handicap: 1.5 },
};

function handicapLabel(handicap: number): string {
  return `${handicap > 0 ? "+" : ""}${handicap.toFixed(1)}`;
}

function h2hHandicapRate(ctx: MarketEvalContext, teamId: string, opponentId: string, def: HandicapMarketDefinition): RateEvidence {
  const matches = ctx.headToHead.matches.filter(
    (match) =>
      (match.homeTeamId === teamId && match.awayTeamId === opponentId) ||
      (match.homeTeamId === opponentId && match.awayTeamId === teamId)
  );
  return percentageEvidence(matches, (match) => {
    const teamAtHome = match.homeTeamId === teamId;
    const teamValue = (def.metric === "goals"
      ? (teamAtHome ? match.homeGoals : match.awayGoals)
      : (teamAtHome ? match.homeCorners : match.awayCorners)) ?? 0;
    const opponentValue = (def.metric === "goals"
      ? (teamAtHome ? match.awayGoals : match.homeGoals)
      : (teamAtHome ? match.awayCorners : match.homeCorners)) ?? 0;
    return teamValue + def.handicap > opponentValue;
  });
}

function resolveHandicapMarket(def: HandicapMarketDefinition, ctx: MarketEvalContext): ResolvedMarket {
  const isHome = def.side === "home";
  const team = isHome ? ctx.homeTeam : ctx.awayTeam;
  const rival = isHome ? ctx.awayTeam : ctx.homeTeam;
  const records = isHome ? ctx.homeRecords : ctx.awayRecords;
  const rivalRecords = isHome ? ctx.awayRecords : ctx.homeRecords;
  const keys = metricKeys(def.metric);
  const ownPredicate = (record: TeamMatchRecord) => (record[keys.forKey] as number) + def.handicap > (record[keys.againstKey] as number);
  const rivalAllowsPredicate = (record: TeamMatchRecord) => (record[keys.againstKey] as number) + def.handicap > (record[keys.forKey] as number);
  const own = contextualRate(records, isHome ? "local" : "visitante", ownPredicate);
  const rivalAllows = contextualRate(rivalRecords, isHome ? "visitante" : "local", rivalAllowsPredicate);
  const h2h = h2hHandicapRate(ctx, team.id, rival.id, def);
  const baseEstimate = weightedPercentage([
    { value: own.score, weight: 0.58 },
    { value: rivalAllows.score, weight: 0.42 },
  ]);
  const estimate = ctx.includeH2H && h2h.total >= 2
    ? weightedPercentage([
        { value: baseEstimate, weight: 0.9 },
        { value: h2h.score, weight: 0.1 },
      ])
    : baseEstimate;
  const agreement = signalAgreement(own.score, rivalAllows.score);
  const line = handicapLabel(def.handicap);

  return {
    estimate,
    sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    favoredTeamId: team.id,
    probabilitySignals: [
      { label: `${team.shortName} cubre ${line}`, value: `${own.rawPct}%`, detail: evidenceDetail(own) },
      { label: `${rival.shortName} permite ${line}`, value: `${rivalAllows.rawPct}%`, detail: evidenceDetail(rivalAllows) },
      { label: "Cruce de hándicap", value: `${estimate}%`, detail: "Rendimiento propio 58% y rival 42%" },
    ],
    positivePatterns: [
      `${team.shortName} cubre el hándicap ${line} en ${own.hits}/${own.total}; ${rival.shortName} lo permite en ${rivalAllows.hits}/${rivalAllows.total}.`,
      ctx.includeH2H && h2h.total >= 2 ? `H2H disponible: ${h2h.rawPct}% (${h2h.hits}/${h2h.total}).` : "Sin dependencia de H2H para esta estimacion.",
    ],
    contradictions: agreement < 60 ? ["La forma del equipo y lo que permite el rival discrepan para este hándicap."] : [],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: own.score,
      rivalVulnerability: rivalAllows.score,
      homeAwayCondition: own.score,
      h2hEstimate: h2h.score,
      includeH2H: ctx.includeH2H && h2h.total >= 2,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, team.id),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: last3Ratio(records, ownPredicate),
      sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    }),
  };
}

function resolveCornersMostTeam(ctx: MarketEvalContext): ResolvedMarket {
  const homeAvg = ctx.homeRecords.reduce((s, r) => s + r.cornersFor, 0) / Math.max(1, ctx.homeRecords.length);
  const awayAvg = ctx.awayRecords.reduce((s, r) => s + r.cornersFor, 0) / Math.max(1, ctx.awayRecords.length);
  const estimate = Math.round(Math.min(90, Math.max(10, 50 + (homeAvg - awayAvg) * 9)));

  return {
    estimate,
    sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    positivePatterns: [
      `${ctx.homeTeam.shortName} promedia ${homeAvg.toFixed(1)} córners a favor frente a ${awayAvg.toFixed(1)} de ${ctx.awayTeam.shortName}.`,
    ],
    contradictions: [],
    favoredTeamId: estimate >= 50 ? ctx.homeTeam.id : ctx.awayTeam.id,
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: estimate,
      rivalVulnerability: estimate,
      homeAwayCondition: estimate,
      h2hEstimate: 50,
      includeH2H: false,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, estimate >= 50 ? ctx.homeTeam.id : ctx.awayTeam.id),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: estimate,
      sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    }),
  };
}

interface OutcomeDistribution {
  home: number;
  draw: number;
  away: number;
  sampleSize: number;
}

interface ResultProjectionSource {
  id: string;
  label: string;
  distribution: OutcomeDistribution;
  weight: number;
  detail: string;
  applied: boolean;
}

function normalizeOutcomeDistribution(home: number, draw: number, away: number, sampleSize: number): OutcomeDistribution {
  const total = home + draw + away;
  if (total <= 0) return { home: 33, draw: 34, away: 33, sampleSize };

  const normalizedHome = Math.round((home / total) * 100);
  const normalizedDraw = Math.round((draw / total) * 100);
  return {
    home: normalizedHome,
    draw: normalizedDraw,
    away: 100 - normalizedHome - normalizedDraw,
    sampleSize,
  };
}

/**
 * Distribución 1X2 con suavizado de Laplace. La perspectiva siempre queda
 * expresada respecto al partido actual: local / empate / visitante.
 */
function outcomeDistributionFromRecords(records: TeamMatchRecord[], perspective: "home" | "away"): OutcomeDistribution {
  let home = 1;
  let draw = 1;
  let away = 1;

  for (const record of records) {
    if (record.goalsFor === record.goalsAgainst) {
      draw += 1;
    } else if (record.goalsFor > record.goalsAgainst) {
      if (perspective === "home") home += 1;
      else away += 1;
    } else if (perspective === "home") {
      away += 1;
    } else {
      home += 1;
    }
  }

  return normalizeOutcomeDistribution(home, draw, away, records.length);
}

function outcomeDistributionFromH2H(ctx: MarketEvalContext): OutcomeDistribution | undefined {
  const matches = ctx.headToHead.matches;
  if (matches.length === 0) return undefined;

  let home = 1;
  let draw = 1;
  let away = 1;

  for (const match of matches) {
    const homeGoals = match.homeTeamId === ctx.homeTeam.id ? match.homeGoals : match.awayGoals;
    const awayGoals = match.homeTeamId === ctx.awayTeam.id ? match.homeGoals : match.awayGoals;
    if (homeGoals === awayGoals) draw += 1;
    else if (homeGoals > awayGoals) home += 1;
    else away += 1;
  }

  return normalizeOutcomeDistribution(home, draw, away, matches.length);
}

function outcomeDistributionFromCommonOpponents(ctx: MarketEvalContext): OutcomeDistribution | undefined {
  const opponents = ctx.commonOpponents.opponents;
  if (opponents.length === 0) return undefined;

  const resultPoints = (result: TeamMatchRecord["result"]): number => (result === "W" ? 1 : result === "D" ? 0.5 : 0);
  const pointAdvantage = opponents.reduce(
    (sum, opponent) => sum + resultPoints(opponent.teamA.result) - resultPoints(opponent.teamB.result),
    0
  ) / opponents.length;
  const goalAdvantage = opponents.reduce(
    (sum, opponent) =>
      sum + (opponent.teamA.goalsFor - opponent.teamA.goalsAgainst) - (opponent.teamB.goalsFor - opponent.teamB.goalsAgainst),
    0
  ) / opponents.length;

  // El rival común es una señal secundaria: limita su influencia incluso
  // cuando la diferencia de goles en un único cruce haya sido muy grande.
  const advantage = Math.max(-1, Math.min(1, pointAdvantage * 0.7 + goalAdvantage * 0.1));
  return normalizeOutcomeDistribution(35 + advantage * 15, 30, 35 - advantage * 15, opponents.length);
}

/**
 * Convierte la expectativa ofensiva/defensiva de ambos equipos en 1X2. Esta
 * fuente no reemplaza el historial de resultados: lo contrasta para no tratar
 * una racha corta de victorias como una certeza cuando la producción de goles
 * de local y visitante es pareja.
 */
function outcomeDistributionFromGoalStrength(ctx: MarketEvalContext): { distribution: OutcomeDistribution; homeGoals: number; awayGoals: number } {
  const homeFor = contextualAverage(ctx.homeRecords, "local", (record) => record.goalsFor).value;
  const homeAgainst = contextualAverage(ctx.homeRecords, "local", (record) => record.goalsAgainst).value;
  const awayFor = contextualAverage(ctx.awayRecords, "visitante", (record) => record.goalsFor).value;
  const awayAgainst = contextualAverage(ctx.awayRecords, "visitante", (record) => record.goalsAgainst).value;
  const homeGoals = Math.max(0.2, (homeFor + awayAgainst) / 2);
  const awayGoals = Math.max(0.2, (awayFor + homeAgainst) / 2);

  let home = 0;
  let draw = 0;
  let away = 0;
  const poissonMasses = (mean: number) => {
    const masses = [Math.exp(-mean)];
    for (let goals = 1; goals <= 8; goals += 1) masses.push(masses[goals - 1] * mean / goals);
    return masses;
  };
  const homeMasses = poissonMasses(homeGoals);
  const awayMasses = poissonMasses(awayGoals);
  for (let homeScore = 0; homeScore < homeMasses.length; homeScore += 1) {
    for (let awayScore = 0; awayScore < awayMasses.length; awayScore += 1) {
      const probability = homeMasses[homeScore] * awayMasses[awayScore];
      if (homeScore === awayScore) draw += probability;
      else if (homeScore > awayScore) home += probability;
      else away += probability;
    }
  }

  return {
    distribution: normalizeOutcomeDistribution(home, draw, away, Math.min(ctx.homeRecords.length, ctx.awayRecords.length)),
    homeGoals,
    awayGoals,
  };
}

function outcomeProbability(distribution: OutcomeDistribution, marketId: string): number {
  if (marketId === "result_home_win") return distribution.home;
  if (marketId === "result_away_win") return distribution.away;
  if (marketId === "result_draw") return distribution.draw;
  if (marketId === "result_dc_home") return distribution.home + distribution.draw;
  return distribution.away + distribution.draw;
}

function blendOutcomeDistributions(sources: ResultProjectionSource[]): OutcomeDistribution {
  const applied = sources.filter((source) => source.applied && source.weight > 0);
  if (applied.length === 0) return { home: 33, draw: 34, away: 33, sampleSize: 0 };

  const totalWeight = applied.reduce((sum, source) => sum + source.weight, 0);
  return normalizeOutcomeDistribution(
    applied.reduce((sum, source) => sum + source.distribution.home * source.weight, 0) / totalWeight,
    applied.reduce((sum, source) => sum + source.distribution.draw * source.weight, 0) / totalWeight,
    applied.reduce((sum, source) => sum + source.distribution.away * source.weight, 0) / totalWeight,
    Math.min(...applied.filter((source) => source.distribution.sampleSize > 0).map((source) => source.distribution.sampleSize))
  );
}

function resultOutcomeLabel(marketId: string, homeTeam: Team, awayTeam: Team): string {
  if (marketId === "result_home_win") return `victoria de ${homeTeam.shortName}`;
  if (marketId === "result_away_win") return `victoria de ${awayTeam.shortName}`;
  if (marketId === "result_draw") return "empate";
  if (marketId === "result_dc_home") return `1X (${homeTeam.shortName} o empate)`;
  return `X2 (${awayTeam.shortName} o empate)`;
}

function resolveResult(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  const homeAtHome = ctx.homeRecords.filter((record) => record.venue === "local");
  const awayAway = ctx.awayRecords.filter((record) => record.venue === "visitante");
  const homeVenueApplied = homeAtHome.length >= MIN_VENUE_SAMPLE;
  const awayVenueApplied = awayAway.length >= MIN_VENUE_SAMPLE;
  const h2hDistribution = ctx.includeH2H ? outcomeDistributionFromH2H(ctx) : undefined;
  const commonDistribution = ctx.includeCommonOpponents ? outcomeDistributionFromCommonOpponents(ctx) : undefined;
  const goalStrength = outcomeDistributionFromGoalStrength(ctx);
  const h2hSample = ctx.headToHead.matches.length;
  const commonSample = ctx.commonOpponents.opponents.length;

  const sources: ResultProjectionSource[] = [
    {
      id: "home-venue",
      label: `${ctx.homeTeam.shortName} como local`,
      distribution: outcomeDistributionFromRecords(homeAtHome, "home"),
      weight: 0.22,
      detail: homeVenueApplied
        ? `${homeAtHome.length} partidos de ${ctx.homeTeam.shortName} como local.`
        : `Solo ${homeAtHome.length} partidos como local; se informa, pero no se duplica el historial total.`,
      applied: homeVenueApplied,
    },
    {
      id: "away-venue",
      label: `${ctx.awayTeam.shortName} como visitante`,
      distribution: outcomeDistributionFromRecords(awayAway, "away"),
      weight: 0.22,
      detail: awayVenueApplied
        ? `${awayAway.length} partidos de ${ctx.awayTeam.shortName} como visitante.`
        : `Solo ${awayAway.length} partidos como visitante; se informa, pero no se duplica el historial total.`,
      applied: awayVenueApplied,
    },
    {
      id: "home-total",
      label: `Historial total ${ctx.homeTeam.shortName}`,
      distribution: outcomeDistributionFromRecords(ctx.homeRecords, "home"),
      weight: 0.13,
      detail: `${ctx.homeRecords.length} partidos oficiales recientes de ${ctx.homeTeam.shortName}.`,
      applied: ctx.homeRecords.length > 0,
    },
    {
      id: "away-total",
      label: `Historial total ${ctx.awayTeam.shortName}`,
      distribution: outcomeDistributionFromRecords(ctx.awayRecords, "away"),
      weight: 0.13,
      detail: `${ctx.awayRecords.length} partidos oficiales recientes de ${ctx.awayTeam.shortName}.`,
      applied: ctx.awayRecords.length > 0,
    },
    {
      id: "goal-strength",
      label: "Ataque y defensa por condición",
      distribution: goalStrength.distribution,
      weight: 0.24,
      detail: `Expectativa de gol: ${ctx.homeTeam.shortName} ${goalStrength.homeGoals.toFixed(2)} · ${ctx.awayTeam.shortName} ${goalStrength.awayGoals.toFixed(2)}.`,
      applied: ctx.homeRecords.length > 0 && ctx.awayRecords.length > 0,
    },
    {
      id: "h2h",
      label: "Enfrentamiento directo (H2H)",
      distribution: h2hDistribution ?? { home: 33, draw: 34, away: 33, sampleSize: 0 },
      // Un solo H2H es informativo, pero nunca puede dominar el modelo.
      weight: Math.min(0.06, 0.02 + h2hSample * 0.01),
      detail: `${h2hSample} enfrentamiento${h2hSample === 1 ? "" : "s"} directo${h2hSample === 1 ? "" : "s"} disponible${h2hSample === 1 ? "" : "s"}.`,
      applied: Boolean(h2hDistribution),
    },
    {
      id: "common-opponents",
      label: "Rivales en común",
      distribution: commonDistribution ?? { home: 33, draw: 34, away: 33, sampleSize: 0 },
      weight: ctx.commonOpponents.summary.relevance === "alta" ? 0.06 : ctx.commonOpponents.summary.relevance === "media" ? 0.04 : 0.02,
      detail: `${commonSample} rival${commonSample === 1 ? "" : "es"} en común; relevancia ${ctx.commonOpponents.summary.relevance}.`,
      applied: Boolean(commonDistribution),
    },
  ];

  const projection = blendOutcomeDistributions(sources);
  const estimate = outcomeProbability(projection, marketId);
  const targetLabel = resultOutcomeLabel(marketId, ctx.homeTeam, ctx.awayTeam);
  const targetSourceValues = sources.filter(
    (source) => (source.id !== "h2h" && source.id !== "common-opponents") || source.applied
  );
  const contextualValues = sources
    .filter((source) => source.id === "home-venue" || source.id === "away-venue")
    .filter((source) => source.applied)
    .map((source) => outcomeProbability(source.distribution, marketId));
  const recentHome = sources.find((source) => source.id === "home-total")!;
  const recentAway = sources.find((source) => source.id === "away-total")!;
  const h2hSource = sources.find((source) => source.id === "h2h")!;
  const commonSource = sources.find((source) => source.id === "common-opponents")!;
  const lastThreeProjection = blendOutcomeDistributions([
    {
      ...recentHome,
      distribution: outcomeDistributionFromRecords(ctx.homeRecords.slice(0, 3), "home"),
      weight: 0.5,
      applied: ctx.homeRecords.length > 0,
    },
    {
      ...recentAway,
      distribution: outcomeDistributionFromRecords(ctx.awayRecords.slice(0, 3), "away"),
      weight: 0.5,
      applied: ctx.awayRecords.length > 0,
    },
  ]);
  const sourceValues = targetSourceValues.filter((source) => source.applied).map((source) => outcomeProbability(source.distribution, marketId));
  const spread = sourceValues.length > 1 ? Math.max(...sourceValues) - Math.min(...sourceValues) : 0;
  const winnerProbabilities = [projection.home, projection.draw, projection.away].sort((first, second) => second - first);
  const winningMargin = winnerProbabilities[0] - winnerProbabilities[1];
  const isSimpleWinner = marketId === "result_home_win" || marketId === "result_away_win";
  const isDoubleChance = marketId === "result_dc_home" || marketId === "result_dc_away";
  const selectedWinnerProbability = marketId === "result_home_win" ? projection.home : projection.away;
  const selectedWinnerLeads = selectedWinnerProbability === winnerProbabilities[0];
  const lowConsensusWinner = isSimpleWinner && (!selectedWinnerLeads || winningMargin < 10 || spread >= 28);
  const confidenceCap = lowConsensusWinner ? 65 : isSimpleWinner && spread >= 20 ? 72 : undefined;
  const favoredTeamId = marketId === "result_home_win" || marketId === "result_dc_home"
    ? ctx.homeTeam.id
    : marketId === "result_away_win" || marketId === "result_dc_away"
      ? ctx.awayTeam.id
      : undefined;

  return {
    estimate,
    sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    probabilitySignals: targetSourceValues.map((source) => ({
      label: source.label,
      value: `${outcomeProbability(source.distribution, marketId)}%`,
      detail: `${source.detail} Probabilidad para ${targetLabel}: ${outcomeProbability(source.distribution, marketId)}%${source.applied ? "." : " No se pondera por muestra insuficiente."}`,
    })),
    positivePatterns: [
      `Proyección 1X2: ${ctx.homeTeam.shortName} ${projection.home}% · Empate ${projection.draw}% · ${ctx.awayTeam.shortName} ${projection.away}%.`,
      `La estimación de ${targetLabel} es ${estimate}% y combina ${sources.filter((source) => source.applied).map((source) => source.label).join(", ")}.`,
    ],
    contradictions: [
      ...(homeVenueApplied ? [] : [`Muestra local reducida de ${ctx.homeTeam.shortName}; el historial total recibe la ponderación correspondiente.`]),
      ...(awayVenueApplied ? [] : [`Muestra visitante reducida de ${ctx.awayTeam.shortName}; el historial total recibe la ponderación correspondiente.`]),
      ...(spread >= 35 ? ["Las fuentes disponibles discrepan de forma relevante sobre el resultado."] : []),
      ...(lowConsensusWinner ? ["No hay una ventaja suficiente y consistente para recomendar una victoria simple."] : []),
    ],
    confidenceCap,
    recommendationThreshold: isSimpleWinner ? 70 : isDoubleChance ? 62 : undefined,
    recommendationProbabilityThreshold: isSimpleWinner ? 45 : isDoubleChance ? 65 : undefined,
    favoredTeamId,
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: Math.round((outcomeProbability(recentHome.distribution, marketId) + outcomeProbability(recentAway.distribution, marketId)) / 2),
      rivalVulnerability: contextualValues.length > 0 ? Math.round(contextualValues.reduce((sum, value) => sum + value, 0) / contextualValues.length) : estimate,
      homeAwayCondition: contextualValues.length > 0 ? Math.round(contextualValues.reduce((sum, value) => sum + value, 0) / contextualValues.length) : estimate,
      h2hEstimate: outcomeProbability(h2hSource.distribution, marketId),
      includeH2H: h2hSource.applied,
      commonOpponentsScore: outcomeProbability(commonSource.distribution, marketId),
      includeCommonOpponents: commonSource.applied,
      lastThreeTrend: outcomeProbability(lastThreeProjection, marketId),
      sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    }),
  };
}

/**
 * Primera/segunda parte: usa el desglose REAL por tiempo (goalsForFirstHalf/
 * SecondHalf, etc.) cuando hay suficientes partidos con ese dato confirmado
 * en la fuente — ver lib/match-package-prompt.ts, regla 18. Ese campo es
 * opcional (muchas fuentes no publican el resultado al descanso), así que
 * solo se cuentan los partidos donde SÍ está presente; nunca se completa el
 * resto "a ojo". Si la muestra real es insuficiente (<4 partidos con el
 * dato), cae al método anterior: una estimación aproximada a partir del
 * mercado equivalente a partido completo, dejado claro como tal.
 */
const HALF_GOALS_MARKETS: Record<string, { comparator: "over" | "under"; threshold: number }> = {
  first_half_over_05: { comparator: "over", threshold: 0.5 },
  first_half_over_15: { comparator: "over", threshold: 1.5 },
  first_half_over_25: { comparator: "over", threshold: 2.5 },
  first_half_over_35: { comparator: "over", threshold: 3.5 },
  first_half_under_25: { comparator: "under", threshold: 2.5 },
  first_half_under_35: { comparator: "under", threshold: 3.5 },
  second_half_over_05: { comparator: "over", threshold: 0.5 },
  second_half_over_15: { comparator: "over", threshold: 1.5 },
  second_half_over_25: { comparator: "over", threshold: 2.5 },
  second_half_over_35: { comparator: "over", threshold: 3.5 },
  second_half_under_25: { comparator: "under", threshold: 2.5 },
  second_half_under_35: { comparator: "under", threshold: 3.5 },
};

function resolveHalfMarket(half: "first" | "second", marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  const forKey = half === "first" ? "goalsForFirstHalf" : "goalsForSecondHalf";
  const againstKey = half === "first" ? "goalsAgainstFirstHalf" : "goalsAgainstSecondHalf";
  const halfLabel = half === "first" ? "primer" : "segundo";
  const halfShort = half === "first" ? "1T" : "2T";

  const isBtts = marketId === `${half}_half_btts`;
  const isWinHome = marketId === `${half}_half_win_home`;
  const isWinAway = marketId === `${half}_half_win_away`;
  const isDcHome = marketId === `${half}_half_dc_home`;
  const isDcAway = marketId === `${half}_half_dc_away`;
  const isHalfTeamMarket = isWinHome || isWinAway || isDcHome || isDcAway;

  const hasData = (r: TeamMatchRecord) => r[forKey] !== undefined && r[againstKey] !== undefined;
  const homeUsable = ctx.homeRecords.filter(hasData);
  const awayUsable = ctx.awayRecords.filter(hasData);
  const effectiveSampleSize = Math.min(homeUsable.length, awayUsable.length);
  const halfConfidenceCap = effectiveSampleSize < 20 ? 75 : undefined;

  if (isHalfTeamMarket) {
    const isHomeSide = isWinHome || isDcHome;
    const team = isHomeSide ? ctx.homeTeam : ctx.awayTeam;
    const rival = isHomeSide ? ctx.awayTeam : ctx.homeTeam;
    const teamUsable = isHomeSide ? homeUsable : awayUsable;
    const rivalUsable = isHomeSide ? awayUsable : homeUsable;

    const teamPredicate = isWinHome || isWinAway
      ? (r: TeamMatchRecord) => (r[forKey] as number) > (r[againstKey] as number)
      : (r: TeamMatchRecord) => (r[forKey] as number) >= (r[againstKey] as number);

    const rivalPredicate = isWinHome || isWinAway
      ? (r: TeamMatchRecord) => (r[againstKey] as number) > (r[forKey] as number)
      : (r: TeamMatchRecord) => (r[againstKey] as number) >= (r[forKey] as number);

    const teamRate = percentageEvidence(teamUsable, teamPredicate);
    const rivalRate = percentageEvidence(rivalUsable, rivalPredicate);

    const sampleTotal = teamUsable.length + rivalUsable.length;
    if (sampleTotal >= 2) {
      const estimate = weightedPercentage([
        { value: teamRate.rawPct, weight: 0.6 },
        { value: rivalRate.rawPct, weight: 0.4 },
      ]);
      const lastThree = last3Ratio(teamUsable, teamPredicate);
      const actionText = isWinHome || isWinAway ? "ganó" : "ganó o empató";

      return {
        estimate,
        sampleSize: effectiveSampleSize,
        confidenceCap: halfConfidenceCap,
        recommendationThreshold: halfConfidenceCap ?? 60,
        favoredTeamId: team.id,
        probabilitySignals: [
          {
            label: `${team.shortName} en ${halfShort}`,
            value: `${teamRate.rawPct}%`,
            detail: `${team.shortName} ${actionText} el ${halfLabel} tiempo en ${teamRate.hits} de ${teamRate.total} partidos (${teamRate.rawPct}%)`,
          },
          {
            label: `${rival.shortName} en ${halfShort}`,
            value: `${rivalRate.rawPct}%`,
            detail: `${rival.shortName} ${isWinHome || isWinAway ? "perdió" : "no ganó"} el ${halfLabel} tiempo en ${rivalRate.hits} de ${rivalRate.total} partidos (${rivalRate.rawPct}%)`,
          },
        ],
        positivePatterns: [
          `${team.shortName} ${actionText} el ${halfLabel} tiempo en ${teamRate.hits} de ${teamRate.total} partidos recientes con desglose real (${teamRate.rawPct}%).`,
          `${rival.shortName} ${isWinHome || isWinAway ? "perdió" : "no ganó"} el ${halfLabel} tiempo en ${rivalRate.hits} de ${rivalRate.total} partidos recientes (${rivalRate.rawPct}%).`,
        ],
        contradictions: [
          ...(teamUsable.length < (isHomeSide ? ctx.homeRecords.length : ctx.awayRecords.length)
            ? [`⚠️ Muestra incompleta al descanso: solo ${teamUsable.length} de ${isHomeSide ? ctx.homeRecords.length : ctx.awayRecords.length} partidos de ${team.shortName} tienen desglose de 1T en la fuente oficial.`]
            : []),
          ...(rivalUsable.length < (isHomeSide ? ctx.awayRecords.length : ctx.homeRecords.length)
            ? [`⚠️ Muestra incompleta al descanso: solo ${rivalUsable.length} de ${isHomeSide ? ctx.awayRecords.length : ctx.homeRecords.length} partidos de ${rival.shortName} tienen desglose de 1T en la fuente oficial.`]
            : []),
          ...(sampleTotal < 6 ? ["La muestra con desglose real de descanso es reducida."] : []),
        ],
        confidenceInputs: buildConfidenceInputs({
          recentPerformance: teamRate.rawPct,
          rivalVulnerability: rivalRate.rawPct,
          homeAwayCondition: estimate,
          h2hEstimate: 50,
          includeH2H: false,
          commonOpponentsScore: 50,
          includeCommonOpponents: false,
          lastThreeTrend: lastThree,
          sampleSize: effectiveSampleSize,
        }),
      };
    }

    const baseResult = resolveResult(isHomeSide ? "result_home_win" : "result_away_win", ctx);
    const factor = isDcHome || isDcAway ? 0.85 : 0.65;
    const estimate = Math.round(Math.min(88, Math.max(8, baseResult.estimate * factor)));
    return {
      ...baseResult,
      estimate,
      sampleSize: Math.max(baseResult.sampleSize, sampleTotal),
      confidenceCap: 55,
      recommendationThreshold: 75,
      favoredTeamId: team.id,
      positivePatterns: [
        `Sin suficientes partidos con desglose al descanso (${sampleTotal}); estimación derivada del mercado de resultado completo (${baseResult.estimate}%), ajustada a ${halfLabel} parte.`,
      ],
      contradictions: [
        "⚠️ Datos incompletos al descanso en la fuente oficial.",
        ...baseResult.contradictions,
      ],
      confidenceInputs: buildConfidenceInputs({
        recentPerformance: estimate,
        rivalVulnerability: estimate,
        homeAwayCondition: estimate,
        h2hEstimate: 50,
        includeH2H: false,
        commonOpponentsScore: 50,
        includeCommonOpponents: false,
        lastThreeTrend: estimate,
        sampleSize: baseResult.sampleSize,
      }),
    };
  }

  const { comparator, threshold } = HALF_GOALS_MARKETS[marketId] ?? { comparator: "over", threshold: 0.5 };
  const isOver = comparator === "over";

  const fullSampleSize = Math.max(ctx.homeRecords.length, ctx.awayRecords.length);

  if (fullSampleSize >= 4) {
    const isFulfilled = (r: TeamMatchRecord) => {
      if (isBtts) return (r[forKey] as number) >= 1 && (r[againstKey] as number) >= 1;
      const val = (r[forKey] ?? 0) + (r[againstKey] ?? 0);
      return isOver ? val > threshold : val < threshold;
    };

    const combined = combinedRatio(homeUsable, awayUsable, isFulfilled);
    const lastThree = last3Ratio([...homeUsable.slice(0, 3), ...awayUsable.slice(0, 3)], isFulfilled);
    const homeForAvg = contextualAverage(homeUsable, "local", (r) => (r[forKey] as number) ?? 0);
    const homeAgainstAvg = contextualAverage(homeUsable, "local", (r) => (r[againstKey] as number) ?? 0);
    const awayForAvg = contextualAverage(awayUsable, "visitante", (r) => (r[forKey] as number) ?? 0);
    const awayAgainstAvg = contextualAverage(awayUsable, "visitante", (r) => (r[againstKey] as number) ?? 0);

    const expectedHomeHalf = (homeForAvg.value + awayAgainstAvg.value) / 2;
    const expectedAwayHalf = (awayForAvg.value + homeAgainstAvg.value) / 2;
    const expectedTotalHalf = expectedHomeHalf + expectedAwayHalf;

    const poissonPct = isBtts
      ? Math.round((1 - Math.exp(-Math.max(0.05, expectedHomeHalf))) * (1 - Math.exp(-Math.max(0.05, expectedAwayHalf))) * 100)
      : poissonProbability(expectedTotalHalf, isOver ? "over" : "under", threshold);

    const conservativeHistoricalPct = wilsonLowerBound(combined.hits, combined.total);
    const estimate = weightedPercentage([
      { value: conservativeHistoricalPct, weight: 0.55 },
      { value: poissonPct, weight: 0.45 },
    ]);

    const observedTotals = [...homeUsable, ...awayUsable].map((record) => (record[forKey] as number) + (record[againstKey] as number));
    const hasHighGoalTail = !isBtts && !isOver && observedTotals.some((total) => total > threshold);
    const confidenceCap = hasHighGoalTail ? 70 : halfConfidenceCap;

    const halfMissingWarnings: string[] = [];
    if (homeUsable.length < ctx.homeRecords.length) {
      halfMissingWarnings.push(`⚠️ Muestra incompleta al descanso: solo ${homeUsable.length} de ${ctx.homeRecords.length} partidos de ${ctx.homeTeam.shortName} tienen desglose al descanso en la fuente oficial.`);
    }
    if (awayUsable.length < ctx.awayRecords.length) {
      halfMissingWarnings.push(`⚠️ Muestra incompleta al descanso: solo ${awayUsable.length} de ${ctx.awayRecords.length} partidos de ${ctx.awayTeam.shortName} tienen desglose al descanso en la fuente oficial.`);
    }
    if (combined.total < 6) {
      halfMissingWarnings.push("La muestra con dato real de descanso confirmado es limitada.");
    }
    if (hasHighGoalTail) {
      halfMissingWarnings.push(`⚠️ Volatilidad alta: la muestra ya contiene un ${halfShort} con más de ${threshold} goles; esta línea baja no se recomienda con una muestra corta.`);
    }

    return {
      estimate,
      sampleSize: effectiveSampleSize,
      confidenceCap,
      recommendationThreshold: hasHighGoalTail ? 76 : halfConfidenceCap ?? 60,
      probabilitySignals: [
        {
          label: `${ctx.homeTeam.shortName} anota en ${halfShort} (vs ${ctx.awayTeam.shortName} concede)`,
          value: `${homeForAvg.value.toFixed(1)} prom`,
          detail: `Local anota ${homeForAvg.value.toFixed(1)} en ${halfShort}, rival concede ${awayAgainstAvg.value.toFixed(1)} en ${halfShort} (esperado: ${expectedHomeHalf.toFixed(2)})`,
        },
        {
          label: `${ctx.awayTeam.shortName} anota en ${halfShort} (vs ${ctx.homeTeam.shortName} concede)`,
          value: `${awayForAvg.value.toFixed(1)} prom`,
          detail: `Visitante anota ${awayForAvg.value.toFixed(1)} en ${halfShort}, local concede ${homeAgainstAvg.value.toFixed(1)} en ${halfShort} (esperado: ${expectedAwayHalf.toFixed(2)})`,
        },
        {
          label: `Media prevista ${halfLabel} tiempo`,
          value: `${expectedTotalHalf.toFixed(2)} goles`,
          detail: `Suma del modelo ataque-defensa (${expectedHomeHalf.toFixed(2)} local + ${expectedAwayHalf.toFixed(2)} visitante)`,
        },
        {
          label: `Cruce combinado de ambas tablas`,
          value: `${estimate}%`,
          detail: `Historial conservador ${conservativeHistoricalPct}% + Modelo Poisson ${poissonPct}%`,
        },
      ],
      positivePatterns: [
        `Modelo ataque-defensa en ${halfShort}: ${ctx.homeTeam.shortName} prev. ${expectedHomeHalf.toFixed(2)} goles + ${ctx.awayTeam.shortName} prev. ${expectedAwayHalf.toFixed(2)} goles (${expectedTotalHalf.toFixed(2)} goles totales previstos).`,
        `Se cumplió en ${combined.hits} de ${combined.total} partidos con desglose real del ${halfLabel} tiempo (${combined.pct}%); límite conservador ${conservativeHistoricalPct}% y modelo de Poisson ${poissonPct}%.`,
      ],
      contradictions: halfMissingWarnings,
      confidenceInputs: buildConfidenceInputs({
        recentPerformance: conservativeHistoricalPct,
        rivalVulnerability: poissonPct,
        homeAwayCondition: estimate,
        h2hEstimate: 50,
        includeH2H: false,
        commonOpponentsScore: 50,
        includeCommonOpponents: false,
        lastThreeTrend: lastThree,
        sampleSize: effectiveSampleSize,
      }),
    };
  }

  const base = isBtts
    ? resolveBtts("btts_yes", ctx)
    : resolveMatchTotalMarket(`goals_${isOver ? "over" : "under"}_${String(threshold).replace(".", "")}`, ctx);
  const factor = half === "first" ? (isBtts ? 0.5 : 0.72) : isBtts ? 0.5 : 0.68;
  const estimate = Math.round(Math.min(88, Math.max(8, base.estimate * factor)));
  const halfName = half === "first" ? "la primera" : "la segunda";
  return {
    ...base,
    estimate,
    confidenceCap: 55,
    recommendationThreshold: 75,
    positivePatterns: [
      `Sin suficientes partidos con desglose real de descanso (${base.sampleSize}); estimación derivada del mercado equivalente a partido completo (${base.estimate}%), ajustada a ${halfName} parte.`,
    ],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: estimate,
      rivalVulnerability: estimate,
      homeAwayCondition: estimate,
      h2hEstimate: 50,
      includeH2H: false,
      commonOpponentsScore: 50,
      includeCommonOpponents: false,
      lastThreeTrend: estimate,
      sampleSize: base.sampleSize,
    }),
  };
}

const CARDS_SIDE_MARKETS: Record<string, { side: "home" | "away"; threshold: number }> = {
  cards_home_over_05: { side: "home", threshold: 0.5 },
  cards_home_over_15: { side: "home", threshold: 1.5 },
  cards_home_over_25: { side: "home", threshold: 2.5 },
  cards_away_over_05: { side: "away", threshold: 0.5 },
  cards_away_over_15: { side: "away", threshold: 1.5 },
  cards_away_over_25: { side: "away", threshold: 2.5 },
};

/** Tarjetas amarillas propias de cada equipo — "yellowCards" es obligatorio en el esquema, siempre hay muestra completa. */
function resolveCardsSideMarket(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  const def = CARDS_SIDE_MARKETS[marketId];
  const isHome = def.side === "home";
  const team = isHome ? ctx.homeTeam : ctx.awayTeam;
  const records = isHome ? ctx.homeRecords : ctx.awayRecords;
  const predicate = (r: TeamMatchRecord) => r.yellowCards > def.threshold;
  const own = contextualRate(records, isHome ? "local" : "visitante", predicate);
  const overall = ratio(records, predicate);
  const homeOnly = ratio(records.filter((r) => r.venue === (isHome ? "local" : "visitante")), predicate);
  const lastThree = last3Ratio(records, predicate);

  const positivePatterns = [
    `${team.shortName} cumplió la línea de >${def.threshold} tarjetas amarillas en ${overall.hits} de sus últimos ${overall.total} partidos (${overall.pct}%).`,
  ];
  if (homeOnly.total >= 2) {
    positivePatterns.push(`En condición de ${isHome ? "local en casa" : "visitante fuera"}, cumplió en ${homeOnly.hits} de ${homeOnly.total} partidos (${homeOnly.pct}%).`);
  }

  return {
    estimate: own.rawPct,
    sampleSize: own.total,
    positivePatterns,
    probabilitySignals: [
      {
        label: `${team.shortName} (${isHome ? "Local en casa" : "Visitante fuera"})`,
        value: `${own.venuePct !== undefined ? own.venuePct : own.rawPct}%`,
        detail: evidenceDetail(own),
      },
      {
        label: `${team.shortName} (Total historial)`,
        value: `${overall.pct}%`,
        detail: `${overall.hits}/${overall.total} partidos evaluados`,
      },
      {
        label: "Ponderación Localía (65/35)",
        value: `${own.rawPct}%`,
        detail: "Mezcla 65% condición venue + 35% total",
      },
    ],
    contradictions: records.length < 4 ? ["La muestra disponible para este equipo es reducida."] : [],
    favoredTeamId: team.id,
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: own.score,
      rivalVulnerability: own.score,
      homeAwayCondition: homeOnly.total >= 2 ? homeOnly.pct : own.score,
      h2hEstimate: 50,
      includeH2H: false,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, team.id),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: lastThree,
      sampleSize: records.length,
    }),
  };
}

const CARDS_TOTAL_THRESHOLDS: Record<string, number> = {
  cards_total_over_15: 1.5,
  cards_total_over_25: 2.5,
  cards_total_over_35: 3.5,
  cards_total_over_45: 4.5,
};

/**
 * Total de tarjetas amarillas del partido: solo se puede calcular sobre partidos
 * históricos donde la fuente confirmó también las tarjetas del rival
 * ("yellowCardsAgainst", opcional — ver lib/match-package-prompt.ts regla 17).
 * Se filtra a esos partidos en vez de estimar el dato del rival; si no hay
 * suficientes, el sampleSize baja y el mercado queda como "sin datos
 * suficientes" en vez de mostrar un número inventado.
 */
function resolveCardsTotalMarket(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  const threshold = CARDS_TOTAL_THRESHOLDS[marketId];
  const hasRivalCards = (r: TeamMatchRecord) => r.yellowCardsAgainst !== undefined;
  const predicate = (r: TeamMatchRecord) => r.yellowCards + (r.yellowCardsAgainst as number) > threshold;
  const homeUsable = ctx.homeRecords.filter(hasRivalCards);
  const awayUsable = ctx.awayRecords.filter(hasRivalCards);
  const combined = ratio([...homeUsable, ...awayUsable], predicate);
  const lastThree = last3Ratio([...homeUsable.slice(0, 3), ...awayUsable.slice(0, 3)], predicate);

  return {
    estimate: combined.pct,
    sampleSize: combined.total,
    positivePatterns:
      combined.total > 0
        ? [`Se cumplió en ${combined.hits} de los ${combined.total} partidos con tarjetas del rival confirmadas (${combined.pct}%).`]
        : [],
    contradictions:
      combined.total === 0
        ? ["🛑 ADVERTENCIA DE COBERTURA: Faltan registros de tarjetas del rival en el historial. SE RECOMIENDA NO APOSTAR en este mercado de tarjetas."]
        : combined.total < 6
          ? ["🛑 ADVERTENCIA DE COBERTURA: La muestra con tarjetas del rival confirmadas es reducida. Se recomienda NO APOSTAR en este mercado de tarjetas."]
          : [],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: combined.pct,
      rivalVulnerability: combined.pct,
      homeAwayCondition: combined.pct,
      h2hEstimate: 50,
      includeH2H: false,
      commonOpponentsScore: 50,
      includeCommonOpponents: false,
      lastThreeTrend: lastThree,
      sampleSize: combined.total,
    }),
  };
}

/** "¿Hay roja en el partido?" — redCards propio siempre está disponible; redCardsAgainst suma cuando la fuente lo confirmó. */
function resolveRedCardShown(ctx: MarketEvalContext): ResolvedMarket {
  const predicate = (r: TeamMatchRecord) => r.redCards >= 1 || (r.redCardsAgainst ?? 0) >= 1;
  const combined = combinedRatio(ctx.homeRecords, ctx.awayRecords, predicate);
  const lastThree = last3Ratio([...ctx.homeRecords.slice(0, 3), ...ctx.awayRecords.slice(0, 3)], predicate);

  return {
    estimate: combined.pct,
    sampleSize: combined.total,
    positivePatterns: [
      `Hubo al menos una tarjeta roja (propia o del rival, cuando ese dato está confirmado) en ${combined.hits} de ${combined.total} partidos recientes combinados (${combined.pct}%).`,
    ],
    contradictions: [],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: combined.pct,
      rivalVulnerability: combined.pct,
      homeAwayCondition: combined.pct,
      h2hEstimate: 50,
      includeH2H: false,
      commonOpponentsScore: 50,
      includeCommonOpponents: false,
      lastThreeTrend: lastThree,
      sampleSize: combined.total,
    }),
  };
}

function resolveCardsBttsMarket(ctx: MarketEvalContext): ResolvedMarket {
  const hasRivalCards = (r: TeamMatchRecord) => r.yellowCardsAgainst !== undefined;
  const predicate = (r: TeamMatchRecord) => r.yellowCards >= 1 && (r.yellowCardsAgainst as number) >= 1;
  const homeUsable = ctx.homeRecords.filter(hasRivalCards);
  const awayUsable = ctx.awayRecords.filter(hasRivalCards);
  const homeVenueUsable = homeUsable.filter((r) => r.venue === "local");
  const awayVenueUsable = awayUsable.filter((r) => r.venue === "visitante");

  const homeVenueRate = ratio(homeVenueUsable, predicate);
  const awayVenueRate = ratio(awayVenueUsable, predicate);
  const combined = ratio([...homeUsable, ...awayUsable], predicate);
  const lastThree = last3Ratio([...homeUsable.slice(0, 3), ...awayUsable.slice(0, 3)], predicate);

  return {
    estimate: combined.pct,
    sampleSize: combined.total,
    positivePatterns:
      combined.total > 0
        ? [`Ambos equipos recibieron al menos una tarjeta amarilla en ${combined.hits} de ${combined.total} partidos con tarjetas confirmadas (${combined.pct}%).`]
        : [],
    contradictions:
      combined.total === 0
        ? ["🛑 ADVERTENCIA DE COBERTURA: Faltan registros de tarjetas del rival en el historial. SE RECOMIENDA NO APOSTAR en este mercado de tarjetas."]
        : combined.total < 6
          ? ["🛑 ADVERTENCIA DE COBERTURA: La muestra con tarjetas del rival confirmadas es reducida. Se recomienda NO APOSTAR en este mercado de tarjetas."]
          : [],
    probabilitySignals: [
      {
        label: `${ctx.homeTeam.shortName} (Local en casa)`,
        value: `${homeVenueRate.total > 0 ? homeVenueRate.pct : combined.pct}%`,
        detail: `${homeVenueRate.hits}/${homeVenueRate.total} en casa`,
      },
      {
        label: `${ctx.awayTeam.shortName} (Visitante fuera)`,
        value: `${awayVenueRate.total > 0 ? awayVenueRate.pct : combined.pct}%`,
        detail: `${awayVenueRate.hits}/${awayVenueRate.total} fuera`,
      },
      {
        label: "Frecuencia Combinada",
        value: `${combined.pct}%`,
        detail: `${combined.hits}/${combined.total} partidos con tarjetas confirmadas`,
      },
    ],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: combined.pct,
      rivalVulnerability: combined.pct,
      homeAwayCondition: combined.pct,
      h2hEstimate: combined.pct,
      includeH2H: false,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, ctx.homeTeam.id),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: lastThree,
      sampleSize: combined.total,
    }),
  };
}

function resolveMarket(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  if (TEAM_SIDE_MARKETS[marketId]) return resolveTeamSideMarket(marketId, ctx);
  if (MATCH_TOTAL_MARKETS[marketId]) return resolveMatchTotalMarket(marketId, ctx);
  if (GOALS_HANDICAP_MARKETS[marketId]) return resolveHandicapMarket(GOALS_HANDICAP_MARKETS[marketId], ctx);
  if (CORNERS_HANDICAP_MARKETS[marketId]) return resolveHandicapMarket(CORNERS_HANDICAP_MARKETS[marketId], ctx);
  if (marketId === "btts_yes" || marketId === "btts_no") return resolveBtts(marketId, ctx);
  if (marketId === "corners_most_team") return resolveCornersMostTeam(ctx);
  if (marketId.startsWith("result_")) return resolveResult(marketId, ctx);
  if (marketId.startsWith("first_half_")) return resolveHalfMarket("first", marketId, ctx);
  if (marketId.startsWith("second_half_")) return resolveHalfMarket("second", marketId, ctx);
  if (CARDS_SIDE_MARKETS[marketId]) return resolveCardsSideMarket(marketId, ctx);
  if (CARDS_TOTAL_THRESHOLDS[marketId]) return resolveCardsTotalMarket(marketId, ctx);
  if (marketId === "cards_btts") return resolveCardsBttsMarket(ctx);
  if (marketId === "red_card_shown") return resolveRedCardShown(ctx);

  return {
    estimate: 50,
    sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    positivePatterns: [],
    contradictions: ["No hay un modelo estadístico específico para este mercado todavía."],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: 50,
      rivalVulnerability: 50,
      homeAwayCondition: 50,
      h2hEstimate: 50,
      includeH2H: false,
      commonOpponentsScore: 50,
      includeCommonOpponents: false,
      lastThreeTrend: 50,
      sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    }),
  };
}

interface EvidenceSeriesDefinition {
  id: string;
  title: string;
  description: string;
  records: TeamMatchRecord[];
  predicate: (record: TeamMatchRecord) => boolean;
}

function buildEvidenceSeries(definition: EvidenceSeriesDefinition): MarketEvidenceSeries {
  const matches = definition.records
    .slice()
    .sort((left, right) => right.date.localeCompare(left.date))
    .map((record) => {
      const hasHalfTime = record.goalsForFirstHalf !== undefined && record.goalsAgainstFirstHalf !== undefined;
      const halfTime = hasHalfTime ? ` | H1 ${record.goalsForFirstHalf}-${record.goalsAgainstFirstHalf}` : "";
      const cornersStr =
        record.cornersFor !== undefined && record.cornersAgainst !== undefined
          ? `C ${record.cornersFor}-${record.cornersAgainst}`
          : "";
      const taStr = `TA ${record.yellowCards}-${record.yellowCardsAgainst !== undefined ? record.yellowCardsAgainst : "-"}`;
      const shotsStr =
        record.shotsFor !== undefined && record.shotsAgainst !== undefined
          ? `R ${record.shotsFor}-${record.shotsAgainst}`
          : "";
      const sotStr =
        record.shotsOnTargetFor !== undefined && record.shotsOnTargetAgainst !== undefined
          ? `SOT ${record.shotsOnTargetFor}-${record.shotsOnTargetAgainst}`
          : "";

      const parts = [cornersStr, taStr, shotsStr, sotStr].filter(Boolean);

      return {
        matchId: record.matchId,
        date: record.date,
        opponent: record.opponentId,
        venue: record.venue,
        result: record.result,
        score: `FT ${record.goalsFor}-${record.goalsAgainst}${halfTime}`,
        statistics: parts.join(" | "),
        fulfilled: definition.predicate(record),
      };
    });
  const hits = matches.filter((match) => match.fulfilled).length;
  return {
    id: definition.id,
    title: definition.title,
    description: definition.description,
    hits,
    total: matches.length,
    percentage: matches.length === 0 ? 0 : Math.round((hits / matches.length) * 100),
    matches,
  };
}

function comparison(definition: { comparator: "gt" | "gte" | "lt" | "lte"; threshold: number }, value: number): boolean {
  if (definition.comparator === "gt") return value > definition.threshold;
  if (definition.comparator === "gte") return value >= definition.threshold;
  if (definition.comparator === "lt") return value < definition.threshold;
  return value <= definition.threshold;
}

function buildMarketEvidence(marketId: string, ctx: MarketEvalContext, resolved: ResolvedMarket): MarketEvidence {
  const series: EvidenceSeriesDefinition[] = [];
  const add = (
    id: string,
    title: string,
    description: string,
    records: TeamMatchRecord[],
    predicate: (record: TeamMatchRecord) => boolean
  ) => series.push({ id, title, description, records, predicate });

  if (marketId === "goals_over_05") {
    add("home-scores", `${ctx.homeTeam.shortName} anota +0.5`, "Todos los partidos recientes del local para la señal ofensiva.", ctx.homeRecords, (record) => record.goalsFor >= 1);
    add("away-concedes", `${ctx.awayTeam.shortName} concede +0.5`, "Todos los partidos recientes del visitante para la vulnerabilidad defensiva.", ctx.awayRecords, (record) => record.goalsAgainst >= 1);
    add("away-scores", `${ctx.awayTeam.shortName} anota +0.5`, "Todos los partidos recientes del visitante para su señal ofensiva.", ctx.awayRecords, (record) => record.goalsFor >= 1);
    add("home-concedes", `${ctx.homeTeam.shortName} concede +0.5`, "Todos los partidos recientes del local para su vulnerabilidad defensiva.", ctx.homeRecords, (record) => record.goalsAgainst >= 1);
  } else if (TEAM_SIDE_MARKETS[marketId]) {
    const definition = TEAM_SIDE_MARKETS[marketId];
    const isHome = definition.side === "home";
    const team = isHome ? ctx.homeTeam : ctx.awayTeam;
    const rival = isHome ? ctx.awayTeam : ctx.homeTeam;
    const records = isHome ? ctx.homeRecords : ctx.awayRecords;
    const rivalRecords = isHome ? ctx.awayRecords : ctx.homeRecords;
    const venue = isHome ? "local" : "visitante";
    const rivalVenue = isHome ? "visitante" : "local";
    const predicate = (record: TeamMatchRecord) => comparison(definition, record[definition.statForKey] as number);
    const rivalPredicate = (record: TeamMatchRecord) => comparison(definition, record[definition.statAgainstKey] as number);

    const venueRecords = records.filter((r) => r.venue === venue);
    if (venueRecords.length >= 2) {
      add("team-fulfills-venue", `${team.shortName}: ${isHome ? "en casa" : "fuera"}`, `Partidos de ${team.shortName} jugando como ${isHome ? "local" : "visitante"}.`, venueRecords, predicate);
    }
    add("team-fulfills", `${team.shortName}: total partidos`, "Todos los partidos recientes del equipo en su historial.", records, predicate);

    const venueRivalRecords = rivalRecords.filter((r) => r.venue === rivalVenue);
    if (venueRivalRecords.length >= 2) {
      add("rival-allows-venue", `${rival.shortName}: ${isHome ? "fuera" : "en casa"} (concesión)`, `Partidos de ${rival.shortName} jugando como ${isHome ? "visitante" : "local"}.`, venueRivalRecords, rivalPredicate);
    }
    add("rival-allows", `${rival.shortName}: total concesión`, "Todos los partidos recientes del rival para esta concesión.", rivalRecords, rivalPredicate);
  } else if (MATCH_TOTAL_MARKETS[marketId]) {
    const definition = MATCH_TOTAL_MARKETS[marketId];
    const predicate = (record: TeamMatchRecord) => definition.comparator === "over" ? definition.sum(record) > definition.threshold : definition.sum(record) < definition.threshold;

    const homeVenueRecords = ctx.homeRecords.filter((r) => r.venue === "local");
    if (homeVenueRecords.length >= 2) {
      add("home-total-venue", `${ctx.homeTeam.shortName}: en casa`, "Partidos del local en su estadio.", homeVenueRecords, predicate);
    }
    add("home-total", `${ctx.homeTeam.shortName}: total historial`, "Todos los partidos recientes del local.", ctx.homeRecords, predicate);

    const awayVenueRecords = ctx.awayRecords.filter((r) => r.venue === "visitante");
    if (awayVenueRecords.length >= 2) {
      add("away-total-venue", `${ctx.awayTeam.shortName}: fuera`, "Partidos del visitante fuera de casa.", awayVenueRecords, predicate);
    }
    add("away-total", `${ctx.awayTeam.shortName}: total historial`, "Todos los partidos recientes del visitante.", ctx.awayRecords, predicate);
  } else if (GOALS_HANDICAP_MARKETS[marketId] || CORNERS_HANDICAP_MARKETS[marketId]) {
    const definition = GOALS_HANDICAP_MARKETS[marketId] ?? CORNERS_HANDICAP_MARKETS[marketId];
    const isHome = definition.side === "home";
    const team = isHome ? ctx.homeTeam : ctx.awayTeam;
    const rival = isHome ? ctx.awayTeam : ctx.homeTeam;
    const records = isHome ? ctx.homeRecords : ctx.awayRecords;
    const rivalRecords = isHome ? ctx.awayRecords : ctx.homeRecords;
    const keys = metricKeys(definition.metric);
    const line = handicapLabel(definition.handicap);
    const venue = isHome ? "local" : "visitante";
    const rivalVenue = isHome ? "visitante" : "local";

    const ownPredicate = (record: TeamMatchRecord) => (record[keys.forKey] as number) + definition.handicap > (record[keys.againstKey] as number);
    const rivalPredicate = (record: TeamMatchRecord) => (record[keys.againstKey] as number) + definition.handicap > (record[keys.forKey] as number);

    const venueRecords = records.filter((r) => r.venue === venue);
    if (venueRecords.length >= 2) {
      add("team-covers-venue", `${team.shortName}: ${isHome ? "en casa" : "fuera"} (cubre ${line})`, `Partidos de ${team.shortName} jugando como ${isHome ? "local" : "visitante"}.`, venueRecords, ownPredicate);
    }
    add("team-covers", `${team.shortName}: total (cubre ${line})`, "Todos los partidos recientes del equipo para la línea de hándicap.", records, ownPredicate);

    const venueRivalRecords = rivalRecords.filter((r) => r.venue === rivalVenue);
    if (venueRivalRecords.length >= 2) {
      add("rival-allows-venue", `${rival.shortName}: ${isHome ? "fuera" : "en casa"} (permite ${line})`, `Partidos de ${rival.shortName} jugando como ${isHome ? "visitante" : "local"}.`, venueRivalRecords, rivalPredicate);
    }
    add("rival-allows", `${rival.shortName}: total concesión (permite ${line})`, "Todos los partidos recientes del rival para esa línea de hándicap.", rivalRecords, rivalPredicate);
  } else if (marketId === "btts_yes" || marketId === "btts_no") {
    const predicate = (record: TeamMatchRecord) => marketId === "btts_yes" ? record.goalsFor >= 1 && record.goalsAgainst >= 1 : record.goalsFor === 0 || record.goalsAgainst === 0;

    const homeVenueRecords = ctx.homeRecords.filter((r) => r.venue === "local");
    if (homeVenueRecords.length >= 2) {
      add("home-btts-venue", `${ctx.homeTeam.shortName}: ambos marcan (en casa)`, "Partidos del local en su estadio.", homeVenueRecords, predicate);
    }
    add("home-btts", `${ctx.homeTeam.shortName}: ambos marcan (total)`, "Todos los partidos recientes del local.", ctx.homeRecords, predicate);

    const awayVenueRecords = ctx.awayRecords.filter((r) => r.venue === "visitante");
    if (awayVenueRecords.length >= 2) {
      add("away-btts-venue", `${ctx.awayTeam.shortName}: ambos marcan (fuera)`, "Partidos del visitante fuera de casa.", awayVenueRecords, predicate);
    }
    add("away-btts", `${ctx.awayTeam.shortName}: ambos marcan (total)`, "Todos los partidos recientes del visitante.", ctx.awayRecords, predicate);
  } else if (marketId === "corners_most_team") {
    const predicate = (record: TeamMatchRecord) => record.cornersFor > record.cornersAgainst;

    const homeVenueRecords = ctx.homeRecords.filter((r) => r.venue === "local");
    if (homeVenueRecords.length >= 2) {
      add("home-corners-venue", `${ctx.homeTeam.shortName}: gana córners (en casa)`, "Partidos del local en su estadio.", homeVenueRecords, predicate);
    }
    add("home-corners", `${ctx.homeTeam.shortName}: gana córners (total)`, "Todos los partidos recientes del local.", ctx.homeRecords, predicate);

    const awayVenueRecords = ctx.awayRecords.filter((r) => r.venue === "visitante");
    if (awayVenueRecords.length >= 2) {
      add("away-corners-venue", `${ctx.awayTeam.shortName}: gana córners (fuera)`, "Partidos del visitante fuera de casa.", awayVenueRecords, predicate);
    }
    add("away-corners", `${ctx.awayTeam.shortName}: gana córners (total)`, "Todos los partidos recientes del visitante.", ctx.awayRecords, predicate);
  } else if (marketId.startsWith("first_half_") || marketId.startsWith("second_half_")) {
    const half = marketId.startsWith("first_half_") ? "first" : "second";
    const forKey = half === "first" ? "goalsForFirstHalf" : "goalsForSecondHalf";
    const againstKey = half === "first" ? "goalsAgainstFirstHalf" : "goalsAgainstSecondHalf";
    const definition = HALF_GOALS_MARKETS[marketId];
    const isWinHome = marketId.endsWith("_win_home");
    const isWinAway = marketId.endsWith("_win_away");
    const isDcHome = marketId.endsWith("_dc_home");
    const isDcAway = marketId.endsWith("_dc_away");
    const isTeamHalf = isWinHome || isWinAway || isDcHome || isDcAway;

    const hasHalfData = (r: TeamMatchRecord) => r[forKey] !== undefined && r[againstKey] !== undefined;

    if (isTeamHalf) {
      const halfName = half === "first" ? "1er tiempo" : "2do tiempo";
      const isHomeSide = isWinHome || isDcHome;
      const team = isHomeSide ? ctx.homeTeam : ctx.awayTeam;
      const rival = isHomeSide ? ctx.awayTeam : ctx.homeTeam;
      const teamRecords = isHomeSide ? ctx.homeRecords : ctx.awayRecords;
      const rivalRecords = isHomeSide ? ctx.awayRecords : ctx.homeRecords;

      const teamPredicate = isWinHome || isWinAway
        ? (r: TeamMatchRecord) => hasHalfData(r) && (r[forKey] as number) > (r[againstKey] as number)
        : (r: TeamMatchRecord) => hasHalfData(r) && (r[forKey] as number) >= (r[againstKey] as number);

      const rivalPredicate = isWinHome || isWinAway
        ? (r: TeamMatchRecord) => hasHalfData(r) && (r[againstKey] as number) > (r[forKey] as number)
        : (r: TeamMatchRecord) => hasHalfData(r) && (r[againstKey] as number) >= (r[forKey] as number);

      const actionText = isWinHome || isWinAway ? "gana" : "gana o empata";
      const rivalActionText = isWinHome || isWinAway ? "pierde" : "no gana";

      const teamVenueRecords = teamRecords.filter((r) => r.venue === (isHomeSide ? "local" : "visitante"));
      if (teamVenueRecords.length >= 2) {
        add("team-half-venue", `${team.shortName}: ${actionText} ${halfName} (${isHomeSide ? "en casa" : "fuera"})`, `Partidos de ${team.shortName} jugando de ${isHomeSide ? "local" : "visitante"}.`, teamVenueRecords, teamPredicate);
      }
      add("team-half", `${team.shortName}: ${actionText} ${halfName} (total)`, `Partidos recientes de ${team.shortName} con desglose por tiempo.`, teamRecords, teamPredicate);

      const rivalVenueRecords = rivalRecords.filter((r) => r.venue === (isHomeSide ? "visitante" : "local"));
      if (rivalVenueRecords.length >= 2) {
        add("rival-half-venue", `${rival.shortName}: ${rivalActionText} ${halfName} (${isHomeSide ? "fuera" : "en casa"})`, `Partidos de ${rival.shortName} jugando de ${isHomeSide ? "visitante" : "local"}.`, rivalVenueRecords, rivalPredicate);
      }
      add("rival-half", `${rival.shortName}: ${rivalActionText} ${halfName} (total)`, `Partidos recientes de ${rival.shortName} con desglose por tiempo.`, rivalRecords, rivalPredicate);
    } else {
      const predicate = (record: TeamMatchRecord) => {
        if (record[forKey] === undefined || record[againstKey] === undefined) return false;
        if (marketId === `${half}_half_btts`) return (record[forKey] as number) >= 1 && (record[againstKey] as number) >= 1;
        const total = (record[forKey] as number) + (record[againstKey] as number);
        return definition?.comparator === "over" ? total > definition.threshold : total < (definition?.threshold ?? 0);
      };
      const homeVenueRecords = ctx.homeRecords.filter((r) => r.venue === "local");
      if (homeVenueRecords.length >= 2) {
        add("home-half-venue", `${ctx.homeTeam.shortName}: ${half === "first" ? "1er" : "2do"} tiempo (en casa)`, "Partidos del local en su estadio.", homeVenueRecords, predicate);
      }
      add("home-half", `${ctx.homeTeam.shortName}: ${half === "first" ? "1er" : "2do"} tiempo (total)`, "Todos los partidos recientes del local con desglose por tiempo.", ctx.homeRecords, predicate);

      const awayVenueRecords = ctx.awayRecords.filter((r) => r.venue === "visitante");
      if (awayVenueRecords.length >= 2) {
        add("away-half-venue", `${ctx.awayTeam.shortName}: ${half === "first" ? "1er" : "2do"} tiempo (fuera)`, "Partidos del visitante fuera de casa.", awayVenueRecords, predicate);
      }
      add("away-half", `${ctx.awayTeam.shortName}: ${half === "first" ? "1er" : "2do"} tiempo (total)`, "Todos los partidos recientes del visitante con desglose por tiempo.", ctx.awayRecords, predicate);
    }
  } else if (marketId.startsWith("result_")) {
    const homePredicate = (record: TeamMatchRecord) =>
      marketId === "result_home_win"
        ? record.goalsFor > record.goalsAgainst
        : marketId === "result_away_win"
          ? record.goalsFor < record.goalsAgainst
          : marketId === "result_draw"
            ? record.goalsFor === record.goalsAgainst
            : marketId === "result_dc_home"
              ? record.goalsFor >= record.goalsAgainst
              : record.goalsFor <= record.goalsAgainst;

    const awayPredicate = (record: TeamMatchRecord) =>
      marketId === "result_home_win"
        ? record.goalsFor < record.goalsAgainst
        : marketId === "result_away_win"
          ? record.goalsFor > record.goalsAgainst
          : marketId === "result_draw"
            ? record.goalsFor === record.goalsAgainst
            : marketId === "result_dc_home"
              ? record.goalsFor <= record.goalsAgainst
              : record.goalsFor >= record.goalsAgainst;

    const homeVenueRecords = ctx.homeRecords.filter((r) => r.venue === "local");
    if (homeVenueRecords.length >= 2) {
      add("home-result-venue", `${ctx.homeTeam.shortName}: resultado (en casa)`, "Partidos del local en su estadio.", homeVenueRecords, homePredicate);
    }
    add("home-result", `${ctx.homeTeam.shortName}: resultado (total)`, "Todos los partidos recientes del local.", ctx.homeRecords, homePredicate);

    const awayVenueRecords = ctx.awayRecords.filter((r) => r.venue === "visitante");
    if (awayVenueRecords.length >= 2) {
      add("away-result-venue", `${ctx.awayTeam.shortName}: resultado (fuera)`, "Partidos del visitante fuera de casa.", awayVenueRecords, awayPredicate);
    }
    add("away-result", `${ctx.awayTeam.shortName}: resultado (total)`, "Todos los partidos recientes del visitante.", ctx.awayRecords, awayPredicate);
  } else if (CARDS_SIDE_MARKETS[marketId]) {
    const definition = CARDS_SIDE_MARKETS[marketId];
    const isHome = definition.side === "home";
    const team = isHome ? ctx.homeTeam : ctx.awayTeam;
    const records = isHome ? ctx.homeRecords : ctx.awayRecords;
    const venue = isHome ? "local" : "visitante";
    const predicate = (record: TeamMatchRecord) => record.yellowCards > definition.threshold;

    const venueRecords = records.filter((r) => r.venue === venue);
    if (venueRecords.length >= 2) {
      add("team-cards-venue", `${team.shortName}: tarjetas ${isHome ? "en casa" : "fuera"}`, `Partidos de ${team.shortName} jugando como ${isHome ? "local" : "visitante"}.`, venueRecords, predicate);
    }
    add("team-cards", `${team.shortName}: tarjetas (total)`, "Historial completo del equipo para la línea de tarjetas.", records, predicate);
  } else if (marketId === "cards_btts") {
    const predicate = (r: TeamMatchRecord) => r.yellowCardsAgainst !== undefined && r.yellowCards >= 1 && r.yellowCardsAgainst >= 1;
    const homeVenue = ctx.homeRecords.filter((r) => r.venue === "local");
    const awayVenue = ctx.awayRecords.filter((r) => r.venue === "visitante");

    if (homeVenue.length >= 2) {
      add("home-cards-btts-venue", `${ctx.homeTeam.shortName}: ambos reciben tarjeta (en casa)`, "Partidos del local en su estadio.", homeVenue, predicate);
    }
    add("home-cards-btts", `${ctx.homeTeam.shortName}: ambos reciben tarjeta (total)`, "Todos los partidos recientes del local.", ctx.homeRecords, predicate);

    if (awayVenue.length >= 2) {
      add("away-cards-btts-venue", `${ctx.awayTeam.shortName}: ambos reciben tarjeta (fuera)`, "Partidos del visitante fuera de casa.", awayVenue, predicate);
    }
    add("away-cards-btts", `${ctx.awayTeam.shortName}: ambos reciben tarjeta (total)`, "Todos los partidos recientes del visitante.", ctx.awayRecords, predicate);
  } else if (CARDS_TOTAL_THRESHOLDS[marketId]) {
    const threshold = CARDS_TOTAL_THRESHOLDS[marketId];
    const predicate = (record: TeamMatchRecord) => record.yellowCardsAgainst !== undefined && record.yellowCards + record.yellowCardsAgainst > threshold;
    add("home-cards", `${ctx.homeTeam.shortName}: tarjetas totales`, "Todos los partidos recientes del local.", ctx.homeRecords, predicate);
    add("away-cards", `${ctx.awayTeam.shortName}: tarjetas totales`, "Todos los partidos recientes del visitante.", ctx.awayRecords, predicate);
  } else if (marketId === "red_card_shown") {
    const predicate = (record: TeamMatchRecord) => record.redCards >= 1 || (record.redCardsAgainst ?? 0) >= 1;
    add("home-red", `${ctx.homeTeam.shortName}: roja`, "Historial reciente del local.", ctx.homeRecords, predicate);
    add("away-red", `${ctx.awayTeam.shortName}: roja`, "Historial reciente del visitante.", ctx.awayRecords, predicate);
  } else {
    const predicate = (record: TeamMatchRecord) => record.goalsFor + record.goalsAgainst >= 1;
    add("home-history", `${ctx.homeTeam.shortName}: historial`, "Partidos recientes disponibles.", ctx.homeRecords, predicate);
    add("away-history", `${ctx.awayTeam.shortName}: historial`, "Partidos recientes disponibles.", ctx.awayRecords, predicate);
  }

  return {
    methodology: [
      "La estimacion combina las series mostradas, condicion local/visitante, tendencia y calidad de muestra.",
      ...resolved.positivePatterns,
    ],
    series: series.map(buildEvidenceSeries),
  };
}

const riskWeight: Record<RiskLevel, number> = { bajo: 0, moderado: 1, alto: 2 };

function riskLevelFor(finalScore: number, sampleSize: number, contradictions: number): RiskLevel {
  let level: RiskLevel = "bajo";
  if (finalScore < 55 || sampleSize < 6) level = "moderado";
  if (finalScore < 45 || contradictions >= 2) level = "alto";
  if (riskWeight[level] < 1 && contradictions >= 1) level = "moderado";
  return level;
}

function recommendationFor(
  finalScore: number,
  sampleSize: number,
  minimumConfidence = 60,
  estimate = 100,
  minimumProbability = 0
): MarketRecommendationState {
  if (sampleSize < 4) return "sin_datos_suficientes";
  if (estimate < minimumProbability) return "evitar";
  if (finalScore >= minimumConfidence) return "recomendado";
  return "evitar";
}

/**
 * La cuota SOLO se muestra cuando el usuario la cargó de verdad en el paso
 * "Cuotas" del asistente (una cuota real de su casa de apuestas). Antes se
 * rellenaba con un número simulado (aleatorio, sin relación con ninguna casa
 * real) para los mercados sin cuota cargada — eso presentaba un dato
 * inventado como si fuera real, con el mismo look que una cuota genuina, y
 * llevaba a leer "Sin valor" en mercados que en realidad nadie cotizó. Sin
 * cuota real, "odds"/"valueDifference"/"valueLevel" quedan sin definir; la UI
 * ya está preparada para omitir esos campos en vez de inventar un "—".
 */
export function evaluateAllMarkets(ctx: MarketEvalContext, oddsOverrides: Partial<Record<string, number>>): MarketEvaluation[] {
  const results: MarketEvaluation[] = [];

  for (const market of bettingMarkets) {
    try {
      const resolved = resolveMarket(market.id, ctx);
      const confidenceBreakdown = computeConfidenceBreakdown(resolved.confidenceInputs);
      const decimalOdds = oddsOverrides[market.id];
      const odds: BettingOdds | undefined =
        decimalOdds !== undefined ? { marketId: market.id, decimalOdds, impliedProbability: impliedProbability(decimalOdds) } : undefined;
      const diff = decimalOdds !== undefined ? valueDifference(resolved.estimate, decimalOdds) : undefined;

      const unguardedConfidence = Number.isFinite(confidenceBreakdown.finalScore) ? confidenceBreakdown.finalScore : 50;
      const confScore = Math.min(unguardedConfidence, resolved.confidenceCap ?? 100);
      if (confScore !== unguardedConfidence) {
        confidenceBreakdown.finalScore = confScore;
        confidenceBreakdown.classification = classifyConfidence(confScore);
      }
      const statEst = Number.isFinite(resolved.estimate) ? resolved.estimate : 50;

      const evaluation: MarketEvaluation = {
        id: `${market.id}-${ctx.homeTeam.id}-${ctx.awayTeam.id}`,
        matchId: `${ctx.homeTeam.id}-vs-${ctx.awayTeam.id}`,
        market,
        confidenceBreakdown,
        confidence: confScore,
        confidenceLevel: confidenceBreakdown.classification,
        odds,
        statisticalEstimate: statEst,
        valueDifference: diff,
        valueLevel: diff !== undefined ? classifyValue(diff) : undefined,
        riskLevel: riskLevelFor(confScore, resolved.sampleSize, (resolved.contradictions ?? []).length),
        positivePatterns: resolved.positivePatterns ?? [],
        probabilitySignals: resolved.probabilitySignals,
        evidence: buildMarketEvidence(market.id, ctx, resolved),
        contradictions: resolved.contradictions ?? [],
        dataQuality: dataQualityLabel(confidenceBreakdown.dataQuality),
        sampleSize: resolved.sampleSize,
        recommendation: recommendationFor(
          confScore,
          resolved.sampleSize,
          resolved.recommendationThreshold,
          statEst,
          resolved.recommendationProbabilityThreshold
        ),
      };
      results.push(evaluation);
    } catch (_err) {
      // Fallback seguro: el mercado se genera con datos neutrales en vez de
      // desaparecer de la lista. Esto garantiza que TODOS los 152 mercados
      // siempre se muestren, incluso si un resolver individual tiene un error.
      const fallbackInputs = buildConfidenceInputs({
        recentPerformance: 50,
        rivalVulnerability: 50,
        homeAwayCondition: 50,
        h2hEstimate: 50,
        includeH2H: false,
        commonOpponentsScore: 50,
        includeCommonOpponents: false,
        lastThreeTrend: 50,
        sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
      });
      const fallbackBreakdown = computeConfidenceBreakdown(fallbackInputs);
      results.push({
        id: `${market.id}-${ctx.homeTeam.id}-${ctx.awayTeam.id}`,
        matchId: `${ctx.homeTeam.id}-vs-${ctx.awayTeam.id}`,
        market,
        confidenceBreakdown: fallbackBreakdown,
        confidence: fallbackBreakdown.finalScore,
        confidenceLevel: fallbackBreakdown.classification,
        odds: undefined,
        statisticalEstimate: 50,
        valueDifference: undefined,
        valueLevel: undefined,
        riskLevel: "moderado",
        positivePatterns: [],
        probabilitySignals: [],
        evidence: { series: [], methodology: ["Error interno al calcular la probabilidad de este mercado."] },
        contradictions: ["Error interno al evaluar este mercado."],
        dataQuality: "media",
        sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
        recommendation: "sin_datos_suficientes",
      });
    }
  }

  return results;
}

function buildRiskFactors(evaluation: MarketEvaluation, extra: string[]): RiskFactor[] {
  const risks: RiskFactor[] = [];
  evaluation.contradictions.forEach((c, i) =>
    risks.push({ id: `${evaluation.id}-c${i}`, description: c, severity: "media" })
  );
  if (evaluation.sampleSize < 4) {
    risks.push({ id: `${evaluation.id}-sample`, description: "La muestra disponible es limitada.", severity: "media" });
  }
  extra.forEach((description, i) => risks.push({ id: `${evaluation.id}-x${i}`, description, severity: "baja" }));
  if (risks.length === 0) {
    risks.push({ id: `${evaluation.id}-generic`, description: "Existe una posible rotación de plantilla.", severity: "baja" });
  }
  return risks.slice(0, 4);
}

export function buildRecommendations(
  markets: MarketEvaluation[],
  ctx: MarketEvalContext
): { bestBet: BettingRecommendation | null; alternatives: BettingRecommendation[]; avoid: MarketEvaluation[] } {
  const eligible = markets.filter((m) => m.recommendation === "recomendado").sort((a, b) => b.confidence - a.confidence);
  const avoid = markets
    .filter((m) => m.recommendation !== "recomendado")
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 5);

  if (eligible.length === 0) {
    return { bestBet: null, alternatives: [], avoid };
  }

  const bestEval = eligible[0];
  const bestBet: BettingRecommendation = {
    id: `best-${bestEval.id}`,
    marketEvaluation: bestEval,
    reasons: [
      ...bestEval.positivePatterns,
      ctx.includeH2H && ctx.headToHead.matches.length > 0
        ? `Se registraron señales similares en ${ctx.headToHead.summary.teamAWins + ctx.headToHead.summary.teamBWins} de los últimos ${ctx.headToHead.summary.totalMatches} enfrentamientos directos.`
        : "",
      ctx.includeCommonOpponents && ctx.commonOpponents.opponents.length > 0
        ? "Coincidencia positiva contra rivales en común."
        : "",
    ].filter(Boolean),
    risks: buildRiskFactors(bestEval, ["Existe una posible rotación de titulares antes del partido."]),
    isBestBet: true,
  };

  const alternatives: BettingRecommendation[] = eligible.slice(1, 4).map((evaluation) => ({
    id: `alt-${evaluation.id}`,
    marketEvaluation: evaluation,
    reasons: evaluation.positivePatterns,
    risks: buildRiskFactors(evaluation, []),
    isBestBet: false,
  }));

  return { bestBet, alternatives, avoid };
}

/** Best available market for contexts outside the full analysis engine (dashboard highlights, history seed data). */
export function pickHeadlineMarket(markets: MarketEvaluation[]): MarketEvaluation | undefined {
  const interesting = markets.filter((m) => m.recommendation === "recomendado").sort((a, b) => b.confidence - a.confidence);
  if (interesting.length > 0) return interesting[0];
  return markets.slice().sort((a, b) => b.confidence - a.confidence)[0];
}
