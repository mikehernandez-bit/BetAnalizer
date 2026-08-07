import { Competition } from "@/types";
import { importedCompetitions, mergeById } from "@/data/imported-data";

// Solo competiciones reales. Cada una existe porque hay al menos un equipo
// o partido real cargado en el sistema para ella — no hay datos ficticios.
const BUILT_IN_COMPETITIONS: Competition[] = [
  {
    id: "allsvenskan",
    name: "Allsvenskan",
    shortName: "Allsvenskan",
    country: "Suecia",
    tier: 1,
    season: "2026",
    color: "#FACC15",
    totalTeams: 1,
  },
  {
    id: "nike-liga",
    name: "Niké liga",
    shortName: "Niké liga",
    country: "Eslovaquia",
    tier: 1,
    season: "2025/2026",
    color: "#2563EB",
    totalTeams: 1,
  },
  {
    id: "uefa-champions-league",
    name: "UEFA Champions League",
    shortName: "UCL",
    country: "Europa",
    tier: 1,
    season: "2026/2027",
    color: "#0B3FA0",
    totalTeams: 6,
  },
  {
    id: "uefa-europa-league",
    name: "UEFA Europa League",
    shortName: "UEL",
    country: "Europa",
    tier: 1,
    season: "2020/2021",
    color: "#F97316",
    totalTeams: 2,
  },
  {
    id: "armenian-premier-league",
    name: "Fastex Premier League",
    shortName: "Premier League",
    country: "Armenia",
    tier: 1,
    season: "2025/2026",
    color: "#1D4ED8",
    totalTeams: 1,
  },
  {
    id: "slovenian-prvaliga",
    name: "PrvaLiga",
    shortName: "PrvaLiga",
    country: "Eslovenia",
    tier: 1,
    season: "2025/2026",
    color: "#F4C430",
    totalTeams: 1,
  },
  {
    id: "bulgarian-first-league",
    name: "First Professional League",
    shortName: "First League",
    country: "Bulgaria",
    tier: 1,
    season: "2026/2027",
    color: "#2563EB",
    totalTeams: 1,
  },
  {
    id: "kazakhstan-premier-league",
    name: "Kazakhstan Premier League",
    shortName: "Premier League",
    country: "Kazajistán",
    tier: 1,
    season: "2026",
    color: "#FACC15",
    totalTeams: 1,
  },
];

export const competitions = mergeById(BUILT_IN_COMPETITIONS, importedCompetitions);

export function getCompetitionById(id: string): Competition | undefined {
  return competitions.find((c) => c.id === id);
}
