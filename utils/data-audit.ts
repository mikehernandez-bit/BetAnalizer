import { getTeamMatchHistory } from "@/data/team-history";
import { getTeamById } from "@/data/teams";

export interface MatchDataAudit {
  isComplete: boolean;
  hasIncompleteData: boolean;
  missingMetrics: string[];
  incompleteTeamNames: string[];
  summaryText: string;
}

/**
 * Audita la cobertura de datos históricos para ambos equipos de un partido.
 * Retorna si existen faltantes en las métricas que aún alimentan decisiones:
 * goles por tiempo, córners y tarjetas. Los remates no forman parte del
 * modelo predictivo actual y no generan alertas de cobertura.
 */
export function checkMatchDataAudit(homeTeamId: string, awayTeamId: string, sampleSize: number = 15): MatchDataAudit {
  const home = getTeamById(homeTeamId);
  const away = getTeamById(awayTeamId);
  const homeRecords = getTeamMatchHistory(homeTeamId, sampleSize);
  const awayRecords = getTeamMatchHistory(awayTeamId, sampleSize);

  const incompleteTeams: string[] = [];
  const missingCategories = new Set<string>();

  // Auditoría equipo local
  if (homeRecords.length > 0) {
    const homeMissing1T = homeRecords.filter((r) => r.goalsForFirstHalf === undefined || r.goalsForSecondHalf === undefined).length;
    const homeMissingCorners = homeRecords.filter((r) => r.cornersFor === undefined).length;
    const homeMissingCards = homeRecords.filter((r) => r.yellowCards === undefined || r.yellowCardsAgainst === undefined).length;

    if (homeMissing1T > 0 || homeMissingCorners > 0 || homeMissingCards > 0) {
      if (home) incompleteTeams.push(home.shortName);
      if (homeMissing1T > 0) missingCategories.add("Goles 1T/2T");
      if (homeMissingCorners > 0) missingCategories.add("Córners");
      if (homeMissingCards > 0) missingCategories.add("Tarjetas (Evadir)");
    }
  }

  // Auditoría equipo visitante
  if (awayRecords.length > 0) {
    const awayMissing1T = awayRecords.filter((r) => r.goalsForFirstHalf === undefined || r.goalsForSecondHalf === undefined).length;
    const awayMissingCorners = awayRecords.filter((r) => r.cornersFor === undefined).length;
    const awayMissingCards = awayRecords.filter((r) => r.yellowCards === undefined || r.yellowCardsAgainst === undefined).length;

    if (awayMissing1T > 0 || awayMissingCorners > 0 || awayMissingCards > 0) {
      if (away && !incompleteTeams.includes(away.shortName)) incompleteTeams.push(away.shortName);
      if (awayMissing1T > 0) missingCategories.add("Goles 1T/2T");
      if (awayMissingCorners > 0) missingCategories.add("Córners");
      if (awayMissingCards > 0) missingCategories.add("Tarjetas (Evadir)");
    }
  }

  const missingMetrics = Array.from(missingCategories);
  const hasIncompleteData = incompleteTeams.length > 0;

  return {
    isComplete: !hasIncompleteData,
    hasIncompleteData,
    missingMetrics,
    incompleteTeamNames: incompleteTeams,
    summaryText: hasIncompleteData
      ? `Datos parciales (${missingMetrics.join(", ")}) en ${incompleteTeams.join(" y ")}`
      : "Datos 100% completos",
  };
}
