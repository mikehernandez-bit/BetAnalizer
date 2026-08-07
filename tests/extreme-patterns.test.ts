import { describe, expect, it } from "vitest";
import type { TeamMatchRecord } from "@/types";
import { computeTeamPatterns, computeCrossPatterns, computeExtremeTeamPatterns, computeExtremeCrossPatterns } from "@/utils/statistics";

function record(overrides: Partial<TeamMatchRecord> & Pick<TeamMatchRecord, "matchId" | "date">): TeamMatchRecord {
  return {
    opponentId: "x",
    competitionId: "liga",
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

describe("computeTeamPatterns / computeCrossPatterns no incluyen los rangos dinámicos", () => {
  it("computeTeamPatterns no mezcla patrones de rango (viven aparte, en la pestaña Rangos)", () => {
    const records = Array.from({ length: 5 }, (_, i) => record({ matchId: `m${i}`, date: `2026-01-0${i + 1}` }));
    const patterns = computeTeamPatterns("team-a", records);
    expect(patterns.some((p) => p.id.includes("-extreme-"))).toBe(false);
  });

  it("computeCrossPatterns no mezcla patrones de rango combinados", () => {
    const homeRecords = Array.from({ length: 5 }, (_, i) => record({ matchId: `h${i}`, date: `2026-01-0${i + 1}` }));
    const awayRecords = Array.from({ length: 5 }, (_, i) => record({ matchId: `a${i}`, date: `2026-01-0${i + 1}` }));
    const cross = computeCrossPatterns("home-team", homeRecords, "away-team", awayRecords);
    expect(cross.some((p) => p.id.includes("-extreme-"))).toBe(false);
  });
});

describe("computeExtremeTeamPatterns — patrones dinámicos de peor caso por equipo", () => {
  it("detecta el techo real (nunca superó el máximo observado)", () => {
    const records = [
      record({ matchId: "m1", date: "2026-04-01", cornersFor: 6, cornersAgainst: 3 }), // total 9
      record({ matchId: "m2", date: "2026-03-01", cornersFor: 4, cornersAgainst: 2 }), // total 6
      record({ matchId: "m3", date: "2026-02-01", cornersFor: 5, cornersAgainst: 4 }), // total 9
      record({ matchId: "m4", date: "2026-01-01", cornersFor: 3, cornersAgainst: 2 }), // total 5
    ];
    const patterns = computeExtremeTeamPatterns("team-a", records);
    const ceiling = patterns.find((p) => p.id === "team-a-extreme-match_corners-ceiling");
    expect(ceiling).toBeDefined();
    expect(ceiling!.title).toContain("9.5");
    expect(ceiling!.title).toContain("máximo real: 9");
    expect(ceiling!.percentage).toBe(100);
    expect(ceiling!.hits).toBe(4);
  });

  it("detecta el piso real (siempre llegó al menos al mínimo observado)", () => {
    const records = [
      record({ matchId: "m1", date: "2026-04-01", cornersFor: 6 }),
      record({ matchId: "m2", date: "2026-03-01", cornersFor: 4 }),
      record({ matchId: "m3", date: "2026-02-01", cornersFor: 5 }),
      record({ matchId: "m4", date: "2026-01-01", cornersFor: 3 }),
    ];
    const patterns = computeExtremeTeamPatterns("team-a", records);
    const floor = patterns.find((p) => p.id === "team-a-extreme-corners_for-floor");
    expect(floor).toBeDefined();
    expect(floor!.title).toContain("Siempre llegó al menos a 3");
    expect(floor!.percentage).toBe(100);
  });

  it("incluye remates en contra (no solo a favor)", () => {
    const records = [
      record({ matchId: "m1", date: "2026-04-01", shotsAgainst: 12 }),
      record({ matchId: "m2", date: "2026-03-01", shotsAgainst: 8 }),
      record({ matchId: "m3", date: "2026-02-01", shotsAgainst: 15 }),
      record({ matchId: "m4", date: "2026-01-01", shotsAgainst: 9 }),
    ];
    const patterns = computeExtremeTeamPatterns("team-a", records);
    const ceiling = patterns.find((p) => p.id === "team-a-extreme-shots_against-ceiling");
    expect(ceiling).toBeDefined();
    expect(ceiling!.title).toContain("remates en contra");
    expect(ceiling!.title).toContain("máximo real: 15");
    expect(ceiling!.category).toBe("remates");
  });

  it("incluye puntos de tarjetas por equipo (amarilla=1)", () => {
    const records = [
      record({ matchId: "m1", date: "2026-04-01", yellowCards: 3 }),
      record({ matchId: "m2", date: "2026-03-01", yellowCards: 1 }),
      record({ matchId: "m3", date: "2026-02-01", yellowCards: 4 }),
      record({ matchId: "m4", date: "2026-01-01", yellowCards: 2 }),
    ];
    const patterns = computeExtremeTeamPatterns("team-a", records);
    const ceiling = patterns.find((p) => p.id === "team-a-extreme-card_points-ceiling");
    const floor = patterns.find((p) => p.id === "team-a-extreme-card_points-floor");
    expect(ceiling).toBeDefined();
    expect(ceiling!.title).toContain("puntos de tarjetas");
    expect(ceiling!.title).toContain("máximo real: 4");
    expect(ceiling!.category).toBe("tarjetas");
    expect(floor).toBeDefined();
    expect(floor!.title).toContain("Siempre llegó al menos a 1");
  });

  it("una tarjeta roja pesa el doble que una amarilla en los puntos de tarjetas", () => {
    const records = [
      record({ matchId: "m1", date: "2026-04-01", yellowCards: 2, redCards: 0 }), // 2 puntos
      record({ matchId: "m2", date: "2026-03-01", yellowCards: 1, redCards: 1 }), // 1 + 2 = 3 puntos
      record({ matchId: "m3", date: "2026-02-01", yellowCards: 0, redCards: 1 }), // 0 + 2 = 2 puntos
      record({ matchId: "m4", date: "2026-01-01", yellowCards: 1, redCards: 0 }), // 1 punto
    ];
    const patterns = computeExtremeTeamPatterns("team-a", records);
    const ceiling = patterns.find((p) => p.id === "team-a-extreme-card_points-ceiling");
    // El máximo NO es 2 (yellowCards del partido m2), es 3 porque la roja de ese mismo partido suma 2 puntos.
    expect(ceiling!.title).toContain("máximo real: 3");
  });

  it("no genera patrón de piso cuando el mínimo observado es 0", () => {
    const records = [
      record({ matchId: "m1", date: "2026-04-01", goalsAgainst: 0 }),
      record({ matchId: "m2", date: "2026-03-01", goalsAgainst: 1 }),
      record({ matchId: "m3", date: "2026-02-01", goalsAgainst: 2 }),
      record({ matchId: "m4", date: "2026-01-01", goalsAgainst: 1 }),
    ];
    const patterns = computeExtremeTeamPatterns("team-a", records);
    expect(patterns.find((p) => p.id === "team-a-extreme-goals_against-floor")).toBeUndefined();
    expect(patterns.find((p) => p.id === "team-a-extreme-goals_against-ceiling")).toBeDefined();
  });

  it("con menos de 4 partidos no genera ningún patrón", () => {
    const records = [record({ matchId: "m1", date: "2026-01-01" })];
    expect(computeExtremeTeamPatterns("team-a", records)).toEqual([]);
  });

  it("con muestra chica (4 partidos) la fuerza queda acotada a 'moderado', no 'muy_fuerte'", () => {
    const records = [
      record({ matchId: "m1", date: "2026-04-01" }),
      record({ matchId: "m2", date: "2026-03-01" }),
      record({ matchId: "m3", date: "2026-02-01" }),
      record({ matchId: "m4", date: "2026-01-01" }),
    ];
    const patterns = computeExtremeTeamPatterns("team-a", records);
    const ceiling = patterns.find((p) => p.id === "team-a-extreme-goals_for-ceiling");
    expect(ceiling!.strength).toBe("moderado");
  });

  it("con muestra grande (10+ partidos) la fuerza puede llegar a 'muy_fuerte'", () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      record({ matchId: `m${i}`, date: `2026-01-${String(i + 1).padStart(2, "0")}` })
    );
    const patterns = computeExtremeTeamPatterns("team-a", records);
    const ceiling = patterns.find((p) => p.id === "team-a-extreme-goals_for-ceiling");
    expect(ceiling!.strength).toBe("muy_fuerte");
  });
});

