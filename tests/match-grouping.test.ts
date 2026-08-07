import { describe, expect, it } from "vitest";
import type { Match } from "@/types";
import { groupMatchesByRelativeDate } from "@/utils/match-grouping";

const TODAY = "2026-08-10";

function match(overrides: Partial<Match> & Pick<Match, "id" | "date" | "time">): Match {
  return {
    competitionId: "liga",
    competitionType: "league",
    season: "2026",
    matchday: 1,
    stadium: "Estadio",
    homeTeamId: "a",
    awayTeamId: "b",
    status: "scheduled",
    ...overrides,
  };
}

describe("groupMatchesByRelativeDate", () => {
  it("clasifica hoy, mañana, ayer, próximos y pasados correctamente", () => {
    const matches = [
      match({ id: "hoy-1", date: "2026-08-10", time: "10:00" }),
      match({ id: "manana-1", date: "2026-08-11", time: "10:00" }),
      match({ id: "ayer-1", date: "2026-08-09", time: "10:00" }),
      match({ id: "proximo-1", date: "2026-08-15", time: "10:00" }),
      match({ id: "pasado-1", date: "2026-07-01", time: "10:00" }),
    ];

    const groups = groupMatchesByRelativeDate(matches, TODAY);
    const byKey = Object.fromEntries(groups.map((g) => [g.key, g.matches.map((m) => m.id)]));

    expect(byKey.hoy).toEqual(["hoy-1"]);
    expect(byKey.manana).toEqual(["manana-1"]);
    expect(byKey.ayer).toEqual(["ayer-1"]);
    expect(byKey.proximos).toEqual(["proximo-1"]);
    expect(byKey.pasados).toEqual(["pasado-1"]);
  });

  it("ordena los grupos con lo urgente primero y lo viejo al final", () => {
    const matches = [
      match({ id: "pasado-1", date: "2026-07-01", time: "10:00" }),
      match({ id: "ayer-1", date: "2026-08-09", time: "10:00" }),
      match({ id: "proximo-1", date: "2026-08-15", time: "10:00" }),
      match({ id: "manana-1", date: "2026-08-11", time: "10:00" }),
      match({ id: "hoy-1", date: "2026-08-10", time: "10:00" }),
    ];

    const groups = groupMatchesByRelativeDate(matches, TODAY);
    expect(groups.map((g) => g.key)).toEqual(["hoy", "manana", "proximos", "ayer", "pasados"]);
  });

  it("dentro de 'pasados' ordena del más reciente al más antiguo", () => {
    const matches = [
      match({ id: "muy-viejo", date: "2026-06-01", time: "10:00" }),
      match({ id: "menos-viejo", date: "2026-07-15", time: "10:00" }),
    ];
    const groups = groupMatchesByRelativeDate(matches, TODAY);
    const pasados = groups.find((g) => g.key === "pasados")!;
    expect(pasados.matches.map((m) => m.id)).toEqual(["menos-viejo", "muy-viejo"]);
  });

  it("dentro de 'próximos' ordena del más cercano al más lejano", () => {
    const matches = [
      match({ id: "lejos", date: "2026-08-20", time: "10:00" }),
      match({ id: "cerca", date: "2026-08-12", time: "10:00" }),
    ];
    const groups = groupMatchesByRelativeDate(matches, TODAY);
    const proximos = groups.find((g) => g.key === "proximos")!;
    expect(proximos.matches.map((m) => m.id)).toEqual(["cerca", "lejos"]);
  });

  it("omite los grupos vacíos", () => {
    const matches = [match({ id: "hoy-1", date: "2026-08-10", time: "10:00" })];
    const groups = groupMatchesByRelativeDate(matches, TODAY);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("hoy");
  });

  it("devuelve un array vacío cuando no hay partidos", () => {
    expect(groupMatchesByRelativeDate([], TODAY)).toEqual([]);
  });
});
