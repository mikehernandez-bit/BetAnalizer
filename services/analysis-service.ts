import { AnalysisConfig, AnalysisResult, MarketReliabilityProfile, Match, MatchSampleSize, RadarProfile, ResultCalibrationProfile, Team } from "@/types";
import { getTeamById } from "@/data/teams";
import { matches } from "@/data/matches";
import { getHeadToHead } from "@/data/head-to-head";
import { getCommonOpponents } from "@/data/common-opponents";
import { getFilteredTeamForm, TeamFormOptions } from "@/services/team-service";
import { computeCrossPatterns, computeTeamPatterns, mean } from "@/utils/statistics";
import { evaluateAllMarkets, buildRecommendations, MarketEvalContext } from "@/services/market-service";
import { dataQualityFromSampleSize, dataQualityLabel } from "@/utils/confidence";
import { readStoredMarketReliability, readStoredResultCalibration } from "@/lib/model-feedback";

export function buildAnalysisId(homeTeamId: string, awayTeamId: string, matchCount: number): string {
  return `${homeTeamId}-vs-${awayTeamId}-${matchCount}c`;
}

export function parseAnalysisId(id: string): { homeTeamId: string; awayTeamId: string; matchCount: MatchSampleSize } | null {
  const [homePart, rest] = id.split("-vs-");
  if (!homePart || !rest) return null;
  const match = rest.match(/^(.*)-(\d+)c$/);
  if (!match) return null;
  const [, awayTeamId, countRaw] = match;
  const count = Number(countRaw) as MatchSampleSize;
  if (![5, 10, 15, 20].includes(count)) return null;
  return { homeTeamId: homePart, awayTeamId, matchCount: count };
}

/**
 * "odds" arranca siempre vacío: BetAnalyzer no tiene una fuente real de cuotas
 * publicadas, así que no inventa ninguna por defecto. Se completa únicamente
 * si el usuario carga cuotas reales de su casa de apuestas en el paso
 * "Cuotas" del asistente — nunca con un valor de referencia fabricado.
 */
export function defaultAnalysisConfig(homeTeamId: string, awayTeamId: string, matchCount: MatchSampleSize = 15): AnalysisConfig {
  const homeTeam = getTeamById(homeTeamId);
  return {
    competitionId: homeTeam?.competitionId ?? "uefa-champions-league",
    season: "2026",
    date: new Date().toISOString().slice(0, 10),
    homeTeamId,
    awayTeamId,
    matchCount,
    onlyLeague: false,
    includeCups: true,
    onlyHomeConditionTeamA: false,
    onlyAwayConditionTeamB: false,
    includeH2H: true,
    includeCommonOpponents: true,
    weightLastFive: true,
    excludeRedCards: false,
    excludeFriendlies: true,
    odds: {},
  };
}

const configCache = new Map<string, AnalysisConfig>();

export function cacheAnalysisConfig(id: string, config: AnalysisConfig) {
  configCache.set(id, config);
}

export function getCachedAnalysisConfig(id: string): AnalysisConfig | undefined {
  return configCache.get(id);
}

function resolveTeamFormOptions(config: AnalysisConfig, side: "home" | "away"): TeamFormOptions {
  return {
    onlyVenue: side === "home" ? (config.onlyHomeConditionTeamA ? "local" : undefined) : config.onlyAwayConditionTeamB ? "visitante" : undefined,
    onlyLeague: config.onlyLeague,
    includeCups: config.includeCups,
    excludeFriendlies: config.excludeFriendlies,
    excludeRedCards: config.excludeRedCards,
  };
}

function findOrSynthesizeMatch(config: AnalysisConfig, homeTeam: Team, awayTeam: Team): Match {
  const existing = matches.find(
    (m) =>
      m.homeTeamId === config.homeTeamId &&
      m.awayTeamId === config.awayTeamId &&
      (m.status === "scheduled" || m.status === "live")
  );
  if (existing) return existing;

  const anyExisting = matches.find((m) => m.homeTeamId === config.homeTeamId && m.awayTeamId === config.awayTeamId);
  if (anyExisting) return anyExisting;

  return {
    id: `virtual-${config.homeTeamId}-${config.awayTeamId}`,
    competitionId: config.competitionId,
    competitionType: "league",
    season: config.season,
    matchday: homeTeam.played + 1,
    date: config.date,
    time: "20:00",
    stadium: homeTeam.stadium,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    status: "scheduled",
  };
}

function normalize(value: number, max: number): number {
  return Math.round(Math.min(100, Math.max(0, (value / max) * 100)));
}

function radarProfileFromForm(form: ReturnType<typeof getFilteredTeamForm>): RadarProfile {
  const winRate =
    form.matches.length === 0 ? 0 : Math.round((form.matches.filter((m) => m.result === "W").length / form.matches.length) * 100);

  return {
    attack: normalize(form.stats.goalsFor.average, 3),
    defense: 100 - normalize(form.stats.goalsAgainst.average, 3),
    goals: normalize(form.stats.goalsFor.average + form.stats.goalsAgainst.average, 5),
    corners: normalize(form.stats.cornersFor.average, 8),
    shots: normalize(form.stats.shotsFor.average, 16),
    shotsOnTarget: normalize(form.stats.shotsOnTargetFor.average, 7),
    form: winRate,
  };
}

