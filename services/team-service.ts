import { MatchSampleSize, Team, TeamForm } from "@/types";
import { teams, getTeamById, getTeamsByCompetition } from "@/data/teams";
import { getTeamMatchHistory } from "@/data/team-history";
import { buildTeamForm } from "@/utils/statistics";

/**
 * Thin async wrapper around the mock data layer. Every function here is the
 * seam to swap for real network calls — same signatures, real fetch bodies.
 */
const SIMULATED_LATENCY_MS = 120;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchAllTeams(): Promise<Team[]> {
  return delay(teams);
}

export async function fetchTeam(teamId: string): Promise<Team | undefined> {
  return delay(getTeamById(teamId));
}

export async function fetchTeamsByCompetition(competitionId: string): Promise<Team[]> {
  return delay(getTeamsByCompetition(competitionId));
}

export interface TeamFormOptions {
  onlyVenue?: "local" | "visitante";
  onlyLeague?: boolean;
  includeCups?: boolean;
  excludeFriendlies?: boolean;
  excludeRedCards?: boolean;
}

export function getFilteredTeamForm(teamId: string, count: MatchSampleSize | number, options: TeamFormOptions = {}): TeamForm {
  const fullPool = getTeamMatchHistory(teamId, 20);

  let pool = fullPool;
  if (options.onlyVenue) pool = pool.filter((r) => r.venue === options.onlyVenue);
  if (options.onlyLeague) pool = pool.filter((r) => r.competitionType === "league");
  if (options.excludeFriendlies) pool = pool.filter((r) => r.competitionType !== "friendly");
  if (options.excludeRedCards) pool = pool.filter((r) => r.redCards === 0);
  if (options.includeCups === false) pool = pool.filter((r) => r.competitionType !== "cup");

  // A team whose entire available sample is, say, preseason friendlies (new season not
  // started yet) would otherwise end up with zero records once "excluir amistosos" applies
  // — better to fall back to the unfiltered pool than present a broken, empty analysis.
  if (pool.length === 0 && fullPool.length > 0) pool = fullPool;

  const sliced = pool.slice(0, count);
  return buildTeamForm(teamId, sliced);
}

export async function fetchTeamForm(teamId: string, count: MatchSampleSize | number, options?: TeamFormOptions): Promise<TeamForm> {
  return delay(getFilteredTeamForm(teamId, count, options));
}
