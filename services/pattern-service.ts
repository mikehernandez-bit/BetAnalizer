import { CrossPattern, MatchSampleSize, Pattern } from "@/types";
import { computeCrossPatterns, computeTeamPatterns } from "@/utils/statistics";
import { getFilteredTeamForm, TeamFormOptions } from "@/services/team-service";
import { getMarketById } from "@/data/markets";

const SIMULATED_LATENCY_MS = 150;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function getPatternsForTeam(teamId: string, count: MatchSampleSize | number, options?: TeamFormOptions): Pattern[] {
  const form = getFilteredTeamForm(teamId, count, options);
  return computeTeamPatterns(teamId, form.matches);
}

export async function fetchTeamPatterns(teamId: string, count: MatchSampleSize | number, options?: TeamFormOptions): Promise<Pattern[]> {
  return delay(getPatternsForTeam(teamId, count, options));
}

export function getCrossPatterns(
  homeTeamId: string,
  awayTeamId: string,
  count: MatchSampleSize | number,
  options?: TeamFormOptions
): CrossPattern[] {
  const homeForm = getFilteredTeamForm(homeTeamId, count, options);
  const awayForm = getFilteredTeamForm(awayTeamId, count, options);
  return computeCrossPatterns(homeTeamId, homeForm.matches, awayTeamId, awayForm.matches);
}

export interface TeamBestMarket {
  marketId: string;
  marketName: string;
  percentage: number;
  patternTitle: string;
}

/** Best markets for a team based on its own recent-pattern hit rate — used on the team profile page. */
export function getTeamBestMarkets(teamId: string, count: MatchSampleSize | number = 10, limit = 4): TeamBestMarket[] {
  const patterns = getPatternsForTeam(teamId, count);
  return patterns
    .map((p) => {
      const marketId = p.id.replace(`${teamId}-`, "");
      const templateMarketId = MARKET_ID_BY_TEMPLATE[marketId];
      const market = templateMarketId ? getMarketById(templateMarketId) : undefined;
      if (!market) return null;
      return { marketId: market.id, marketName: market.name, percentage: p.percentage, patternTitle: p.title };
    })
    .filter((v): v is TeamBestMarket => v !== null)
    .slice(0, limit);
}

const MARKET_ID_BY_TEMPLATE: Record<string, string> = {
  goals_for_ge1: "goals_over_05",
  match_over25: "goals_over_25",
  btts: "btts_yes",
  match_corners_over65: "corners_over_65",
  match_corners_over75: "corners_over_75",
  match_corners_over85: "corners_over_85",
  match_corners_over95: "corners_over_95",
  match_corners_over105: "corners_over_105",
  match_corners_under115: "corners_under_115",
  corners_for_gt45: "corners_home_over_45",
  corners_for_gt35: "corners_home_over_35",
  sot_for_ge4: "sot_home_over_35",
  shots_for_ge9: "shots_home_over_85",
};

export async function fetchCrossPatterns(
  homeTeamId: string,
  awayTeamId: string,
  count: MatchSampleSize | number,
  options?: TeamFormOptions
): Promise<CrossPattern[]> {
  return delay(getCrossPatterns(homeTeamId, awayTeamId, count, options));
}
