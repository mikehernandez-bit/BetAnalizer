import { describe, expect, it } from "vitest";
import { formatTennisEventDate, groupTennisEventsByDay, normalizeTennisDayFilter } from "@/lib/tennis-event-groups";
import type { TennisStoredEvent } from "@/types/tennis";

function event(id: string, date: string): TennisStoredEvent {
  return { id, input: { date } } as TennisStoredEvent;
}

describe("tennis event day groups", () => {
  it("separates today, tomorrow and every other date using local calendar days", () => {
    const groups = groupTennisEventsByDay([
      event("today", "2026-08-18"),
      event("tomorrow", "2026-08-19"),
      event("past", "2026-08-17"),
      event("later", "2026-08-20"),
    ], new Date(2026, 7, 18, 23, 55));

    expect(groups.todayKey).toBe("2026-08-18");
    expect(groups.tomorrowKey).toBe("2026-08-19");
    expect(groups.today.map((item) => item.id)).toEqual(["today"]);
    expect(groups.tomorrow.map((item) => item.id)).toEqual(["tomorrow"]);
    expect(groups.other.map((item) => item.id)).toEqual(["past", "later"]);
  });

  it("formats the section date without shifting it through UTC", () => {
    expect(formatTennisEventDate("2026-08-19")).toContain("19");
    expect(formatTennisEventDate("2026-08-19").toLocaleLowerCase("es")).toContain("agosto");
  });

  it("restores tomorrow only from a valid navigation parameter", () => {
    expect(normalizeTennisDayFilter("tomorrow")).toBe("tomorrow");
    expect(normalizeTennisDayFilter("today")).toBe("today");
    expect(normalizeTennisDayFilter("invalid")).toBe("today");
    expect(normalizeTennisDayFilter(["tomorrow", "today"])).toBe("today");
  });

  it("ordena los eventos de hoy desde la hora más temprana a la más tardía", () => {
    const groups = groupTennisEventsByDay([
      { id: "match-late", input: { date: "2026-08-19", time: "18:00", tournament: "Torneo B" } } as TennisStoredEvent,
      { id: "match-early", input: { date: "2026-08-19", time: "10:00", tournament: "Torneo A" } } as TennisStoredEvent,
      { id: "match-mid", input: { date: "2026-08-19", time: "14:30", tournament: "Torneo A" } } as TennisStoredEvent,
    ], new Date(2026, 7, 19, 8, 0));

    expect(groups.today.map((item) => item.id)).toEqual(["match-early", "match-mid", "match-late"]);
  });
});
