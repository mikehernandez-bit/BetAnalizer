import {
  BettingOdds,
  BettingRecommendation,
  CommonOpponentsAnalysis,
  HeadToHead,
  MarketEvaluation,
  MarketRecommendationState,
  RiskFactor,
  RiskLevel,
  Team,
  TeamMatchRecord,
} from "@/types";
import { bettingMarkets } from "@/data/markets";
import { computeConfidenceBreakdown, dataQualityFromSampleSize, dataQualityLabel, ConfidenceInputs } from "@/utils/confidence";
import { classifyValue, impliedProbability, valueDifference } from "@/utils/odds";
import { createRng, hashSeed, randFloat } from "@/data/_seed";
import { getTeamStrength } from "@/data/teams";

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

interface ResolvedMarket {
  estimate: number;
  sampleSize: number;
  positivePatterns: string[];
  contradictions: string[];
  confidenceInputs: ConfidenceInputs;
  favoredTeamId?: string;
}

const TEAM_SIDE_MARKETS: Record<
  string,
  { side: "home" | "away"; statForKey: keyof TeamMatchRecord; statAgainstKey: keyof TeamMatchRecord; comparator: "gt" | "gte"; threshold: number }
> = {
  home_team_scores: { side: "home", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "gte", threshold: 1 },
  away_team_scores: { side: "away", statForKey: "goalsFor", statAgainstKey: "goalsAgainst", comparator: "gte", threshold: 1 },
  corners_home_over_35: { side: "home", statForKey: "cornersFor", statAgainstKey: "cornersAgainst", comparator: "gt", threshold: 3.5 },
  corners_home_over_45: { side: "home", statForKey: "cornersFor", statAgainstKey: "cornersAgainst", comparator: "gt", threshold: 4.5 },
  corners_away_over_35: { side: "away", statForKey: "cornersFor", statAgainstKey: "cornersAgainst", comparator: "gt", threshold: 3.5 },
  corners_away_over_45: { side: "away", statForKey: "cornersFor", statAgainstKey: "cornersAgainst", comparator: "gt", threshold: 4.5 },
  sot_home_over_25: { side: "home", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 2.5 },
  sot_home_over_35: { side: "home", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 3.5 },
  sot_home_over_45: { side: "home", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 4.5 },
  sot_away_over_25: { side: "away", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 2.5 },
  sot_away_over_35: { side: "away", statForKey: "shotsOnTargetFor", statAgainstKey: "shotsOnTargetAgainst", comparator: "gt", threshold: 3.5 },
  shots_home_over_85: { side: "home", statForKey: "shotsFor", statAgainstKey: "shotsAgainst", comparator: "gt", threshold: 8.5 },
  shots_home_over_105: { side: "home", statForKey: "shotsFor", statAgainstKey: "shotsAgainst", comparator: "gt", threshold: 10.5 },
  shots_away_over_85: { side: "away", statForKey: "shotsFor", statAgainstKey: "shotsAgainst", comparator: "gt", threshold: 8.5 },
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
  sot_total_over_75: { sum: (r) => r.shotsOnTargetFor + r.shotsOnTargetAgainst, comparator: "over", threshold: 7.5, label: "tiros al arco" },
  sot_total_over_85: { sum: (r) => r.shotsOnTargetFor + r.shotsOnTargetAgainst, comparator: "over", threshold: 8.5, label: "tiros al arco" },
  shots_total_over_195: { sum: (r) => r.shotsFor + r.shotsAgainst, comparator: "over", threshold: 19.5, label: "remates" },
  shots_total_over_215: { sum: (r) => r.shotsFor + r.shotsAgainst, comparator: "over", threshold: 21.5, label: "remates" },
  shots_total_over_235: { sum: (r) => r.shotsFor + r.shotsAgainst, comparator: "over", threshold: 23.5, label: "remates" },
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
  recentPerformance: number;
  rivalVulnerability: number;
  homeAwayCondition: number;
  h2hEstimate: number;
  includeH2H: boolean;
  commonOpponentsScore: number;
  includeCommonOpponents: boolean;
  lastThreeTrend: number;
  sampleSize: number;
}): ConfidenceInputs {
  return {
    recentPerformance: params.recentPerformance,
    rivalVulnerability: params.rivalVulnerability,
    homeAwayCondition: params.homeAwayCondition,
    headToHead: params.includeH2H ? params.h2hEstimate : 50,
    commonOpponents: params.includeCommonOpponents ? params.commonOpponentsScore : 50,
    lastThreeTrend: params.lastThreeTrend,
    dataQuality: dataQualityFromSampleSize(params.sampleSize),
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
  const cmp = def.comparator === "gt" ? (v: number) => v > def.threshold : (v: number) => v >= def.threshold;

  const own = ratio(records, (r) => cmp(r[def.statForKey] as number));
  const rivalAgainst = ratio(rivalRecords, (r) => cmp(r[def.statAgainstKey] as number));
  const homeOnly = ratio(records.filter((r) => r.venue === (isHome ? "local" : "visitante")), (r) => cmp(r[def.statForKey] as number));
  const lastThree = last3Ratio(records, (r) => cmp(r[def.statForKey] as number));

  const positivePatterns = [`${team.shortName} cumplió en ${own.hits} de sus últimos ${own.total} partidos (${own.pct}%).`];
  if (rivalAgainst.total > 0) {
    positivePatterns.push(`El rival lo permitió en ${rivalAgainst.pct}% de sus últimos ${rivalAgainst.total} partidos.`);
  }
  if (homeOnly.total >= 3 && homeOnly.pct >= own.pct + 10) {
    positivePatterns.push(`En condición de ${isHome ? "local" : "visitante"} el cumplimiento sube a ${homeOnly.pct}%.`);
  }

  const contradictions: string[] = [];
  if (Math.abs(own.pct - rivalAgainst.pct) > 35) {
    contradictions.push("El dato ofensivo y el defensivo no están alineados en la misma dirección.");
  }
  if (own.total < 6) contradictions.push("La muestra disponible para este equipo es reducida.");

  const estimate = Math.round(own.pct * 0.6 + rivalAgainst.pct * 0.4);

  return {
    estimate,
    sampleSize: Math.min(own.total, rivalRecords.length || own.total),
    positivePatterns,
    contradictions,
    favoredTeamId: team.id,
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: own.pct,
      rivalVulnerability: rivalAgainst.pct || own.pct,
      homeAwayCondition: homeOnly.total >= 3 ? homeOnly.pct : own.pct,
      h2hEstimate: 50,
      includeH2H: false,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, team.id),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: lastThree,
      sampleSize: own.total,
    }),
  };
}

