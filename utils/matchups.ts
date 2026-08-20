import type { CommonOpponent, CommonOpponentSide, CommonOpponentsAnalysis, H2HMatchRecord, HeadToHead, TeamMatchRecord } from "@/types";
import { mean } from "@/utils/statistics";
import { getTeamById } from "@/data/teams";

// ============================================================================
// Deriva "enfrentamientos directos" y "rivales en común" a partir de los
// historiales ya importados (Record<teamId, TeamMatchRecord[]>), sin
// necesidad de que el JSON de "Agregar partido" declare esos datos aparte.
//
// - Head-to-head: si el historial de un equipo trae un registro cuyo
//   opponentId es justo el id del otro equipo, ese registro ES el partido
//   entre ambos.
// - Rivales en común: si ambos equipos enfrentaron alguna vez al mismo
//   opponentId, se compara el resultado más reciente de cada uno contra ese
//   rival compartido.
//
// Estas funciones son puras y no dependen de dónde vengan los historiales:
// úsalas con `importedHistories` (ver data/head-to-head.ts / data/common-opponents.ts)
// como con cualquier otro Record<string, TeamMatchRecord[]> — por eso son
// fáciles de probar con datos sintéticos.
// ============================================================================

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatOpponentName(opponentId: string): string {
  if (!opponentId) return "Rival";
  const known = getTeamById(opponentId);
  if (known?.name) return known.name;

  return opponentId
    .split("-")
    .map((word) => {
      const lower = word.toLowerCase();
      if (["fc", "sc", "cf", "cd", "ud", "ca", "ldu", "fk", "bk", "nk", "if", "aif", "ucl", "uefa", "conmebol", "sp"].includes(lower)) {
        return lower.toUpperCase();
      }
      if (["de", "del", "la", "los", "las", "el", "en", "y", "van", "der"].includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function emptyHeadToHead(teamAId: string, teamBId: string): HeadToHead {
  return {
    teamAId,
    teamBId,
    matches: [],
    summary: {
      totalMatches: 0,
      teamAWins: 0,
      teamBWins: 0,
      draws: 0,
      avgGoals: 0,
      avgCorners: 0,
      bothScoredPct: 0,
      over25Pct: 0,
      dominantTeamId: null,
    },
  };
}

export function deriveHeadToHead(teamAId: string, teamBId: string, histories: Record<string, TeamMatchRecord[]>): HeadToHead {
  if (teamAId === teamBId) return emptyHeadToHead(teamAId, teamBId);

  const fromA = (histories[teamAId] ?? []).filter((r) => r.opponentId === teamBId);
  const fromB = (histories[teamBId] ?? []).filter((r) => r.opponentId === teamAId);

  // Se empareja por fecha (dos equipos no se enfrentan dos veces el mismo
  // día): si ambos historiales incluyen esa fecha, se combinan sus tarjetas;
  // si solo uno la incluye, se usa esa versión del partido.
  const byDate = new Map<string, { a?: TeamMatchRecord; b?: TeamMatchRecord }>();
  fromA.forEach((r) => byDate.set(r.date, { ...byDate.get(r.date), a: r }));
  fromB.forEach((r) => byDate.set(r.date, { ...byDate.get(r.date), b: r }));

  const matches: H2HMatchRecord[] = [...byDate.entries()]
    .map(([date, { a, b }]) => {
      const primary = (a ?? b)!;
      const primaryIsA = Boolean(a);
      const selfId = primaryIsA ? teamAId : teamBId;
      const rivalId = primaryIsA ? teamBId : teamAId;
      const isHome = primary.venue === "local";
      return {
        matchId: primary.matchId,
        date,
        competitionId: primary.competitionId,
        homeTeamId: isHome ? selfId : rivalId,
        awayTeamId: isHome ? rivalId : selfId,
        homeGoals: isHome ? primary.goalsFor : primary.goalsAgainst,
        awayGoals: isHome ? primary.goalsAgainst : primary.goalsFor,
        homeCorners: isHome ? primary.cornersFor : primary.cornersAgainst,
        awayCorners: isHome ? primary.cornersAgainst : primary.cornersFor,
        homeShotsOnTarget: isHome ? primary.shotsOnTargetFor : primary.shotsOnTargetAgainst,
        awayShotsOnTarget: isHome ? primary.shotsOnTargetAgainst : primary.shotsOnTargetFor,
        // Suma las tarjetas de ambos lados cuando están disponibles; si solo
        // un equipo trae ese partido en su historial, es una subestimación
        // (solo se cuentan las tarjetas de ese equipo).
        cards: (a ? a.yellowCards + a.redCards : 0) + (b ? b.yellowCards + b.redCards : 0),
      };
    })
    .sort((x, y) => (x.date < y.date ? 1 : -1));

  if (matches.length === 0) return emptyHeadToHead(teamAId, teamBId);

  let teamAWins = 0;
  let teamBWins = 0;
  let draws = 0;
  let goalsSum = 0;
  let cornersSum = 0;
  let bothScored = 0;
  let over25 = 0;

  matches.forEach((m) => {
    const aGoals = m.homeTeamId === teamAId ? m.homeGoals : m.awayGoals;
    const bGoals = m.homeTeamId === teamAId ? m.awayGoals : m.homeGoals;
    if (aGoals > bGoals) teamAWins += 1;
    else if (bGoals > aGoals) teamBWins += 1;
    else draws += 1;
    goalsSum += m.homeGoals + m.awayGoals;
    cornersSum += (m.homeCorners ?? 0) + (m.awayCorners ?? 0);
    if (m.homeGoals > 0 && m.awayGoals > 0) bothScored += 1;
    if (m.homeGoals + m.awayGoals > 2.5) over25 += 1;
  });

  const total = matches.length;

  return {
    teamAId,
    teamBId,
    matches,
    summary: {
      totalMatches: total,
      teamAWins,
      teamBWins,
      draws,
      avgGoals: round1(goalsSum / total),
      avgCorners: round1(cornersSum / total),
      bothScoredPct: Math.round((bothScored / total) * 100),
      over25Pct: Math.round((over25 / total) * 100),
      dominantTeamId: teamAWins === teamBWins ? null : teamAWins > teamBWins ? teamAId : teamBId,
    },
  };
}

function emptyCommonOpponents(): CommonOpponentsAnalysis {
  return {
    opponents: [],
    summary: { betterTeamId: null, avgDifference: 0, matchesCount: 0, relevance: "baja" },
  };
}

function toCommonOpponentSide(record: TeamMatchRecord): CommonOpponentSide {
  return {
    matchId: record.matchId,
    date: record.date,
    venue: record.venue,
    result: record.result,
    goalsFor: record.goalsFor,
    goalsAgainst: record.goalsAgainst,
    goalsForFirstHalf: record.goalsForFirstHalf,
    goalsAgainstFirstHalf: record.goalsAgainstFirstHalf,
    goalsForSecondHalf: record.goalsForSecondHalf,
    goalsAgainstSecondHalf: record.goalsAgainstSecondHalf,
    corners: record.cornersFor,
    cornersAgainst: record.cornersAgainst,
    yellowCards: record.yellowCards,
    yellowCardsAgainst: record.yellowCardsAgainst,
    redCards: record.redCards,
    redCardsAgainst: record.redCardsAgainst,
    shots: record.shotsFor,
    shotsOnTarget: record.shotsOnTargetFor,
    possession: record.possession,
  };
}

function latestPerOpponent(records: TeamMatchRecord[]): Map<string, TeamMatchRecord> {
  // Los historiales ya vienen ordenados de más reciente a más antiguo (ver
  // mergeHistoryRecords en lib/match-package-merge.ts), así que el primer
  // registro que se ve contra cada rival es el más reciente.
  const map = new Map<string, TeamMatchRecord>();
  records.forEach((r) => {
    if (!map.has(r.opponentId)) map.set(r.opponentId, r);
  });
  return map;
}

function buildConclusion(diffGoals: number, teamALabel: string, teamBLabel: string): string {
  if (diffGoals > 0) return `${teamALabel} tuvo mejor diferencia de gol frente a este rival compartido (+${diffGoals.toFixed(1)}).`;
  if (diffGoals < 0) return `${teamBLabel} tuvo mejor diferencia de gol frente a este rival compartido (+${Math.abs(diffGoals).toFixed(1)}).`;
  return `${teamALabel} y ${teamBLabel} tuvieron un rendimiento similar frente a este rival compartido.`;
}

export function deriveCommonOpponents(
  teamAId: string,
  teamBId: string,
  histories: Record<string, TeamMatchRecord[]>,
  teamALabel = "El primer equipo",
  teamBLabel = "El segundo equipo"
): CommonOpponentsAnalysis {
  if (teamAId === teamBId) return emptyCommonOpponents();

  const aByOpponent = latestPerOpponent(histories[teamAId] ?? []);
  const bByOpponent = latestPerOpponent(histories[teamBId] ?? []);

  const sharedOpponentIds = [...aByOpponent.keys()].filter((id) => id !== teamAId && id !== teamBId && bByOpponent.has(id));

  const opponents: CommonOpponent[] = sharedOpponentIds.map((opponentId) => {
    const teamA = toCommonOpponentSide(aByOpponent.get(opponentId)!);
    const teamB = toCommonOpponentSide(bByOpponent.get(opponentId)!);
    const difference = {
      goals: round1(teamA.goalsFor - teamB.goalsFor),
      corners: round1((teamA.corners ?? 0) - (teamB.corners ?? 0)),
      shots: round1((teamA.shots ?? 0) - (teamB.shots ?? 0)),
      shotsOnTarget: round1((teamA.shotsOnTarget ?? 0) - (teamB.shotsOnTarget ?? 0)),
      possession: round1((teamA.possession ?? 0) - (teamB.possession ?? 0)),
    };
    return {
      opponentId,
      opponentName: formatOpponentName(opponentId),
      teamA,
      teamB,
      difference,
      conclusion: buildConclusion(difference.goals, teamALabel, teamBLabel),
    };
  });

  if (opponents.length === 0) return emptyCommonOpponents();

  const betterScore = opponents.reduce((acc, o) => acc + Math.sign(o.difference.goals), 0);

  return {
    opponents,
    summary: {
      betterTeamId: betterScore === 0 ? null : betterScore > 0 ? teamAId : teamBId,
      avgDifference: round1(mean(opponents.map((o) => o.difference.goals))),
      matchesCount: opponents.length,
      relevance: opponents.length >= 3 ? "alta" : opponents.length >= 1 ? "media" : "baja",
    },
  };
}

