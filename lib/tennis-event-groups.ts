import type { TennisStoredEvent } from "@/types/tennis";

export type TennisDayFilter = "yesterday" | "today" | "tomorrow";

export function normalizeTennisDayFilter(value: string | string[] | undefined): TennisDayFilter {
  if (value === "yesterday") return "yesterday";
  return value === "tomorrow" ? "tomorrow" : "today";
}

export interface TennisEventDayGroups {
  todayKey: string;
  yesterdayKey: string;
  tomorrowKey: string;
  yesterday: TennisStoredEvent[];
  today: TennisStoredEvent[];
  tomorrow: TennisStoredEvent[];
  other: TennisStoredEvent[];
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sortTennisEventsByTime(events: TennisStoredEvent[]): TennisStoredEvent[] {
  return [...events].sort((a, b) => {
    // Si tienen fechas distintas, primero por fecha ascendente
    const dateA = a.input.date ?? "";
    const dateB = b.input.date ?? "";
    const dateComp = dateA.localeCompare(dateB);
    if (dateComp !== 0) return dateComp;

    // Horas en formato "HH:mm" (ej. "10:00", "11:30", "16:10")
    const timeA = a.input.time && a.input.time.trim() ? a.input.time.trim() : "99:99";
    const timeB = b.input.time && b.input.time.trim() ? b.input.time.trim() : "99:99";
    const timeComp = timeA.localeCompare(timeB);
    if (timeComp !== 0) return timeComp;

    // Desempate por torneo y nombres
    const tournamentComp = (a.input.tournament ?? "").localeCompare(b.input.tournament ?? "");
    if (tournamentComp !== 0) return tournamentComp;

    const p1Comp = (a.input.player1?.name ?? "").localeCompare(b.input.player1?.name ?? "");
    if (p1Comp !== 0) return p1Comp;

    return a.id.localeCompare(b.id);
  });
}

export function groupTennisEventsByDay(events: TennisStoredEvent[], now = new Date()): TennisEventDayGroups {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayKey = localDateKey(today);
  const yesterdayKey = localDateKey(yesterday);
  const tomorrowKey = localDateKey(tomorrow);

  return {
    todayKey,
    yesterdayKey,
    tomorrowKey,
    yesterday: sortTennisEventsByTime(events.filter((event) => event.input.date === yesterdayKey)),
    today: sortTennisEventsByTime(events.filter((event) => event.input.date === todayKey)),
    tomorrow: sortTennisEventsByTime(events.filter((event) => event.input.date === tomorrowKey)),
    other: sortTennisEventsByTime(events.filter((event) => event.input.date !== yesterdayKey && event.input.date !== todayKey && event.input.date !== tomorrowKey)),
  };
}

export function formatTennisEventDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(year, month - 1, day));
}