function resolveMatchTotalMarket(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
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
    positivePatterns: [
      `Se cumplió en ${combined.hits} de los últimos ${combined.total} partidos combinados de ambos equipos (${combined.pct}%).`,
      `${ctx.homeTeam.shortName}: ${homeSide.pct}% · ${ctx.awayTeam.shortName}: ${awaySide.pct}%.`,
    ],
    contradictions: Math.abs(homeSide.pct - awaySide.pct) > 40 ? ["Existe una diferencia notable entre el promedio de ambos equipos para este mercado."] : [],
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
  const predicate = (r: TeamMatchRecord) => r.goalsFor >= 1 && r.goalsAgainst >= 1;
  const combined = combinedRatio(ctx.homeRecords, ctx.awayRecords, predicate);
  const pct = marketId === "btts_yes" ? combined.pct : 100 - combined.pct;
  const lastThree = last3Ratio([...ctx.homeRecords.slice(0, 3), ...ctx.awayRecords.slice(0, 3)], predicate);

  return {
    estimate: pct,
    sampleSize: combined.total,
    positivePatterns: [`Ambos equipos anotaron en el ${combined.pct}% de los partidos recientes analizados.`],
    contradictions: [],
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: pct,
      rivalVulnerability: pct,
      homeAwayCondition: pct,
      h2hEstimate: ctx.headToHead.summary.bothScoredPct,
      includeH2H: ctx.includeH2H,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, undefined),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: marketId === "btts_yes" ? lastThree : 100 - lastThree,
      sampleSize: combined.total,
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

function resolveResult(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  const homeStrength = getTeamStrength(ctx.homeTeam.id) * 1.35 + 0.15;
  const awayStrength = getTeamStrength(ctx.awayTeam.id) * 1.15;
  const draw = 0.55;
  const sum = homeStrength + awayStrength + draw;
  const pHome = Math.round((homeStrength / sum) * 100);
  const pAway = Math.round((awayStrength / sum) * 100);
  const pDraw = 100 - pHome - pAway;
  const estimate = marketId === "result_home_win" ? pHome : marketId === "result_away_win" ? pAway : pDraw;
  const favoredTeamId = marketId === "result_home_win" ? ctx.homeTeam.id : marketId === "result_away_win" ? ctx.awayTeam.id : undefined;

  return {
    estimate,
    sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    positivePatterns: [`Forma reciente: ${ctx.homeTeam.shortName} ${ctx.homeTeam.form.join("")} · ${ctx.awayTeam.shortName} ${ctx.awayTeam.form.join("")}.`],
    contradictions: [],
    favoredTeamId,
    confidenceInputs: buildConfidenceInputs({
      recentPerformance: estimate,
      rivalVulnerability: estimate,
      homeAwayCondition: estimate,
      h2hEstimate: ctx.headToHead.summary.dominantTeamId === favoredTeamId ? 75 : 45,
      includeH2H: ctx.includeH2H,
      commonOpponentsScore: commonOpponentsScoreFor(ctx, favoredTeamId),
      includeCommonOpponents: ctx.includeCommonOpponents,
      lastThreeTrend: estimate,
      sampleSize: Math.min(ctx.homeRecords.length, ctx.awayRecords.length),
    }),
  };
}

function resolveFirstHalf(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  const base = marketId === "first_half_over_05" ? resolveMatchTotalMarket("goals_over_05", ctx) : resolveBtts("btts_yes", ctx);
  const factor = marketId === "first_half_over_05" ? 0.72 : 0.5;
  const estimate = Math.round(Math.min(88, Math.max(8, base.estimate * factor)));
  return {
    ...base,
    estimate,
    positivePatterns: [`Estimación derivada del mercado equivalente a partido completo (${base.estimate}%), ajustada a la primera parte.`],
    // The full-match confidence inputs don't hold for a scaled-down first-half estimate —
    // rebuild them so the weighted score reflects the adjusted number, not the parent market's.
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

function resolveMarket(marketId: string, ctx: MarketEvalContext): ResolvedMarket {
  if (TEAM_SIDE_MARKETS[marketId]) return resolveTeamSideMarket(marketId, ctx);
  if (MATCH_TOTAL_MARKETS[marketId]) return resolveMatchTotalMarket(marketId, ctx);
  if (marketId === "btts_yes" || marketId === "btts_no") return resolveBtts(marketId, ctx);
  if (marketId === "corners_most_team") return resolveCornersMostTeam(ctx);
  if (marketId === "result_home_win" || marketId === "result_draw" || marketId === "result_away_win") return resolveResult(marketId, ctx);
  if (marketId === "first_half_over_05" || marketId === "first_half_btts") return resolveFirstHalf(marketId, ctx);

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

function simulatedOdds(marketId: string, homeId: string, awayId: string, estimate: number): number {
  const rng = createRng(hashSeed(`odds:${marketId}:${homeId}:${awayId}`));
  const fair = 100 / Math.max(4, estimate);
  const margin = randFloat(rng, 0.82, 0.98, 3);
  const jitter = randFloat(rng, -0.03, 0.03, 3);
  return Math.min(11, Math.max(1.04, Math.round((fair * margin + jitter) * 100) / 100));
}

const riskWeight: Record<RiskLevel, number> = { bajo: 0, moderado: 1, alto: 2 };

function riskLevelFor(finalScore: number, sampleSize: number, contradictions: number): RiskLevel {
  let level: RiskLevel = "bajo";
  if (finalScore < 55 || sampleSize < 6) level = "moderado";
  if (finalScore < 45 || contradictions >= 2) level = "alto";
  if (riskWeight[level] < 1 && contradictions >= 1) level = "moderado";
  return level;
}

function recommendationFor(finalScore: number, sampleSize: number): MarketRecommendationState {
  if (sampleSize < 4) return "sin_datos_suficientes";
  if (finalScore >= 60) return "recomendado";
  return "evitar";
}

export function evaluateAllMarkets(ctx: MarketEvalContext, oddsOverrides: Partial<Record<string, number>>): MarketEvaluation[] {
  return bettingMarkets.map((market) => {
    const resolved = resolveMarket(market.id, ctx);
    const confidenceBreakdown = computeConfidenceBreakdown(resolved.confidenceInputs);
    const decimalOdds = oddsOverrides[market.id] ?? simulatedOdds(market.id, ctx.homeTeam.id, ctx.awayTeam.id, resolved.estimate);
    const odds: BettingOdds = {
      marketId: market.id,
      decimalOdds,
      impliedProbability: impliedProbability(decimalOdds),
    };
    const diff = valueDifference(resolved.estimate, decimalOdds);

    const evaluation: MarketEvaluation = {
      id: `${market.id}-${ctx.homeTeam.id}-${ctx.awayTeam.id}`,
      matchId: `${ctx.homeTeam.id}-vs-${ctx.awayTeam.id}`,
      market,
      confidenceBreakdown,
      confidence: confidenceBreakdown.finalScore,
      confidenceLevel: confidenceBreakdown.classification,
      odds,
      statisticalEstimate: resolved.estimate,
      valueDifference: diff,
      valueLevel: classifyValue(diff),
      riskLevel: riskLevelFor(confidenceBreakdown.finalScore, resolved.sampleSize, resolved.contradictions.length),
      positivePatterns: resolved.positivePatterns,
      contradictions: resolved.contradictions,
      dataQuality: dataQualityLabel(confidenceBreakdown.dataQuality),
      sampleSize: resolved.sampleSize,
      recommendation: recommendationFor(confidenceBreakdown.finalScore, resolved.sampleSize),
    };
    return evaluation;
  });
}

function buildRiskFactors(evaluation: MarketEvaluation, extra: string[]): RiskFactor[] {
  const risks: RiskFactor[] = [];
  evaluation.contradictions.forEach((c, i) =>
    risks.push({ id: `${evaluation.id}-c${i}`, description: c, severity: "media" })
  );
  if (evaluation.sampleSize < 10) {
    risks.push({ id: `${evaluation.id}-sample`, description: "La muestra disponible es limitada.", severity: "media" });
  }
  extra.forEach((description, i) => risks.push({ id: `${evaluation.id}-x${i}`, description, severity: "baja" }));
  if (risks.length === 0) {
    risks.push({ id: `${evaluation.id}-generic`, description: "Existe una posible rotación de plantilla.", severity: "baja" });
  }
  return risks.slice(0, 4);
}

// Near-universal truths (over 0.5 goals, over 0.5 goals in the 1st half, etc.) resolve true
// in almost every matchup regardless of the two teams involved — they carry little analytical
// signal, so they're excluded from the headline recommendation even when confidence is
// highest. They still show up in the full /mercados list.
const BEST_BET_ESTIMATE_CEILING = 90;

export function buildRecommendations(
  markets: MarketEvaluation[],
  ctx: MarketEvalContext
): { bestBet: BettingRecommendation | null; alternatives: BettingRecommendation[]; avoid: MarketEvaluation[] } {
  const eligible = markets
    .filter((m) => m.recommendation === "recomendado" && m.statisticalEstimate <= BEST_BET_ESTIMATE_CEILING)
    .sort((a, b) => b.confidence - a.confidence);
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
  const interesting = markets
    .filter((m) => m.recommendation === "recomendado" && m.statisticalEstimate <= BEST_BET_ESTIMATE_CEILING)
    .sort((a, b) => b.confidence - a.confidence);
  if (interesting.length > 0) return interesting[0];
  return markets.slice().sort((a, b) => b.confidence - a.confidence)[0];
}
