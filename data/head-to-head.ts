import { HeadToHead } from "@/types";
import { importedHistories } from "@/data/imported-data";
import { deriveHeadToHead } from "@/utils/matchups";

/**
 * Enfrentamientos directos reales, cargados a mano por pareja de equipos.
 * Si dos equipos nunca se cruzaron (o no se investigó su historial), se
 * devuelve una estructura vacía en vez de inventar partidos — la pestaña
 * "Enfrentamientos directos" ya maneja ese caso mostrando que no hay datos.
 */
const REAL_H2H: Record<string, HeadToHead> = {
  "ararat-armenia::nk-celje": {
    teamAId: "ararat-armenia",
    teamBId: "nk-celje",
    matches: [
      {
        matchId: "ararat-celje-2020-09-24",
        date: "2020-09-24",
        competitionId: "uefa-europa-league",
        homeTeamId: "ararat-armenia",
        awayTeamId: "nk-celje",
        // Ararat-Armenia ganó 1-0 después de la prórroga.
        homeGoals: 1,
        awayGoals: 0,
        homeCorners: 3,
        awayCorners: 5,
        homeShotsOnTarget: 1,
        awayShotsOnTarget: 2,
        cards: 7,
      },
    ],
    summary: {
      totalMatches: 1,
      teamAWins: 1,
      teamBWins: 0,
      draws: 0,
      avgGoals: 1,
      avgCorners: 8,
      bothScoredPct: 0,
      over25Pct: 0,
      dominantTeamId: "ararat-armenia",
    },
  },
  "atletico-mineiro::juventude": {
    teamAId: "atletico-mineiro",
    teamBId: "juventude",
    matches: [
      {
        matchId: "atletico-mineiro-juventude-2026-08-01",
        date: "2026-08-01",
        competitionId: "copa-do-brasil",
        homeTeamId: "atletico-mineiro",
        awayTeamId: "juventude",
        // Ida de los octavos de final de la Copa do Brasil 2026: 0-0 en la Arena MRV.
        homeGoals: 0,
        awayGoals: 0,
        homeCorners: 5,
        awayCorners: 4,
        homeShotsOnTarget: 3,
        awayShotsOnTarget: 2,
        cards: 4,
      },
    ],
    summary: {
      totalMatches: 1,
      teamAWins: 0,
      teamBWins: 0,
      draws: 1,
      avgGoals: 0,
      avgCorners: 9,
      bothScoredPct: 0,
      over25Pct: 0,
      dominantTeamId: null,
    },
  },
  // "mjallby-aif::slovan-bratislava" queda sin entrada a propósito: es su
  // primer cruce en competiciones europeas, no hay historial previo real.
};

function emptyH2H(teamAId: string, teamBId: string): HeadToHead {
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

/**
 * Prioriza un enfrentamiento directo cargado a mano en REAL_H2H (más
 * confiable: puede incluir cruces que no entran en la muestra de historial
 * reciente de ningún equipo). Si no hay una entrada manual, lo deriva de los
 * historiales ya importados: si el historial de un equipo trae un partido
 * cuyo opponentId es el id del otro equipo, ese registro es el cruce directo.
 */
export function getHeadToHead(teamAId: string, teamBId: string): HeadToHead {
  const key = [teamAId, teamBId].sort().join("::");
  const manual = REAL_H2H[key];
  if (manual) return manual;

  const derived = deriveHeadToHead(teamAId, teamBId, importedHistories);
  return derived.matches.length > 0 ? derived : emptyH2H(teamAId, teamBId);
}
