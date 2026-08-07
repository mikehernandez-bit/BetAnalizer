import { CommonOpponentsAnalysis } from "@/types";
import { importedHistories } from "@/data/imported-data";
import { getTeamById } from "@/data/teams";
import { deriveCommonOpponents } from "@/utils/matchups";

/**
 * Rivales en común reales, cargados a mano por pareja de equipos cuando se
 * investigan y confirman. Si no hay datos cargados para una pareja, se
 * devuelve una estructura vacía en vez de inventar rivales — la pestaña
 * "Rivales en común" ya maneja ese caso mostrando que no hay coincidencias.
 */
const REAL_COMMON_OPPONENTS: Record<string, CommonOpponentsAnalysis> = {};

function emptyCommonOpponents(): CommonOpponentsAnalysis {
  return {
    opponents: [],
    summary: {
      betterTeamId: null,
      avgDifference: 0,
      matchesCount: 0,
      relevance: "baja",
    },
  };
}

/**
 * Prioriza rivales en común cargados a mano en REAL_COMMON_OPPONENTS. Si no
 * hay una entrada manual, los deriva de los historiales ya importados:
 * cuando ambos equipos enfrentaron alguna vez al mismo opponentId, se
 * compara el resultado más reciente de cada uno contra ese rival.
 */
export function getCommonOpponents(teamAId: string, teamBId: string): CommonOpponentsAnalysis {
  const key = [teamAId, teamBId].sort().join("::");
  const manual = REAL_COMMON_OPPONENTS[key];
  if (manual) return manual;

  const teamALabel = getTeamById(teamAId)?.shortName ?? "El primer equipo";
  const teamBLabel = getTeamById(teamBId)?.shortName ?? "El segundo equipo";
  const derived = deriveCommonOpponents(teamAId, teamBId, importedHistories, teamALabel, teamBLabel);
  return derived.opponents.length > 0 ? derived : emptyCommonOpponents();
}
