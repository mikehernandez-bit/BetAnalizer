import { Match, MarketEvaluation, SavedAnalysis, Team } from "@/types";

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
    switch (sortKey) {
      case "confidence":
        return b.confidence - a.confidence;
      case "risk":
        return riskWeight[a.riskLevel] - riskWeight[b.riskLevel];
      case "odds":
        return (b.odds?.decimalOdds ?? 0) - (a.odds?.decimalOdds ?? 0);
      case "value":
        return (b.valueDifference ?? -100) - (a.valueDifference ?? -100);
      default:
        return 0;
    }
  });
}

export function filterMarketsByCategory(markets: MarketEvaluation[], category?: string): MarketEvaluation[] {
  if (!category || category === "all") return markets;
  return markets.filter((m) => m.market.category === category);
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
