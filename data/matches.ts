import { Match } from "@/types";
import { importedMatches, mergeById } from "@/data/imported-data";

// Solo partidos reales, agregados uno por uno a pedido: se investiga el
// partido en internet y se carga aquí con su fecha, hora y estadio reales.
// No hay generación aleatoria ni ficción — cuando no hay datos (por ejemplo
// estadísticas de un partido que todavía no se jugó) el campo simplemente
// se omite en vez de inventarse.
const BUILT_IN_MATCHES: Match[] = [
  {
    id: "real-levski-kairat-1",
    competitionId: "uefa-champions-league",
    competitionType: "cup",
    season: "2026/2027",
    matchday: 3,
    date: "2026-08-04",
    time: "12:30",
    stadium: "Stadion Georgi Asparuhov",
    homeTeamId: "levski-sofia",
    awayTeamId: "kairat-almaty",
    status: "scheduled",
  },
  {
    id: "real-ararat-armenia-celje-1",
    competitionId: "uefa-champions-league",
    competitionType: "cup",
    season: "2026/2027",
    matchday: 3,
    date: "2026-08-04",
    time: "11:00",
    stadium: "Vazgen Sargsyan Republican Stadium",
    homeTeamId: "ararat-armenia",
    awayTeamId: "nk-celje",
    status: "scheduled",
  },
  {
    id: "real-mjallby-slovan-1",
    competitionId: "uefa-champions-league",
    competitionType: "cup",
    season: "2026/2027",
    matchday: 3,
    date: "2026-08-04",
    time: "11:00",
    stadium: "Strandvallen",
    homeTeamId: "mjallby-aif",
    awayTeamId: "slovan-bratislava",
    status: "scheduled",
  },
];

export const matches = mergeById(BUILT_IN_MATCHES, importedMatches);

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function getMatchesByTeam(teamId: string): Match[] {
  return matches.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
}

export function getMatchesByCompetition(competitionId: string): Match[] {
  return matches.filter((m) => m.competitionId === competitionId);
}

export function getUpcomingMatches(): Match[] {
  return matches
    .filter((m) => m.status === "scheduled" || m.status === "live")
    .sort((a, b) => {
      // Un partido en vivo debe aparecer antes que los próximos, aunque su
      // hora de inicio sea posterior, para que no desaparezca del resumen.
      if (a.status !== b.status) return a.status === "live" ? -1 : 1;
      return a.date + a.time < b.date + b.time ? -1 : 1;
    });
}

export function getFinishedMatches(): Match[] {
  return matches.filter((m) => m.status === "finished");
}

export function getMatchesOnDate(dateIso: string): Match[] {
  return matches.filter((m) => m.date === dateIso);
}
