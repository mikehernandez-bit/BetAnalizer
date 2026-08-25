import type { TeamMatchRecord } from "@/types";

export interface FiveParametersResult {
  param1HomeVenue: { hits: number; total: number; pct: number; label: string };
  param2AwayVenue: { hits: number; total: number; pct: number; label: string };
  param3HomeTotal: { hits: number; total: number; pct: number; label: string };
  param4AwayTotal: { hits: number; total: number; pct: number; label: string };
  param5H2HOrCommon: { hits?: number; total?: number; pct?: number; text: string; label: string; hasData: boolean };
}

/**
 * Devuelve una función predicado para un mercado específico dada una fila de partido.
 */
export function getMarketPredicate(marketId: string): {
  homePredicate: (r: TeamMatchRecord) => boolean;
  awayPredicate: (r: TeamMatchRecord) => boolean;
  isSideSpecific?: "home" | "away";
} {
  // Goles Totales
  if (marketId === "goals_over_05") {
    return { homePredicate: (r) => r.goalsFor + r.goalsAgainst > 0.5, awayPredicate: (r) => r.goalsFor + r.goalsAgainst > 0.5 };
  }
  if (marketId === "goals_over_15") {
    return { homePredicate: (r) => r.goalsFor + r.goalsAgainst > 1.5, awayPredicate: (r) => r.goalsFor + r.goalsAgainst > 1.5 };
  }
  if (marketId === "goals_over_25") {
    return { homePredicate: (r) => r.goalsFor + r.goalsAgainst > 2.5, awayPredicate: (r) => r.goalsFor + r.goalsAgainst > 2.5 };
  }
  if (marketId === "goals_over_35") {
    return { homePredicate: (r) => r.goalsFor + r.goalsAgainst > 3.5, awayPredicate: (r) => r.goalsFor + r.goalsAgainst > 3.5 };
  }
  if (marketId === "goals_under_15") {
    return { homePredicate: (r) => r.goalsFor + r.goalsAgainst < 1.5, awayPredicate: (r) => r.goalsFor + r.goalsAgainst < 1.5 };
  }
  if (marketId === "goals_under_25") {
    return { homePredicate: (r) => r.goalsFor + r.goalsAgainst < 2.5, awayPredicate: (r) => r.goalsFor + r.goalsAgainst < 2.5 };
  }
  if (marketId === "goals_under_35") {
    return { homePredicate: (r) => r.goalsFor + r.goalsAgainst < 3.5, awayPredicate: (r) => r.goalsFor + r.goalsAgainst < 3.5 };
  }

  // 1T Goles
  if (marketId === "ht_goals_over_05" || marketId === "goals_1h_over_05") {
    return {
      homePredicate: (r) => (r.goalsForFirstHalf ?? 0) + (r.goalsAgainstFirstHalf ?? 0) > 0.5,
      awayPredicate: (r) => (r.goalsForFirstHalf ?? 0) + (r.goalsAgainstFirstHalf ?? 0) > 0.5,
    };
  }
  if (marketId === "ht_goals_under_15" || marketId === "goals_1h_under_15") {
    return {
      homePredicate: (r) => (r.goalsForFirstHalf ?? 0) + (r.goalsAgainstFirstHalf ?? 0) < 1.5,
      awayPredicate: (r) => (r.goalsForFirstHalf ?? 0) + (r.goalsAgainstFirstHalf ?? 0) < 1.5,
    };
  }

  // Ambos Marcan (BTTS)
  if (marketId === "btts_yes") {
    return { homePredicate: (r) => r.goalsFor >= 1 && r.goalsAgainst >= 1, awayPredicate: (r) => r.goalsFor >= 1 && r.goalsAgainst >= 1 };
  }
  if (marketId === "btts_no") {
    return { homePredicate: (r) => r.goalsFor === 0 || r.goalsAgainst === 0, awayPredicate: (r) => r.goalsFor === 0 || r.goalsAgainst === 0 };
  }

  // Córners Totales
  if (marketId === "corners_over_75") {
    return { homePredicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > 7.5, awayPredicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > 7.5 };
  }
  if (marketId === "corners_over_85") {
    return { homePredicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > 8.5, awayPredicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > 8.5 };
  }
  if (marketId === "corners_over_95") {
    return { homePredicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > 9.5, awayPredicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > 9.5 };
  }
  if (marketId === "corners_over_105") {
    return { homePredicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > 10.5, awayPredicate: (r) => (r.cornersFor ?? 0) + (r.cornersAgainst ?? 0) > 10.5 };
  }

  // Tarjetas Totales
  if (marketId.includes("cards_over") || marketId.includes("tarjetas_over")) {
    const threshold = parseFloat(marketId.replace(/[^0-9.]/g, "")) || 3.5;
    const pred = (r: TeamMatchRecord) => (r.yellowCards ?? 0) + (r.redCards ?? 0) > threshold;
    return { homePredicate: pred, awayPredicate: pred };
  }
  if (marketId.includes("cards_under") || marketId.includes("tarjetas_under")) {
    const threshold = parseFloat(marketId.replace(/[^0-9.]/g, "")) || 5.5;
    const pred = (r: TeamMatchRecord) => (r.yellowCards ?? 0) + (r.redCards ?? 0) < threshold;
    return { homePredicate: pred, awayPredicate: pred };
  }

  // Mercados de Local (Equipo 1)
  if (marketId === "home_team_scores" || marketId === "goals_home_over_05") {
    return { homePredicate: (r) => r.goalsFor >= 1, awayPredicate: (r) => r.goalsAgainst >= 1, isSideSpecific: "home" };
  }
  if (marketId === "goals_home_over_15") {
    return { homePredicate: (r) => r.goalsFor > 1.5, awayPredicate: (r) => r.goalsAgainst > 1.5, isSideSpecific: "home" };
  }
  if (marketId === "corners_home_over_45") {
    return { homePredicate: (r) => (r.cornersFor ?? 0) > 4.5, awayPredicate: (r) => (r.cornersAgainst ?? 0) > 4.5, isSideSpecific: "home" };
  }
  if (marketId === "corners_home_over_55") {
    return { homePredicate: (r) => (r.cornersFor ?? 0) > 5.5, awayPredicate: (r) => (r.cornersAgainst ?? 0) > 5.5, isSideSpecific: "home" };
  }

  // Mercados de Visitante (Equipo 2)
  if (marketId === "away_team_scores" || marketId === "goals_away_over_05") {
    return { homePredicate: (r) => r.goalsAgainst >= 1, awayPredicate: (r) => r.goalsFor >= 1, isSideSpecific: "away" };
  }
  if (marketId === "goals_away_over_15") {
    return { homePredicate: (r) => r.goalsAgainst > 1.5, awayPredicate: (r) => r.goalsFor > 1.5, isSideSpecific: "away" };
  }
  if (marketId === "corners_away_over_35") {
    return { homePredicate: (r) => (r.cornersAgainst ?? 0) > 3.5, awayPredicate: (r) => (r.cornersFor ?? 0) > 3.5, isSideSpecific: "away" };
  }
  if (marketId === "corners_away_over_45") {
    return { homePredicate: (r) => (r.cornersAgainst ?? 0) > 4.5, awayPredicate: (r) => (r.cornersFor ?? 0) > 4.5, isSideSpecific: "away" };
  }

  // Resultado 1X2 y Doble Oportunidad
  if (marketId === "home_win" || marketId === "match_result_home") {
    return { homePredicate: (r) => r.result === "W", awayPredicate: (r) => r.result === "L", isSideSpecific: "home" };
  }
  if (marketId === "draw" || marketId === "match_result_draw") {
    return { homePredicate: (r) => r.result === "D", awayPredicate: (r) => r.result === "D" };
  }
  if (marketId === "away_win" || marketId === "match_result_away") {
    return { homePredicate: (r) => r.result === "L", awayPredicate: (r) => r.result === "W", isSideSpecific: "away" };
  }
  if (marketId === "double_chance_1x") {
    return { homePredicate: (r) => r.result === "W" || r.result === "D", awayPredicate: (r) => r.result === "L" || r.result === "D" };
  }
  if (marketId === "double_chance_x2") {
    return { homePredicate: (r) => r.result === "L" || r.result === "D", awayPredicate: (r) => r.result === "W" || r.result === "D" };
  }
  if (marketId === "double_chance_12") {
    return { homePredicate: (r) => r.result === "W" || r.result === "L", awayPredicate: (r) => r.result === "W" || r.result === "L" };
  }

  // Predicado por defecto (Goles > 0.5)
  const defaultPred = (r: TeamMatchRecord) => r.goalsFor + r.goalsAgainst > 0.5;
  return { homePredicate: defaultPred, awayPredicate: defaultPred };
}

