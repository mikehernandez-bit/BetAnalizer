import { describe, expect, it } from "vitest";
import { isMatchExpired } from "@/data/matches";
import { Match } from "@/types";

describe("isMatchExpired - Regla de ocultar partidos 2 horas después de su inicio", () => {
  const match11am: Match = {
    id: "test-match-11am",
    competitionId: "league",
    competitionType: "league",
    season: "2026",
    matchday: 1,
    date: "2026-08-12",
    time: "11:00",
    stadium: "Test Stadium",
    homeTeamId: "team-a",
    awayTeamId: "team-b",
    status: "scheduled",
  };

  it("NO expira antes de las 11:00 AM (ejemplo: 10:30 AM)", () => {
    const customNow = new Date(2026, 7, 12, 10, 30, 0, 0); // 10:30 AM
    expect(isMatchExpired(match11am, customNow)).toBe(false);
  });

  it("NO expira a la 1:00 hora de iniciado el partido (ejemplo: 12:00 PM)", () => {
    const customNow = new Date(2026, 7, 12, 12, 0, 0, 0); // 12:00 PM (1h después de inicio)
    expect(isMatchExpired(match11am, customNow)).toBe(false);
  });

  it("SI expira a las 2:00 horas exactas de haber iniciado (ejemplo: 1:00 PM / 13:00)", () => {
    const customNow = new Date(2026, 7, 12, 13, 0, 0, 0); // 13:00 PM (2h exactas después)
    expect(isMatchExpired(match11am, customNow)).toBe(true);
  });

  it("SI expira luego de 2 horas (ejemplo: 1:05 PM / 13:05)", () => {
    const customNow = new Date(2026, 7, 12, 13, 5, 0, 0); // 13:05 PM (2h 5min después)
    expect(isMatchExpired(match11am, customNow)).toBe(true);
  });
});
