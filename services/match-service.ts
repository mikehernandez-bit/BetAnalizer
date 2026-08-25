import { Match } from "@/types";
import {
  matches,
  getMatchById,
  getMatchesByTeam,
  getMatchesByCompetition,
  getUpcomingMatches,
  getFinishedMatches,
  getMatchesOnDate,
} from "@/data/matches";
import { getTeamStrength } from "@/data/teams";
import { getCrossPatterns } from "@/services/pattern-service";

const SIMULATED_LATENCY_MS = 120;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchAllMatches(): Promise<Match[]> {
  return delay(matches);
}

export async function fetchMatch(id: string): Promise<Match | undefined> {
  return delay(getMatchById(id));
}

export async function fetchMatchesByTeam(teamId: string): Promise<Match[]> {
  return delay(getMatchesByTeam(teamId));
}

export async function fetchMatchesByCompetition(competitionId: string): Promise<Match[]> {
  return delay(getMatchesByCompetition(competitionId));
}

export async function fetchUpcomingMatches(): Promise<Match[]> {
  return delay(getUpcomingMatches());
}

export async function fetchFinishedMatches(): Promise<Match[]> {
  return delay(getFinishedMatches());
}

export async function fetchMatchesOnDate(dateIso: string): Promise<Match[]> {
  return delay(getMatchesOnDate(dateIso));
}

export function getFeaturedMatches(limit = 6): Match[] {
  return getUpcomingMatches().slice(0, limit);
}

export interface MatchQuickStats {
  probability: number;
  favoredTeamId: string;
  strongPatterns: number;
}

const quickStatsCache = new Map<string, MatchQuickStats>();

export function estimateFeaturedStats(homeTeamId: string, awayTeamId: string): MatchQuickStats {
  const key = `${homeTeamId}::${awayTeamId}`;
  const cached = quickStatsCache.get(key);
  if (cached) return cached;

  const homeStrength = getTeamStrength(homeTeamId) * 1.25 + 0.1;
  const awayStrength = getTeamStrength(awayTeamId);
  const probability = Math.round((homeStrength / (homeStrength + awayStrength)) * 100);
  const cross = getCrossPatterns(homeTeamId, awayTeamId, 15);
  const strongPatterns = cross.filter((c) => c.strength === "fuerte" || c.strength === "muy_fuerte").length;

  const result: MatchQuickStats = { probability, favoredTeamId: probability >= 50 ? homeTeamId : awayTeamId, strongPatterns };
  quickStatsCache.set(key, result);
  return result;
}

/**
 * Fecha actual en formato ISO (UTC). Antes era una constante fija
 * ("2026-08-04") que había que ir actualizando a mano y se desalineaba del
 * reloj real cada vez que pasaban los días — un partido de hoy terminaba
 * mostrándose como "en 2 días" y viceversa. Ahora se calcula en cada llamada.
 */
export function getTodayIso(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