/**
 * Calcula el desglose exacto de los 5 parámetros requeridos por el usuario.
 */
export function computeFiveParameters(
  marketId: string,
  homeRecords: TeamMatchRecord[],
  awayRecords: TeamMatchRecord[],
  homeTeamName = "Local",
  awayTeamName = "Visitante"
): FiveParametersResult {
  const { homePredicate, awayPredicate } = getMarketPredicate(marketId);

  // 1. Historial Local Equipo 1 (solo partidos de local)
  const homeVenueRecords = homeRecords.filter((r) => r.venue === "local");
  const homeVenueHits = homeVenueRecords.filter(homePredicate).length;
  const homeVenueTotal = homeVenueRecords.length || 1;
  const homeVenuePct = Math.round((homeVenueHits / homeVenueTotal) * 100);

  // 2. Historial Visitante Equipo 2 (solo partidos de visitante)
  const awayVenueRecords = awayRecords.filter((r) => r.venue === "visitante");
  const awayVenueHits = awayVenueRecords.filter(awayPredicate).length;
  const awayVenueTotal = awayVenueRecords.length || 1;
  const awayVenuePct = Math.round((awayVenueHits / awayVenueTotal) * 100);

  // 3. Historial Total Equipo 1 (los 15 partidos)
  const homeTotalHits = homeRecords.filter(homePredicate).length;
  const homeTotalCount = homeRecords.length || 1;
  const homeTotalPct = Math.round((homeTotalHits / homeTotalCount) * 100);

  // 4. Historial Total Equipo 2 (los 15 partidos)
  const awayTotalHits = awayRecords.filter(awayPredicate).length;
  const awayTotalCount = awayRecords.length || 1;
  const awayTotalPct = Math.round((awayTotalHits / awayTotalCount) * 100);

  // 5. Enfrentamiento Directo / Rivales en Común
  // Revisamos si hay partidos H2H en los historiales
  const h2hMatches = homeRecords.filter((r) => awayRecords.some((ar) => ar.date === r.date));
  let param5: FiveParametersResult["param5H2HOrCommon"];

  if (h2hMatches.length > 0) {
    const hits = h2hMatches.filter(homePredicate).length;
    const total = h2hMatches.length;
    const pct = Math.round((hits / total) * 100);
    param5 = {
      hits,
      total,
      pct,
      text: `${hits}/${total} cumplimiento directo (${pct}%)`,
      label: `⚔️ H2H Directo (${total} partido${total > 1 ? "s" : ""})`,
      hasData: true,
    };
  } else {
    // Buscar rivales en común entre ambos historiales
    const homeOpponents = new Set(homeRecords.map((r) => r.opponentId));
    const sharedOpponents = awayRecords.filter((r) => homeOpponents.has(r.opponentId));

    if (sharedOpponents.length > 0) {
      const hits = sharedOpponents.filter(awayPredicate).length;
      const total = sharedOpponents.length;
      const pct = Math.round((hits / total) * 100);
      param5 = {
        hits,
        total,
        pct,
        text: `${hits}/${total} partidos vs rivales compartidos (${pct}%)`,
        label: `👥 Rivales Comunes (${total})`,
        hasData: true,
      };
    } else {
      param5 = {
        text: "Sin antecedentes directos en la muestra",
        label: "⚔️ H2H / Comunes",
        hasData: false,
      };
    }
  }

  return {
    param1HomeVenue: {
      hits: homeVenueHits,
      total: homeVenueTotal,
      pct: homeVenuePct,
      label: `🏠 ${homeTeamName} en casa`,
    },
    param2AwayVenue: {
      hits: awayVenueHits,
      total: awayVenueTotal,
      pct: awayVenuePct,
      label: `✈️ ${awayTeamName} fuera`,
    },
    param3HomeTotal: {
      hits: homeTotalHits,
      total: homeTotalCount,
      pct: homeTotalPct,
      label: `📊 ${homeTeamName} Total`,
    },
    param4AwayTotal: {
      hits: awayTotalHits,
      total: awayTotalCount,
      pct: awayTotalPct,
      label: `📊 ${awayTeamName} Total`,
    },
    param5H2HOrCommon: param5,
  };
}
