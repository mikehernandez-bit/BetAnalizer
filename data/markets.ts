import { BettingMarket } from "@/types";

export const bettingMarkets: BettingMarket[] = [
  // Goles ------------------------------------------------------------------
  { id: "goals_over_05", category: "goles", name: "Más de 0.5 goles", description: "Al menos un gol en el partido.", side: "partido" },
  { id: "goals_over_15", category: "goles", name: "Más de 1.5 goles", description: "Al menos dos goles en el partido.", side: "partido" },
  { id: "goals_over_25", category: "goles", name: "Más de 2.5 goles", description: "Al menos tres goles en el partido.", side: "partido" },
  { id: "goals_over_35", category: "goles", name: "Más de 3.5 goles", description: "Al menos cuatro goles en el partido.", side: "partido" },
  { id: "goals_under_25", category: "goles", name: "Menos de 2.5 goles", description: "Dos goles o menos en el partido.", side: "partido" },
  { id: "goals_under_35", category: "goles", name: "Menos de 3.5 goles", description: "Tres goles o menos en el partido.", side: "partido" },
  { id: "btts_yes", category: "ambos_marcan", name: "Ambos equipos marcan", description: "Los dos equipos anotan al menos un gol.", side: "ambos" },
  { id: "btts_no", category: "ambos_marcan", name: "Ambos equipos no marcan", description: "Al menos un equipo termina sin anotar.", side: "ambos" },
  { id: "home_team_scores", category: "equipo_local", name: "Equipo local marca", description: "El equipo local anota al menos un gol.", side: "local" },
  { id: "away_team_scores", category: "equipo_visitante", name: "Equipo visitante marca", description: "El equipo visitante anota al menos un gol.", side: "visitante" },

  // Córners ------------------------------------------------------------------
  { id: "corners_over_65", category: "corners", name: "Más de 6.5 córners", description: "Total de córners del partido superior a 6.5.", side: "partido" },
  { id: "corners_over_75", category: "corners", name: "Más de 7.5 córners", description: "Total de córners del partido superior a 7.5.", side: "partido" },
  { id: "corners_over_85", category: "corners", name: "Más de 8.5 córners", description: "Total de córners del partido superior a 8.5.", side: "partido" },
  { id: "corners_over_95", category: "corners", name: "Más de 9.5 córners", description: "Total de córners del partido superior a 9.5.", side: "partido" },
  { id: "corners_over_105", category: "corners", name: "Más de 10.5 córners", description: "Total de córners del partido superior a 10.5.", side: "partido" },
  { id: "corners_over_115", category: "corners", name: "Más de 11.5 córners", description: "Total de córners del partido superior a 11.5.", side: "partido" },
  { id: "corners_under_65", category: "corners", name: "Menos de 6.5 córners", description: "Total de córners del partido inferior a 6.5.", side: "partido" },
  { id: "corners_under_75", category: "corners", name: "Menos de 7.5 córners", description: "Total de córners del partido inferior a 7.5.", side: "partido" },
  { id: "corners_under_85", category: "corners", name: "Menos de 8.5 córners", description: "Total de córners del partido inferior a 8.5.", side: "partido" },
  { id: "corners_under_95", category: "corners", name: "Menos de 9.5 córners", description: "Total de córners del partido inferior a 9.5.", side: "partido" },
  { id: "corners_under_105", category: "corners", name: "Menos de 10.5 córners", description: "Total de córners del partido inferior a 10.5.", side: "partido" },
  { id: "corners_under_115", category: "corners", name: "Menos de 11.5 córners", description: "Total de córners del partido inferior a 11.5.", side: "partido" },
  { id: "corners_home_over_35", category: "corners", name: "Equipo local más de 3.5 córners", description: "El equipo local supera los 3.5 córners.", side: "local" },
  { id: "corners_home_over_45", category: "corners", name: "Equipo local más de 4.5 córners", description: "El equipo local supera los 4.5 córners.", side: "local" },
  { id: "corners_away_over_35", category: "corners", name: "Equipo visitante más de 3.5 córners", description: "El equipo visitante supera los 3.5 córners.", side: "visitante" },
  { id: "corners_away_over_45", category: "corners", name: "Equipo visitante más de 4.5 córners", description: "El equipo visitante supera los 4.5 córners.", side: "visitante" },
  { id: "corners_most_team", category: "corners", name: "Equipo con más córners", description: "Equipo que termina con más córners a favor.", side: "partido" },

  // Tiros al arco --------------------------------------------------------
  { id: "sot_home_over_25", category: "tiros_arco", name: "Equipo local más de 2.5 tiros al arco", description: "El equipo local supera los 2.5 tiros al arco.", side: "local" },
  { id: "sot_home_over_35", category: "tiros_arco", name: "Equipo local más de 3.5 tiros al arco", description: "El equipo local supera los 3.5 tiros al arco.", side: "local" },
  { id: "sot_home_over_45", category: "tiros_arco", name: "Equipo local más de 4.5 tiros al arco", description: "El equipo local supera los 4.5 tiros al arco.", side: "local" },
  { id: "sot_away_over_25", category: "tiros_arco", name: "Equipo visitante más de 2.5 tiros al arco", description: "El equipo visitante supera los 2.5 tiros al arco.", side: "visitante" },
  { id: "sot_away_over_35", category: "tiros_arco", name: "Equipo visitante más de 3.5 tiros al arco", description: "El equipo visitante supera los 3.5 tiros al arco.", side: "visitante" },
  { id: "sot_total_over_75", category: "tiros_arco", name: "Más de 7.5 tiros al arco totales", description: "Suma de tiros al arco de ambos equipos superior a 7.5.", side: "partido" },
  { id: "sot_total_over_85", category: "tiros_arco", name: "Más de 8.5 tiros al arco totales", description: "Suma de tiros al arco de ambos equipos superior a 8.5.", side: "partido" },

  // Remates ----------------------------------------------------------------
  { id: "shots_home_over_85", category: "remates", name: "Equipo local más de 8.5 remates", description: "El equipo local supera los 8.5 remates totales.", side: "local" },
  { id: "shots_home_over_105", category: "remates", name: "Equipo local más de 10.5 remates", description: "El equipo local supera los 10.5 remates totales.", side: "local" },
  { id: "shots_away_over_85", category: "remates", name: "Equipo visitante más de 8.5 remates", description: "El equipo visitante supera los 8.5 remates totales.", side: "visitante" },
  { id: "shots_total_over_195", category: "remates", name: "Más de 19.5 remates", description: "Suma de remates de ambos equipos superior a 19.5.", side: "partido" },
  { id: "shots_total_over_215", category: "remates", name: "Más de 21.5 remates", description: "Suma de remates de ambos equipos superior a 21.5.", side: "partido" },
  { id: "shots_total_over_235", category: "remates", name: "Más de 23.5 remates", description: "Suma de remates de ambos equipos superior a 23.5.", side: "partido" },

  // Resultado ----------------------------------------------------------------
  { id: "result_home_win", category: "resultado", name: "Victoria equipo local", description: "El equipo local gana el partido.", side: "local" },
  { id: "result_draw", category: "resultado", name: "Empate", description: "El partido termina igualado.", side: "partido" },
  { id: "result_away_win", category: "resultado", name: "Victoria equipo visitante", description: "El equipo visitante gana el partido.", side: "visitante" },

  // Primera parte --------------------------------------------------------
  { id: "first_half_over_05", category: "primera_parte", name: "Más de 0.5 goles 1ª parte", description: "Al menos un gol antes del descanso.", side: "partido" },
  { id: "first_half_btts", category: "primera_parte", name: "Ambos marcan en la 1ª parte", description: "Los dos equipos anotan antes del descanso.", side: "ambos" },
];

export function getMarketById(id: string): BettingMarket | undefined {
  return bettingMarkets.find((m) => m.id === id);
}

export function getMarketsByCategory(category: string): BettingMarket[] {
  return bettingMarkets.filter((m) => m.category === category);
}

export const MARKET_CATEGORY_LABELS: Record<string, string> = {
  goles: "Goles",
  corners: "Córners",
  tiros_arco: "Tiros al arco",
  remates: "Remates",
  tarjetas: "Tarjetas",
  resultado: "Resultado",
  ambos_marcan: "Ambos equipos marcan",
  primera_parte: "Primera parte",
  equipo_local: "Equipo local",
  equipo_visitante: "Equipo visitante",
};
