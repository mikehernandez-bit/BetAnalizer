import { Match, MarketEvaluation, SavedAnalysis, Team } from "@/types";
import { isMatchExpired } from "@/data/matches";

export interface MatchFilters {
  competitionId?: string;
  status?: Match["status"] | "all";
  search?: string;
  dateIso?: string;
}

export function filterMatches(matches: Match[], filters: MatchFilters, resolveTeamName: (id: string) => string): Match[] {
  return matches.filter((match) => {
    if (filters.competitionId && filters.competitionId !== "all" && match.competitionId !== filters.competitionId) return false;
    if (filters.status && filters.status !== "all" && filters.status !== match.status) return false;
    if (filters.dateIso && match.date !== filters.dateIso) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${resolveTeamName(match.homeTeamId)} ${resolveTeamName(match.awayTeamId)}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if ((filters.status === "scheduled" || filters.status === "all") && isMatchExpired(match)) return false;
    return true;
  });
}

export interface TeamFilters {
  competitionId?: string;
  country?: string;
  search?: string;
}

export function filterTeams(teams: Team[], filters: TeamFilters): Team[] {
  return teams.filter((team) => {
    if (filters.competitionId && filters.competitionId !== "all" && team.competitionId !== filters.competitionId) return false;
    if (filters.country && filters.country !== "all" && team.country !== filters.country) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!team.name.toLowerCase().includes(q) && !team.shortName.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export type MarketSortKey = "confidence" | "risk" | "odds" | "value";

export function sortMarkets(markets: MarketEvaluation[], sortKey: MarketSortKey): MarketEvaluation[] {
  const riskWeight = { bajo: 0, moderado: 1, alto: 2 } as const;

  return [...markets].sort((a, b) => {
    const confA = Number.isFinite(a?.confidence) ? a.confidence : 0;
    const confB = Number.isFinite(b?.confidence) ? b.confidence : 0;
    const estA = Number.isFinite(a?.statisticalEstimate) ? a.statisticalEstimate : 0;
    const estB = Number.isFinite(b?.statisticalEstimate) ? b.statisticalEstimate : 0;

    const scoreA = Math.max(confA, estA);
    const scoreB = Math.max(confB, estB);

    switch (sortKey) {
      case "confidence": {
        if (confB !== confA) return confB - confA;
        return estB - estA;
      }
      case "risk": {
        const riskDiff = (riskWeight[a.riskLevel] ?? 1) - (riskWeight[b.riskLevel] ?? 1);
        if (riskDiff !== 0) return riskDiff;
        return scoreB - scoreA;
      }
      case "odds": {
        const oddsDiff = (b.odds?.decimalOdds ?? 0) - (a.odds?.decimalOdds ?? 0);
        if (oddsDiff !== 0) return oddsDiff;
        return scoreB - scoreA;
      }
      case "value": {
        const valueDiff = (b.valueDifference ?? -100) - (a.valueDifference ?? -100);
        if (valueDiff !== 0) return valueDiff;
        return scoreB - scoreA;
      }
      default:
        return 0;
    }
  });
}

export function filterMarketsByCategory(markets: MarketEvaluation[], category?: string): MarketEvaluation[] {
  if (!category || category === "all") return markets;
  return markets.filter((m) => m.market.category === category);
}

/** Umbrales y rangos de % de acierto seleccionables en "Mercados". */
export interface ConfidenceRangeOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const CONFIDENCE_RANGE_OPTIONS: ConfidenceRangeOption[] = [
  { id: "all", label: "Todas", min: 0, max: 100 },
  { id: "0-10", label: "0 a 10%", min: 0, max: 10 },
  { id: "10-20", label: "10 a 20%", min: 10, max: 20 },
  { id: "20-30", label: "20 a 30%", min: 20, max: 30 },
  { id: "30-40", label: "30 a 40%", min: 30, max: 40 },
  { id: "40-50", label: "40 a 50%", min: 40, max: 50 },
  { id: "50-60", label: "50 a 60%", min: 50, max: 60 },
  { id: "60-70", label: "60 a 70%", min: 60, max: 70 },
  { id: "70-80", label: "70 a 80%", min: 70, max: 80 },
  { id: "80-90", label: "80 a 90%", min: 80, max: 90 },
  { id: "90-100", label: "90 a 100%", min: 90, max: 100 },
];

export const MIN_CONFIDENCE_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export function filterMarketsByConfidenceRange(
  markets: MarketEvaluation[],
  min: number,
  max: number
): MarketEvaluation[] {
  if (min === 0 && max === 100) return markets;
  return markets.filter((m) => {
    const val = Math.max(m.confidence, m.statisticalEstimate);
    return val >= min && val <= max;
  });
}

export function filterMarketsByMinConfidence(markets: MarketEvaluation[], minConfidence: number): MarketEvaluation[] {
  if (!minConfidence || minConfidence <= 0) return markets;
  return markets.filter((m) => Math.max(m.confidence, m.statisticalEstimate) >= minConfidence);
}

export interface HistoryFilters {
  status?: SavedAnalysis["status"];
  search?: string;
}

export function filterSavedAnalyses(items: SavedAnalysis[], filters: HistoryFilters, resolveTeamName: (id: string) => string): SavedAnalysis[] {
  return items.filter((item) => {
    if (filters.status && filters.status !== item.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${resolveTeamName(item.homeTeamId)} ${resolveTeamName(item.awayTeamId)} ${item.recommendedMarket}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
