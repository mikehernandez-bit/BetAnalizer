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
  { id: "goals_home_over_05", category: "equipo_local", name: "Equipo local más de 0.5 goles (+0.5 Equipo 1)", description: "El equipo local anota al menos 1 gol.", side: "local" },
  { id: "goals_home_over_15", category: "equipo_local", name: "Equipo local más de 1.5 goles (+1.5 Equipo 1)", description: "El equipo local anota al menos 2 goles.", side: "local" },
  { id: "goals_home_under_05", category: "equipo_local", name: "Equipo local menos de 0.5 goles (-0.5 Equipo 1)", description: "El equipo local termina sin anotar goles.", side: "local" },
  { id: "goals_home_under_15", category: "equipo_local", name: "Equipo local menos de 1.5 goles (-1.5 Equipo 1)", description: "El equipo local anota 1 gol o ninguno.", side: "local" },
  { id: "goals_home_under_25", category: "equipo_local", name: "Equipo local menos de 2.5 goles (-2.5 Equipo 1)", description: "El equipo local anota 2 goles o menos.", side: "local" },
  { id: "goals_home_under_35", category: "equipo_local", name: "Equipo local menos de 3.5 goles (-3.5 Equipo 1)", description: "El equipo local anota 3 goles o menos.", side: "local" },

  { id: "away_team_scores", category: "equipo_visitante", name: "Equipo visitante marca", description: "El equipo visitante anota al menos un gol.", side: "visitante" },
  { id: "goals_away_over_05", category: "equipo_visitante", name: "Equipo visitante más de 0.5 goles (+0.5 Equipo 2)", description: "El equipo visitante anota al menos 1 gol.", side: "visitante" },
  { id: "goals_away_over_15", category: "equipo_visitante", name: "Equipo visitante más de 1.5 goles (+1.5 Equipo 2)", description: "El equipo visitante anota al menos 2 goles.", side: "visitante" },
  { id: "goals_away_under_05", category: "equipo_visitante", name: "Equipo visitante menos de 0.5 goles (-0.5 Equipo 2)", description: "El equipo visitante termina sin anotar goles.", side: "visitante" },
  { id: "goals_away_under_15", category: "equipo_visitante", name: "Equipo visitante menos de 1.5 goles (-1.5 Equipo 2)", description: "El equipo visitante anota 1 gol o ninguno.", side: "visitante" },
  { id: "goals_away_under_25", category: "equipo_visitante", name: "Equipo visitante menos de 2.5 goles (-2.5 Equipo 2)", description: "El equipo visitante anota 2 goles o menos.", side: "visitante" },
  { id: "goals_away_under_35", category: "equipo_visitante", name: "Equipo visitante menos de 3.5 goles (-3.5 Equipo 2)", description: "El equipo visitante anota 3 goles o menos.", side: "visitante" },

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

  { id: "corners_home_most", category: "corners", name: "Local gana en c\u00f3rners", description: "El equipo local termina con m\u00e1s c\u00f3rners que el visitante.", side: "local" },
  { id: "corners_away_most", category: "corners", name: "Visitante gana en c\u00f3rners", description: "El equipo visitante termina con m\u00e1s c\u00f3rners que el local.", side: "visitante" },
  { id: "corners_handicap_home_minus_15", category: "corners", name: "H\u00e1ndicap c\u00f3rners: Local -1.5", description: "El local debe ganar por dos o m\u00e1s c\u00f3rners.", side: "local" },
  { id: "corners_handicap_home_plus_15", category: "corners", name: "H\u00e1ndicap c\u00f3rners: Local +1.5", description: "El local no pierde por dos o m\u00e1s c\u00f3rners.", side: "local" },
  { id: "corners_handicap_away_minus_15", category: "corners", name: "H\u00e1ndicap c\u00f3rners: Visitante -1.5", description: "El visitante debe ganar por dos o m\u00e1s c\u00f3rners.", side: "visitante" },
  { id: "corners_handicap_away_plus_15", category: "corners", name: "H\u00e1ndicap c\u00f3rners: Visitante +1.5", description: "El visitante no pierde por dos o m\u00e1s c\u00f3rners.", side: "visitante" },


  // Resultado ----------------------------------------------------------------
  { id: "result_home_win", category: "resultado", name: "Victoria equipo local", description: "El equipo local gana el partido.", side: "local" },
  { id: "result_draw", category: "resultado", name: "Empate", description: "El partido termina igualado.", side: "partido" },
  { id: "result_away_win", category: "resultado", name: "Victoria equipo visitante", description: "El equipo visitante gana el partido.", side: "visitante" },
  { id: "result_dc_home", category: "resultado", name: "Doble oportunidad local (1X)", description: "El equipo local gana o empata el partido.", side: "local" },
  { id: "result_dc_away", category: "resultado", name: "Doble oportunidad visitante (X2)", description: "El equipo visitante gana o empata el partido.", side: "visitante" },
  { id: "goals_handicap_home_minus_05", category: "resultado", name: "H\u00e1ndicap goles: Local -0.5", description: "El equipo local debe ganar el partido.", side: "local" },
  { id: "goals_handicap_home_plus_05", category: "resultado", name: "H\u00e1ndicap goles: Local +0.5", description: "El equipo local gana o empata.", side: "local" },
  { id: "goals_handicap_home_minus_15", category: "resultado", name: "H\u00e1ndicap goles: Local -1.5", description: "El equipo local debe ganar por dos o m\u00e1s goles.", side: "local" },
  { id: "goals_handicap_home_plus_15", category: "resultado", name: "H\u00e1ndicap goles: Local +1.5", description: "El equipo local no pierde por dos o m\u00e1s goles.", side: "local" },
  { id: "goals_handicap_away_minus_05", category: "resultado", name: "H\u00e1ndicap goles: Visitante -0.5", description: "El equipo visitante debe ganar el partido.", side: "visitante" },
  { id: "goals_handicap_away_plus_05", category: "resultado", name: "H\u00e1ndicap goles: Visitante +0.5", description: "El equipo visitante gana o empata.", side: "visitante" },
  { id: "goals_handicap_away_minus_15", category: "resultado", name: "H\u00e1ndicap goles: Visitante -1.5", description: "El equipo visitante debe ganar por dos o m\u00e1s goles.", side: "visitante" },
  { id: "goals_handicap_away_plus_15", category: "resultado", name: "H\u00e1ndicap goles: Visitante +1.5", description: "El equipo visitante no pierde por dos o m\u00e1s goles.", side: "visitante" },

  // Primera parte --------------------------------------------------------
  { id: "first_half_win_home", category: "primera_parte", name: "Victoria local 1ª parte", description: "El equipo local gana el primer tiempo.", side: "local" },
  { id: "first_half_win_away", category: "primera_parte", name: "Victoria visitante 1ª parte", description: "El equipo visitante gana el primer tiempo.", side: "visitante" },
  { id: "first_half_dc_home", category: "primera_parte", name: "Doble oportunidad local 1ª parte (1X)", description: "El equipo local gana o empata el primer tiempo.", side: "local" },
  { id: "first_half_dc_away", category: "primera_parte", name: "Doble oportunidad visitante 1ª parte (X2)", description: "El equipo visitante gana o empata el primer tiempo.", side: "visitante" },
  { id: "first_half_over_05", category: "primera_parte", name: "Más de 0.5 goles 1ª parte", description: "Al menos un gol antes del descanso.", side: "partido" },
  { id: "first_half_home_over_05", category: "primera_parte", name: "Equipo local más de 0.5 goles 1ª parte (+0.5 Equipo 1 1ª parte)", description: "El equipo local anota al menos 1 gol en el primer tiempo.", side: "local" },
  { id: "first_half_away_over_05", category: "primera_parte", name: "Equipo visitante más de 0.5 goles 1ª parte (+0.5 Equipo 2 1ª parte)", description: "El equipo visitante anota al menos 1 gol en el primer tiempo.", side: "visitante" },
  { id: "first_half_over_15", category: "primera_parte", name: "Más de 1.5 goles 1ª parte", description: "Al menos dos goles antes del descanso.", side: "partido" },
  { id: "first_half_over_25", category: "primera_parte", name: "Más de 2.5 goles 1ª parte", description: "Al menos tres goles antes del descanso.", side: "partido" },
  { id: "first_half_over_35", category: "primera_parte", name: "Más de 3.5 goles 1ª parte", description: "Al menos cuatro goles antes del descanso.", side: "partido" },
  { id: "first_half_under_25", category: "primera_parte", name: "Menos de 2.5 goles 1ª parte", description: "Como máximo dos goles antes del descanso.", side: "partido" },
  { id: "first_half_under_35", category: "primera_parte", name: "Menos de 3.5 goles 1ª parte", description: "Como máximo tres goles antes del descanso.", side: "partido" },
  { id: "first_half_btts", category: "primera_parte", name: "Ambos marcan en la 1ª parte", description: "Los dos equipos anotan antes del descanso.", side: "ambos" },

  // Segunda parte --------------------------------------------------------
  { id: "second_half_win_home", category: "segunda_parte", name: "Victoria local 2ª parte", description: "El equipo local gana el segundo tiempo.", side: "local" },
  { id: "second_half_win_away", category: "segunda_parte", name: "Victoria visitante 2ª parte", description: "El equipo visitante gana el segundo tiempo.", side: "visitante" },
  { id: "second_half_dc_home", category: "segunda_parte", name: "Doble oportunidad local 2ª parte (1X)", description: "El equipo local gana o empata el segundo tiempo.", side: "local" },
  { id: "second_half_dc_away", category: "segunda_parte", name: "Doble oportunidad visitante 2ª parte (X2)", description: "El equipo visitante gana o empata el segundo tiempo.", side: "visitante" },
  { id: "second_half_over_05", category: "segunda_parte", name: "Más de 0.5 goles 2ª parte", description: "Al menos un gol en el segundo tiempo.", side: "partido" },
  { id: "second_half_home_over_05", category: "segunda_parte", name: "Equipo local más de 0.5 goles 2ª parte (+0.5 Equipo 1 2ª parte)", description: "El equipo local anota al menos 1 gol en el segundo tiempo.", side: "local" },
  { id: "second_half_away_over_05", category: "segunda_parte", name: "Equipo visitante más de 0.5 goles 2ª parte (+0.5 Equipo 2 2ª parte)", description: "El equipo visitante anota al menos 1 gol en el segundo tiempo.", side: "visitante" },
  { id: "second_half_over_15", category: "segunda_parte", name: "Más de 1.5 goles 2ª parte", description: "Al menos dos goles en el segundo tiempo.", side: "partido" },
  { id: "second_half_over_25", category: "segunda_parte", name: "Más de 2.5 goles 2ª parte", description: "Al menos tres goles en el segundo tiempo.", side: "partido" },
  { id: "second_half_over_35", category: "segunda_parte", name: "Más de 3.5 goles 2ª parte", description: "Al menos cuatro goles en el segundo tiempo.", side: "partido" },
  { id: "second_half_under_25", category: "segunda_parte", name: "Menos de 2.5 goles 2ª parte", description: "Como máximo dos goles en el segundo tiempo.", side: "partido" },
  { id: "second_half_under_35", category: "segunda_parte", name: "Menos de 3.5 goles 2ª parte", description: "Como máximo tres goles en el segundo tiempo.", side: "partido" },
  { id: "second_half_btts", category: "segunda_parte", name: "Ambos marcan en la 2ª parte", description: "Los dos equipos anotan en el segundo tiempo.", side: "ambos" },

  // Tarjetas ----------------------------------------------------------------
  { id: "cards_home_over_05", category: "tarjetas", name: "Equipo local más de 0.5 tarjetas amarillas", description: "El equipo local recibe 1 o más tarjetas amarillas.", side: "local" },
  { id: "cards_home_over_15", category: "tarjetas", name: "Equipo local más de 1.5 tarjetas amarillas", description: "El equipo local recibe 2 o más tarjetas amarillas.", side: "local" },
  { id: "cards_home_over_25", category: "tarjetas", name: "Equipo local más de 2.5 tarjetas amarillas", description: "El equipo local recibe 3 o más tarjetas amarillas.", side: "local" },
  { id: "cards_away_over_05", category: "tarjetas", name: "Equipo visitante más de 0.5 tarjetas amarillas", description: "El equipo visitante recibe 1 o más tarjetas amarillas.", side: "visitante" },
  { id: "cards_away_over_15", category: "tarjetas", name: "Equipo visitante más de 1.5 tarjetas amarillas", description: "El equipo visitante recibe 2 o más tarjetas amarillas.", side: "visitante" },
  { id: "cards_away_over_25", category: "tarjetas", name: "Equipo visitante más de 2.5 tarjetas amarillas", description: "El equipo visitante recibe 3 o más tarjetas amarillas.", side: "visitante" },
  { id: "cards_btts", category: "tarjetas", name: "Ambos equipos reciben tarjeta amarillas", description: "Tanto el equipo local como el visitante reciben al menos una tarjeta amarilla en el partido.", side: "ambos" },
  {
    id: "cards_total_over_15",
    category: "tarjetas",
    name: "Más de 1.5 tarjetas amarillas totales",
    description: "Suma de tarjetas amarillas de ambos equipos superior a 1.5. Requiere partidos históricos con las tarjetas del rival confirmadas.",
    side: "partido",
  },
  {
    id: "cards_total_over_25",
    category: "tarjetas",
    name: "Más de 2.5 tarjetas amarillas totales",
    description: "Suma de tarjetas amarillas de ambos equipos superior a 2.5. Requiere partidos históricos con las tarjetas del rival confirmadas.",
    side: "partido",
  },
  {
    id: "cards_total_over_35",
    category: "tarjetas",
    name: "Más de 3.5 tarjetas amarillas totales",
    description: "Suma de tarjetas amarillas de ambos equipos superior a 3.5. Requiere partidos históricos con las tarjetas del rival confirmadas.",
    side: "partido",
  },
  {
    id: "cards_total_over_45",
    category: "tarjetas",
    name: "Más de 4.5 tarjetas amarillas totales",
    description: "Suma de tarjetas amarillas de ambos equipos superior a 4.5. Requiere partidos históricos con las tarjetas del rival confirmadas.",
    side: "partido",
  },
  { id: "red_card_shown", category: "tarjetas", name: "Hay tarjeta roja en el partido", description: "Al menos un jugador (de cualquiera de los dos equipos) ve la tarjeta roja.", side: "partido" },
];

