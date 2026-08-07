import { describe, expect, it } from "vitest";
import type { TeamMatchRecord } from "@/types";
import { deriveHeadToHead, deriveCommonOpponents } from "@/utils/matchups";

function record(overrides: Partial<TeamMatchRecord> & Pick<TeamMatchRecord, "matchId" | "date" | "opponentId">): TeamMatchRecord {
  return {
    competitionId: "liga-ejemplo",
    competitionType: "league",
    venue: "local",
    result: "W",
    goalsFor: 1,
    goalsAgainst: 0,
    cornersFor: 5,
    cornersAgainst: 3,
    shotsFor: 10,
    shotsAgainst: 6,
    shotsOnTargetFor: 4,
    shotsOnTargetAgainst: 2,
    possession: 55,
    yellowCards: 1,
    redCards: 0,
    ...overrides,
  };
}

describe("deriveHeadToHead", () => {
  it("construye el cruce directo a partir del historial de un solo equipo", () => {
    const histories = {
      "team-a": [record({ matchId: "m1", date: "2026-05-01", opponentId: "team-b", venue: "local", goalsFor: 2, goalsAgainst: 1 })],
      "team-b": [record({ matchId: "irrelevante", date: "2026-04-01", opponentId: "team-c" })],
    };

    const h2h = deriveHeadToHead("team-a", "team-b", histories);
    expect(h2h.matches).toHaveLength(1);
    expect(h2h.matches[0]).toMatchObject({ homeTeamId: "team-a", awayTeamId: "team-b", homeGoals: 2, awayGoals: 1 });
    expect(h2h.summary.totalMatches).toBe(1);
    expect(h2h.summary.dominantTeamId).toBe("team-a");
  });

  it("combina las tarjetas de ambos lados cuando los dos historiales incluyen el mismo partido", () => {
    const histories = {
      "team-a": [record({ matchId: "a1", date: "2026-05-01", opponentId: "team-b", venue: "local", yellowCards: 2, redCards: 0 })],
      "team-b": [record({ matchId: "b1", date: "2026-05-01", opponentId: "team-a", venue: "visitante", yellowCards: 1, redCards: 1 })],
    };

    const h2h = deriveHeadToHead("team-a", "team-b", histories);
    expect(h2h.matches).toHaveLength(1);
    expect(h2h.matches[0].cards).toBe(4); // 2+0 de A, 1+1 de B
  });

  it("devuelve una estructura vacía cuando no hay ningún cruce en los historiales", () => {
    const histories = {
      "team-a": [record({ matchId: "m1", date: "2026-05-01", opponentId: "team-x" })],
      "team-b": [record({ matchId: "m2", date: "2026-05-01", opponentId: "team-y" })],
    };
    const h2h = deriveHeadToHead("team-a", "team-b", histories);
    expect(h2h.matches).toHaveLength(0);
    expect(h2h.summary.totalMatches).toBe(0);
  });

  it("ordena los cruces de más reciente a más antiguo", () => {
    const histories = {
      "team-a": [
        record({ matchId: "m1", date: "2026-01-01", opponentId: "team-b" }),
        record({ matchId: "m2", date: "2026-06-01", opponentId: "team-b" }),
      ],
      "team-b": [],
    };
    const h2h = deriveHeadToHead("team-a", "team-b", histories);
    expect(h2h.matches.map((m) => m.date)).toEqual(["2026-06-01", "2026-01-01"]);
  });
});

describe("deriveCommonOpponents", () => {
  it("detecta un rival compartido y calcula la diferencia entre ambos equipos", () => {
    const histories = {
      "team-a": [record({ matchId: "a1", date: "2026-05-01", opponentId: "rival-x", goalsFor: 3, goalsAgainst: 0 })],
      "team-b": [record({ matchId: "b1", date: "2026-05-02", opponentId: "rival-x", goalsFor: 1, goalsAgainst: 1 })],
    };

    const result = deriveCommonOpponents("team-a", "team-b", histories, "Equipo A", "Equipo B");
    expect(result.opponents).toHaveLength(1);
    expect(result.opponents[0].opponentId).toBe("rival-x");
    expect(result.opponents[0].difference.goals).toBe(2); // 3 vs 1
    expect(result.opponents[0].conclusion).toContain("Equipo A");
    expect(result.summary.betterTeamId).toBe("team-a");
    expect(result.summary.relevance).toBe("media");
  });

  it("usa el partido más reciente cuando un equipo enfrentó al mismo rival varias veces", () => {
    const histories = {
      "team-a": [
        record({ matchId: "a-recent", date: "2026-06-01", opponentId: "rival-x", goalsFor: 5, goalsAgainst: 0 }),
        record({ matchId: "a-old", date: "2026-01-01", opponentId: "rival-x", goalsFor: 0, goalsAgainst: 5 }),
      ],
      "team-b": [record({ matchId: "b1", date: "2026-05-02", opponentId: "rival-x", goalsFor: 1, goalsAgainst: 1 })],
    };
    const result = deriveCommonOpponents("team-a", "team-b", histories);
    expect(result.opponents[0].teamA.matchId).toBe("a-recent");
  });

  it("marca relevancia 'alta' con 3 o más rivales compartidos", () => {
    const histories = {
      "team-a": [
        record({ matchId: "a1", date: "2026-05-01", opponentId: "rival-1" }),
        record({ matchId: "a2", date: "2026-05-02", opponentId: "rival-2" }),
        record({ matchId: "a3", date: "2026-05-03", opponentId: "rival-3" }),
      ],
      "team-b": [
        record({ matchId: "b1", date: "2026-05-01", opponentId: "rival-1" }),
        record({ matchId: "b2", date: "2026-05-02", opponentId: "rival-2" }),
        record({ matchId: "b3", date: "2026-05-03", opponentId: "rival-3" }),
      ],
    };
    const result = deriveCommonOpponents("team-a", "team-b", histories);
    expect(result.summary.relevance).toBe("alta");
    expect(result.summary.matchesCount).toBe(3);
  });

  it("devuelve una estructura vacía cuando no hay rivales compartidos", () => {
    const histories = {
      "team-a": [record({ matchId: "m1", date: "2026-05-01", opponentId: "rival-1" })],
      "team-b": [record({ matchId: "m2", date: "2026-05-01", opponentId: "rival-2" })],
    };
    const result = deriveCommonOpponents("team-a", "team-b", histories);
    expect(result.opponents).toHaveLength(0);
    expect(result.summary.relevance).toBe("baja");
  });
});
