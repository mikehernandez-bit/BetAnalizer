import { DashboardSummary, MarketEvaluation } from "@/types";
import { getFeaturedMatches, getTodayIso } from "@/services/match-service";
import { getMatchesOnDate } from "@/data/matches";
import { savedAnalyses } from "@/data/analyses";
import { defaultAnalysisConfig, generateAnalysis } from "@/services/analysis-service";
import { getTeamById } from "@/data/teams";
import { bettingMarkets, MARKET_CATEGORY_LABELS } from "@/data/markets";
import { pickHeadlineMarket } from "@/services/market-service";

export function getDashboardSummary(): DashboardSummary {
  const featured = getFeaturedMatches(6);

  let strongPatterns = 0;
  let valueBets = 0;

  featured.forEach((match) => {
    const analysis = generateAnalysis(defaultAnalysisConfig(match.homeTeamId, match.awayTeamId, 10));
    strongPatterns += analysis.crossPatterns.filter((c) => c.strength === "fuerte" || c.strength === "muy_fuerte").length;
    valueBets += analysis.markets.filter((m) => m.valueLevel === "valor_alto" || m.valueLevel === "valor_moderado").length;
  });

  const decided = savedAnalyses.filter((a) => a.status === "ganada" || a.status === "perdida");
  const won = decided.filter((a) => a.status === "ganada").length;
  const historicalAccuracy = decided.length > 0 ? Math.round((won / decided.length) * 100) : 0;

  return {
    matchesToday: getMatchesOnDate(getTodayIso()).length,
    analysesDone: savedAnalyses.length,
    strongPatterns,
    valueBets,
    historicalAccuracy,
    savedMarkets: 0,
  };
}

export interface HighlightMarket {
  matchLabel: string;
  matchId: string;
  analysisId: string;
  evaluation: MarketEvaluation;
  matchingPatterns: number;
}

export function getTopHighlightMarkets(limit = 4): HighlightMarket[] {
  const featured = getFeaturedMatches(6);
  const highlights: HighlightMarket[] = [];

  featured.forEach((match) => {
    const home = getTeamById(match.homeTeamId);
    const away = getTeamById(match.awayTeamId);
    if (!home || !away) return;
    const analysis = generateAnalysis(defaultAnalysisConfig(match.homeTeamId, match.awayTeamId, 10));
    const best = pickHeadlineMarket(analysis.markets);
    if (!best) return;
    highlights.push({
      matchLabel: `${home.shortName} vs ${away.shortName}`,
      matchId: match.id,
      analysisId: analysis.id,
      evaluation: best,
      matchingPatterns: analysis.crossPatterns.filter((c) => c.marketId === best.market.id).length || analysis.homePatterns.length,
    });
  });

  return highlights.sort((a, b) => b.evaluation.confidence - a.evaluation.confidence).slice(0, limit);
}

const CATEGORY_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#A855F7", "#39FF88", "#0EA5E9", "#F472B6", "#94A3B8"];

const WEEKS = 8;

function weeklyBuckets() {
  const today = new Date(`${getTodayIso()}T12:00:00Z`).getTime();
  const buckets = Array.from({ length: WEEKS }, (_, i) => ({
    label: i === WEEKS - 1 ? "Esta sem." : `Sem. -${WEEKS - 1 - i}`,
    won: 0,
    lost: 0,
    confidenceSum: 0,
    count: 0,
  }));

  savedAnalyses.forEach((item) => {
    const itemTime = new Date(`${item.savedAt}T12:00:00Z`).getTime();
    const daysAgo = Math.floor((today - itemTime) / 86400000);
    const weekIdx = Math.floor(daysAgo / 7);
    if (weekIdx < 0 || weekIdx >= WEEKS) return;
    const bucket = buckets[WEEKS - 1 - weekIdx];
    bucket.count += 1;
    bucket.confidenceSum += item.confidence;
    if (item.status === "ganada") bucket.won += 1;
    if (item.status === "perdida") bucket.lost += 1;
  });

  return buckets;
}

export function getWeeklyPerformanceChart() {
  return weeklyBuckets().map((b) => ({
    label: b.label,
    value: b.won + b.lost > 0 ? Math.round((b.won / (b.won + b.lost)) * 100) : 0,
  }));
}

export function getConfidenceTrendChart() {
  return weeklyBuckets().map((b) => ({
    label: b.label,
    value: b.count > 0 ? Math.round(b.confidenceSum / b.count) : 0,
  }));
}

export function getMarketDistributionChart() {
  const counts = new Map<string, number>();
  savedAnalyses.forEach((item) => {
    const market = bettingMarkets.find((m) => m.name === item.recommendedMarket);
    const category = market?.category ?? "goles";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, value], i) => ({
      name: MARKET_CATEGORY_LABELS[category] ?? category,
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
}

export function getPatternsByCategoryChart() {
  const featured = getFeaturedMatches(6);
  const counts = new Map<string, number>();

  featured.forEach((match) => {
    const analysis = generateAnalysis(defaultAnalysisConfig(match.homeTeamId, match.awayTeamId, 10));
    [...analysis.homePatterns, ...analysis.awayPatterns].forEach((p) => {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    });
    analysis.crossPatterns.forEach((p) => {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count]) => ({ category: MARKET_CATEGORY_LABELS[category] ?? category, count }));
}