function buildQuickRead(homeTeam: Team, awayTeam: Team, homeForm: ReturnType<typeof getFilteredTeamForm>, awayForm: ReturnType<typeof getFilteredTeamForm>, crossPatterns: ReturnType<typeof computeCrossPatterns>): string {
  const homeAttack = homeForm.stats.goalsFor.average;
  const awayAttack = awayForm.stats.goalsFor.average;
  const strongerAttack = homeAttack >= awayAttack ? homeTeam : awayTeam;
  const strongerAttackValue = homeAttack >= awayAttack ? homeAttack : awayAttack;

  const homeConcede = homeForm.stats.goalsAgainst.average;
  const awayConcede = awayForm.stats.goalsAgainst.average;
  const weakerDefense = homeConcede >= awayConcede ? homeTeam : awayTeam;
  const weakerDefenseValue = homeConcede >= awayConcede ? homeConcede : awayConcede;

  const topCross = crossPatterns.find((c) => c.strength !== "contradictorio" && c.strength !== "debil");

  const sentences = [
    `El ${strongerAttack.name} presenta mayor producción ofensiva, con un promedio de ${strongerAttackValue.toFixed(1)} goles por partido en la muestra analizada.`,
    `El ${weakerDefense.name} concede un promedio de ${weakerDefenseValue.toFixed(1)} goles por partido, lo que abre oportunidades para el rival.`,
    topCross
      ? `La principal coincidencia estadística aparece en el mercado de ${topCross.marketLabel.toLowerCase()}.`
      : "No se detectaron coincidencias estadísticas especialmente fuertes entre ambos equipos en esta muestra.",
  ];

  return sentences.join(" ");
}

export function generateAnalysis(
  config: AnalysisConfig,
  resultCalibration: ResultCalibrationProfile | undefined = readStoredResultCalibration(),
  marketReliability: MarketReliabilityProfile = readStoredMarketReliability()
): AnalysisResult {
  const homeTeam = getTeamById(config.homeTeamId);
  const awayTeam = getTeamById(config.awayTeamId);
  if (!homeTeam || !awayTeam) {
    throw new Error("No se encontraron los equipos seleccionados para el análisis.");
  }

  const homeForm = getFilteredTeamForm(config.homeTeamId, config.matchCount, resolveTeamFormOptions(config, "home"));
  const awayForm = getFilteredTeamForm(config.awayTeamId, config.matchCount, resolveTeamFormOptions(config, "away"));

  const homePatterns = computeTeamPatterns(config.homeTeamId, homeForm.matches);
  const awayPatterns = computeTeamPatterns(config.awayTeamId, awayForm.matches);
  const crossPatterns = computeCrossPatterns(config.homeTeamId, homeForm.matches, config.awayTeamId, awayForm.matches);

  const headToHead = getHeadToHead(config.homeTeamId, config.awayTeamId);
  const commonOpponents = getCommonOpponents(config.homeTeamId, config.awayTeamId);

  const ctx: MarketEvalContext = {
    homeTeam,
    awayTeam,
    homeRecords: homeForm.matches,
    awayRecords: awayForm.matches,
    headToHead,
    commonOpponents,
    includeH2H: config.includeH2H,
    includeCommonOpponents: config.includeCommonOpponents,
    weightRecentResults: config.weightLastFive,
    resultCalibration,
    marketReliability,
  };

  const markets = evaluateAllMarkets(ctx, config.odds);
  const { bestBet, alternatives, avoid } = buildRecommendations(markets, ctx);

  const overallConfidence = bestBet ? bestBet.marketEvaluation.confidence : Math.round(mean(markets.map((m) => m.confidence)));
  const matchesAnalyzed = Math.min(homeForm.sampleSize, awayForm.sampleSize);
  const dataQuality = dataQualityLabel(dataQualityFromSampleSize(matchesAnalyzed));

  const match = findOrSynthesizeMatch(config, homeTeam, awayTeam);
  const now = new Date().toISOString();

  return {
    id: buildAnalysisId(config.homeTeamId, config.awayTeamId, config.matchCount),
    matchId: match.id,
    match,
    generatedAt: now,
    config,
    homeForm,
    awayForm,
    homePatterns,
    awayPatterns,
    headToHead,
    commonOpponents,
    crossPatterns,
    markets,
    bestBet,
    alternatives,
    avoid,
    overallConfidence,
    dataQuality,
    matchesAnalyzed,
    lastUpdated: now,
    quickRead: buildQuickRead(homeTeam, awayTeam, homeForm, awayForm, crossPatterns),
    radar: { home: radarProfileFromForm(homeForm), away: radarProfileFromForm(awayForm) },
  };
}

export async function generateAnalysisAsync(config: AnalysisConfig): Promise<AnalysisResult> {
  return new Promise((resolve) => setTimeout(() => resolve(generateAnalysis(config)), 200));
}

export function resolveAnalysisById(id: string): AnalysisResult | null {
  const cachedConfig = getCachedAnalysisConfig(id);
  if (cachedConfig) return generateAnalysis(cachedConfig);

  const parsed = parseAnalysisId(id);
  if (!parsed) return null;
  const home = getTeamById(parsed.homeTeamId);
  const away = getTeamById(parsed.awayTeamId);
  if (!home || !away) return null;

  return generateAnalysis(defaultAnalysisConfig(parsed.homeTeamId, parsed.awayTeamId, parsed.matchCount));
}
