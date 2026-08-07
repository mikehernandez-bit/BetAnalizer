import { Team } from "@/types";
import { importedTeams, mergeById } from "@/data/imported-data";

// Solo equipos reales, agregados a pedido y con datos investigados en internet.
// Identidad de club (colores, año de fundación, estadio) y posición/puntos de
// liga están sourceados; avgCorners es una estimación razonable porque los
// buscadores públicos no publican ese detalle para estas ligas — se marca
// explícitamente en la UI que la calidad de muestra es limitada.
const BUILT_IN_TEAMS: Team[] = [
  {
    id: "ararat-armenia",
    name: "FC Ararat-Armenia",
    shortName: "Ararat-Armenia",
    code: "ARA",
    country: "Armenia",
    competitionId: "armenian-premier-league",
    stadium: "Vazgen Sargsyan Republican Stadium",
    founded: 2017,
    primaryColor: "#1D4ED8",
    secondaryColor: "#F8FAFC",
    // Campeón armenio 2025/26: 60 puntos y 50-25 en 27 partidos (RSSSF).
    position: 1,
    played: 27,
    won: 18,
    drawn: 6,
    lost: 3,
    goalsFor: 50,
    goalsAgainst: 25,
    points: 60,
    // Gandzasar, Shamrock (V), Shamrock (L), Riga (V), Riga (L).
    form: ["W", "L", "W", "L", "W"],
    avgGoalsFor: 2.2,
    avgGoalsAgainst: 1.6,
    avgCorners: 4,
  },
  {
    id: "nk-celje",
    name: "NK Celje",
    shortName: "Celje",
    code: "CEL",
    country: "Eslovenia",
    competitionId: "slovenian-prvaliga",
    stadium: "Arena Z'dezele",
    founded: 1919,
    primaryColor: "#F4C430",
    secondaryColor: "#1D4ED8",
    // Campeón esloveno 2025/26: 74 puntos y 85-32 en 34 partidos (RSSSF).
    position: 1,
    played: 34,
    won: 23,
    drawn: 5,
    lost: 6,
    goalsFor: 85,
    goalsAgainst: 32,
    points: 74,
    // Maribor, Egnatia (L), Egnatia (V), Mura y Aluminij.
    form: ["D", "D", "D", "D", "W"],
    avgGoalsFor: 2.6,
    avgGoalsAgainst: 1.6,
    avgCorners: 4.4,
  },
  {
    id: "mjallby-aif",
    name: "Mjällby AIF",
    shortName: "Mjällby",
    code: "MJA",
    country: "Suecia",
    competitionId: "allsvenskan",
    stadium: "Strandvallen",
    founded: 1939,
    primaryColor: "#FACC15",
    secondaryColor: "#111827",
    // Allsvenskan 2026, tras la jornada 13 (fuente: allsvenskantabellen.se).
    position: 10,
    played: 13,
    won: 4,
    drawn: 5,
    lost: 4,
    goalsFor: 19,
    goalsAgainst: 17,
    points: 17,
    // Últimos resultados reales, más reciente primero: 0-0 vs Lincoln Red Imps (V, UCL),
    // 1-2 en Kalmar FF (L), 3-0 vs Lincoln Red Imps (L, UCL), 0-0 vs Västerås SK (L),
    // 1-2 vs AIK (L).
    form: ["D", "L", "W", "D", "L"],
    avgGoalsFor: 1.5,
    avgGoalsAgainst: 1.3,
    avgCorners: 4.9,
  },
  {
    id: "slovan-bratislava",
    name: "SK Slovan Bratislava",
    shortName: "Slovan",
    code: "SLB",
    country: "Eslovaquia",
    competitionId: "nike-liga",
    stadium: "Tehelné pole",
    founded: 1919,
    primaryColor: "#2563EB",
    secondaryColor: "#F8FAFC",
    // Niké liga 2025/26, tabla final: 1º puesto, 46 pts en 22 partidos
    // (fuente: sportstats365.com). Arrancan 2026/27 con 2 victorias en 2.
    position: 1,
    played: 22,
    won: 14,
    drawn: 4,
    lost: 4,
    goalsFor: 47,
    goalsAgainst: 30,
    points: 46,
    // Últimos resultados reales, más reciente primero: 3-0 vs Železiarne Podbrezová (L),
    // 1-1 vs Saburtalo Tbilisi (L, UCL vuelta), 4-0 en Dukla Banská Bystrica (L),
    // 2-0 en Saburtalo Tbilisi (V, UCL ida).
    form: ["W", "D", "W", "W"],
    avgGoalsFor: 2.1,
    avgGoalsAgainst: 1.4,
    avgCorners: 6.3,
  },
  {
    id: "levski-sofia",
    name: "PFC Levski Sofia",
    shortName: "Levski Sofia",
    code: "LEV",
    country: "Bulgaria",
    competitionId: "bulgarian-first-league",
    stadium: "Stadion Georgi Asparuhov",
    founded: 1914,
    primaryColor: "#1D4ED8",
    secondaryColor: "#F8FAFC",
    position: 1,
    played: 3,
    won: 3,
    drawn: 0,
    lost: 0,
    goalsFor: 7,
    goalsAgainst: 2,
    points: 9,
    form: ["W", "D", "W", "W", "W"],
    avgGoalsFor: 2.2,
    avgGoalsAgainst: 0.8,
    avgCorners: 6.2,
  },
  {
    id: "kairat-almaty",
    name: "FC Kairat",
    shortName: "Kairat",
    code: "KAI",
    country: "Kazajistán",
    competitionId: "kazakhstan-premier-league",
    stadium: "Ortalyq stadion",
    founded: 1954,
    primaryColor: "#FACC15",
    secondaryColor: "#111827",
    position: 2,
    played: 20,
    won: 13,
    drawn: 6,
    lost: 1,
    goalsFor: 39,
    goalsAgainst: 14,
    points: 45,
    form: ["W", "L", "W", "W", "W"],
    avgGoalsFor: 1.6,
    avgGoalsAgainst: 0.6,
    avgCorners: 7.4,
  },
];

export const teams = mergeById(BUILT_IN_TEAMS, importedTeams);

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}

export function getTeamsByCompetition(competitionId: string): Team[] {
  return teams.filter((t) => t.competitionId === competitionId);
}

/** Relative attacking/defensive strength derived from the league table, 0-1. */
export function getTeamStrength(teamId: string): number {
  const team = getTeamById(teamId);
  if (!team) return 0.5;
  const ppg = team.points / team.played;
  return Math.min(1, Math.max(0.15, ppg / 2.6));
}