describe("computeExtremeCrossPatterns — peor caso combinado entre ambos equipos", () => {
  it("agrupa los partidos de ambos equipos y calcula el techo conjunto", () => {
    const homeRecords = [
      record({ matchId: "h1", date: "2026-05-01", cornersFor: 6, cornersAgainst: 3 }), // total 9
      record({ matchId: "h2", date: "2026-04-01", cornersFor: 4, cornersAgainst: 2 }), // total 6
      record({ matchId: "h3", date: "2026-03-01", cornersFor: 5, cornersAgainst: 4 }), // total 9
      record({ matchId: "h4", date: "2026-02-01", cornersFor: 3, cornersAgainst: 2 }), // total 5
    ];
    const awayRecords = [
      record({ matchId: "a1", date: "2026-05-02", cornersFor: 2, cornersAgainst: 2 }), // total 4
      record({ matchId: "a2", date: "2026-04-02", cornersFor: 3, cornersAgainst: 1 }), // total 4
      record({ matchId: "a3", date: "2026-03-02", cornersFor: 2, cornersAgainst: 3 }), // total 5
      record({ matchId: "a4", date: "2026-02-02", cornersFor: 1, cornersAgainst: 2 }), // total 3
    ];

    const cross = computeExtremeCrossPatterns("home-team", homeRecords, "away-team", awayRecords);
    const ceiling = cross.find((p) => p.id === "cross-extreme-home-team-away-team-match_corners-ceiling");
    expect(ceiling).toBeDefined();
    // El máximo combinado es 9 (viene del equipo local); el equipo visitante nunca pasó de 5.
    expect(ceiling!.conclusion).toContain("más de 9 córners");
    expect(ceiling!.conclusion).toContain("9.5");
    expect(ceiling!.combinedConfidence).toBe(100);

    const floor = cross.find((p) => p.id === "cross-extreme-home-team-away-team-match_corners-floor");
    expect(floor).toBeDefined();
    // El mínimo combinado es 3 (viene del equipo visitante).
    expect(floor!.conclusion).toContain("al menos 3 córners");
  });

  it("no rompe si uno de los dos equipos no tiene historial", () => {
    const homeRecords = [record({ matchId: "h1", date: "2026-05-01" })];
    const cross = computeExtremeCrossPatterns("home-team", homeRecords, "away-team", []);
    expect(cross).toEqual([]);
  });

  it("también agrupa remates y tiros al arco totales del partido", () => {
    const homeRecords = [
      record({ matchId: "h1", date: "2026-05-01", shotsFor: 12, shotsAgainst: 8, shotsOnTargetFor: 5, shotsOnTargetAgainst: 3 }), // 20 remates, 8 TA
      record({ matchId: "h2", date: "2026-04-01", shotsFor: 9, shotsAgainst: 7, shotsOnTargetFor: 4, shotsOnTargetAgainst: 2 }),
    ];
    const awayRecords = [
      record({ matchId: "a1", date: "2026-05-02", shotsFor: 6, shotsAgainst: 5, shotsOnTargetFor: 2, shotsOnTargetAgainst: 1 }),
      record({ matchId: "a2", date: "2026-04-02", shotsFor: 7, shotsAgainst: 4, shotsOnTargetFor: 3, shotsOnTargetAgainst: 2 }),
    ];

    const cross = computeExtremeCrossPatterns("home-team", homeRecords, "away-team", awayRecords);
    const shotsCeiling = cross.find((p) => p.id === "cross-extreme-home-team-away-team-match_shots-ceiling");
    expect(shotsCeiling).toBeDefined();
    expect(shotsCeiling!.conclusion).toContain("más de 20 remates");

    const sotCeiling = cross.find((p) => p.id === "cross-extreme-home-team-away-team-match_sot-ceiling");
    expect(sotCeiling).toBeDefined();
    expect(sotCeiling!.conclusion).toContain("más de 8 tiros al arco");
  });

  it("también agrupa puntos de tarjetas (por equipo, no total del partido)", () => {
    const homeRecords = [
      record({ matchId: "h1", date: "2026-05-01", yellowCards: 4 }),
      record({ matchId: "h2", date: "2026-04-01", yellowCards: 2 }),
    ];
    const awayRecords = [
      record({ matchId: "a1", date: "2026-05-02", yellowCards: 1 }),
      record({ matchId: "a2", date: "2026-04-02", yellowCards: 3, redCards: 1 }), // 3 + 2 = 5 puntos
    ];

    const cross = computeExtremeCrossPatterns("home-team", homeRecords, "away-team", awayRecords);
    const ceiling = cross.find((p) => p.id === "cross-extreme-home-team-away-team-card_points-ceiling");
    expect(ceiling).toBeDefined();
    // El máximo combinado es 5 (viene de la visita, por la roja que vale doble), no 4.
    expect(ceiling!.conclusion).toContain("más de 5 puntos de tarjetas");
    expect(ceiling!.category).toBe("tarjetas");

    const floor = cross.find((p) => p.id === "cross-extreme-home-team-away-team-card_points-floor");
    expect(floor).toBeDefined();
    expect(floor!.conclusion).toContain("al menos 1 puntos de tarjetas");
  });
});