// Las etiquetas de los mercados nuevos usan escapes Unicode para conservar
// correctamente los acentos al compilar y mostrarlos en el navegador.
const HALF_MARKET_TEXT: Record<string, Pick<BettingMarket, "name" | "description">> = {
  first_half_win_home: { name: "Victoria local 1\u00aa parte", description: "El equipo local gana el primer tiempo." },
  first_half_win_away: { name: "Victoria visitante 1\u00aa parte", description: "El equipo visitante gana el primer tiempo." },
  first_half_dc_home: { name: "Doble oportunidad local 1\u00aa parte (1X)", description: "El equipo local gana o empata el primer tiempo." },
  first_half_dc_away: { name: "Doble oportunidad visitante 1\u00aa parte (X2)", description: "El equipo visitante gana o empata el primer tiempo." },
  first_half_over_05: { name: "M\u00e1s de 0.5 goles 1\u00aa parte", description: "Al menos un gol antes del descanso." },
  first_half_home_over_05: { name: "Equipo local m\u00e1s de 0.5 goles 1\u00aa parte (+0.5 Equipo 1 1\u00aa parte)", description: "El equipo local anota al menos 1 gol antes del descanso." },
  first_half_away_over_05: { name: "Equipo visitante m\u00e1s de 0.5 goles 1\u00aa parte (+0.5 Equipo 2 1\u00aa parte)", description: "El equipo visitante anota al menos 1 gol antes del descanso." },
  first_half_over_15: { name: "M\u00e1s de 1.5 goles 1\u00aa parte", description: "Al menos dos goles antes del descanso." },
  first_half_over_25: { name: "M\u00e1s de 2.5 goles 1\u00aa parte", description: "Al menos tres goles antes del descanso." },
  first_half_over_35: { name: "M\u00e1s de 3.5 goles 1\u00aa parte", description: "Al menos cuatro goles antes del descanso." },
  first_half_under_25: { name: "Menos de 2.5 goles 1\u00aa parte", description: "Como m\u00e1ximo dos goles antes del descanso." },
  first_half_under_35: { name: "Menos de 3.5 goles 1\u00aa parte", description: "Como m\u00e1ximo tres goles antes del descanso." },
  second_half_win_home: { name: "Victoria local 2\u00aa parte", description: "El equipo local gana el segundo tiempo." },
  second_half_win_away: { name: "Victoria visitante 2\u00aa parte", description: "El equipo visitante gana el segundo tiempo." },
  second_half_dc_home: { name: "Doble oportunidad local 2\u00aa parte (1X)", description: "El equipo local gana o empata el segundo tiempo." },
  second_half_dc_away: { name: "Doble oportunidad visitante 2\u00aa parte (X2)", description: "El equipo visitante gana o empata el segundo tiempo." },
  second_half_over_05: { name: "M\u00e1s de 0.5 goles 2\u00aa parte", description: "Al menos un gol en el segundo tiempo." },
  second_half_home_over_05: { name: "Equipo local m\u00e1s de 0.5 goles 2\u00aa parte (+0.5 Equipo 1 2\u00aa parte)", description: "El equipo local anota al menos 1 gol en el segundo tiempo." },
  second_half_away_over_05: { name: "Equipo visitante m\u00e1s de 0.5 goles 2\u00aa parte (+0.5 Equipo 2 2\u00aa parte)", description: "El equipo visitante anota al menos 1 gol en el segundo tiempo." },
  second_half_over_15: { name: "M\u00e1s de 1.5 goles 2\u00aa parte", description: "Al menos dos goles en el segundo tiempo." },
  second_half_over_25: { name: "M\u00e1s de 2.5 goles 2\u00aa parte", description: "Al menos tres goles en el segundo tiempo." },
  second_half_over_35: { name: "M\u00e1s de 3.5 goles 2\u00aa parte", description: "Al menos cuatro goles en el segundo tiempo." },
  second_half_under_25: { name: "Menos de 2.5 goles 2\u00aa parte", description: "Como m\u00e1ximo dos goles en el segundo tiempo." },
  second_half_under_35: { name: "Menos de 3.5 goles 2\u00aa parte", description: "Como m\u00e1ximo tres goles en el segundo tiempo." },
};

bettingMarkets.forEach((market) => {
  const text = HALF_MARKET_TEXT[market.id];
  if (text) Object.assign(market, text);
});

export function getMarketById(id: string): BettingMarket | undefined {
  return bettingMarkets.find((m) => m.id === id);
}

export function getMarketsByCategory(category: string): BettingMarket[] {
  return bettingMarkets.filter((m) => m.category === category);
}

export const MARKET_CATEGORY_LABELS: Record<string, string> = {
  goles: "Goles",
  corners: "Córners",
  tarjetas: "Tarjetas",
  resultado: "Resultado",
  ambos_marcan: "Ambos equipos marcan",
  primera_parte: "Primera parte",
  segunda_parte: "Segunda parte",
  equipo_local: "Equipo local",
  equipo_visitante: "Equipo visitante",
};
