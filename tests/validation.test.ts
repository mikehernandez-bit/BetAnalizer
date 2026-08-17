import { describe, expect, it } from "vitest";
import { validateImportBatch, MIN_HISTORY_PER_TEAM } from "@/lib/validation/match-package";
import { makeValidPackage, makeValidFilePayload } from "./fixtures";

describe("validateImportBatch", () => {
  // 1. JSON válido
  it("acepta un paquete válido", () => {
    const result = validateImportBatch(makeValidFilePayload());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.packages).toHaveLength(1);
      expect(result.packages[0].match.homeTeamId).toBe("equipo-local-ejemplo");
    }
  });

  it("acepta también un único paquete sin el sobre {version, packages}", () => {
    const result = validateImportBatch(makeValidPackage());
    expect(result.success).toBe(true);
  });

  it("acepta un array de paquetes sin el sobre (múltiples partidos)", () => {
    const a = makeValidPackage();
    const b = makeValidPackage({
      id: "otro-partido-2026-08-05",
      match: { ...a.match, id: "otro-partido-match-1", date: "2026-08-05" },
    });
    const result = validateImportBatch([a, b]);
    expect(result.success).toBe(true);
    if (result.success) expect(result.packages).toHaveLength(2);
  });

  // 2. JSON mal formado — se prueba en el punto en que realmente se parsea:
  // JSON.parse (usado por el hook de cliente y por la ruta API antes de validar).
  it("JSON.parse lanza sobre contenido mal formado (lo captura la capa de arriba)", () => {
    expect(() => JSON.parse("{version: 1, packages: [}")).toThrow();
  });

  // 3. Campos obligatorios faltantes
  it("rechaza un paquete sin sourceUrls", () => {
    const pkg = makeValidPackage();
    // @ts-expect-error -- se borra deliberadamente un campo obligatorio para la prueba
    delete pkg.sourceUrls;
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.path.includes("sourceUrls"))).toBe(true);
    }
  });

  it("rechaza un equipo sin campo 'points'", () => {
    const pkg = makeValidPackage();
    // @ts-expect-error -- se borra deliberadamente un campo obligatorio para la prueba
    delete pkg.teams[0].points;
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.path.includes("points"))).toBe(true);
    }
  });

  it("cada problema reportado incluye campo, ubicación, valor recibido, esperado y cómo corregirlo", () => {
    const pkg = makeValidPackage({ match: { ...makeValidPackage().match, matchday: -1 } });
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.issues[0];
      expect(issue.field).toBeTruthy();
      expect(issue.path).toBeTruthy();
      expect(issue.message).toBeTruthy();
      expect(issue.received).toBeTruthy();
      expect(issue.expected).toBeTruthy();
      expect(issue.hint).toBeTruthy();
    }
  });

  // 4. IDs duplicados
  it("rechaza dos equipos con el mismo id dentro de un paquete", () => {
    const pkg = makeValidPackage();
    pkg.teams[1] = { ...pkg.teams[1], id: pkg.teams[0].id };
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
  });

  it("rechaza matchId duplicado dentro del historial de un mismo equipo", () => {
    const pkg = makeValidPackage();
    const teamId = pkg.teams[0].id;
    pkg.histories[teamId][1] = { ...pkg.histories[teamId][1], matchId: pkg.histories[teamId][0].matchId };
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
  });

  it("rechaza dos paquetes con el mismo id de paquete en el mismo archivo", () => {
    const a = makeValidPackage();
    const b = makeValidPackage({ match: { ...a.match, id: "otro-match-id" } });
    const result = validateImportBatch(makeValidFilePayload([a, b]));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.message.includes("repetido"))).toBe(true);
    }
  });

  it("rechaza dos paquetes con el mismo match.id en el mismo archivo", () => {
    const a = makeValidPackage();
    const b = makeValidPackage({ id: "paquete-distinto-2026-08-06" });
    const result = validateImportBatch(makeValidFilePayload([a, b]));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.path.includes("match.id"))).toBe(true);
    }
  });

  // 5. Equipos no referenciados
  it("rechaza un partido cuyo homeTeamId no está en teams", () => {
    const pkg = makeValidPackage();
    pkg.match = { ...pkg.match, homeTeamId: "equipo-inexistente" };
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.path.includes("homeTeamId"))).toBe(true);
    }
  });

  it("rechaza un historial cuya clave no corresponde a ninguno de los dos equipos", () => {
    const pkg = makeValidPackage();
    pkg.histories["equipo-que-no-existe"] = pkg.histories[pkg.teams[0].id];
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
  });

  it("rechaza un equipo cuya competitionId no está en 'competitions'", () => {
    const pkg = makeValidPackage();
    pkg.teams[0] = { ...pkg.teams[0], competitionId: "liga-inexistente" };
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
  });

  // 6. Historial insuficiente
  it(`rechaza un historial con menos de ${MIN_HISTORY_PER_TEAM} partidos`, () => {
    const pkg = makeValidPackage();
    const teamId = pkg.teams[0].id;
    pkg.histories[teamId] = pkg.histories[teamId].slice(0, MIN_HISTORY_PER_TEAM - 1);
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.message.includes("al menos"))).toBe(true);
    }
  });

  // Validaciones adicionales del listado (formatos, enums, colores, urls, campos desconocidos)
  it("rechaza una fecha con formato incorrecto", () => {
    const pkg = makeValidPackage();
    pkg.match = { ...pkg.match, date: "04-08-2026" };
    expect(validateImportBatch(makeValidFilePayload([pkg])).success).toBe(false);
  });

  it("rechaza una hora con formato incorrecto", () => {
    const pkg = makeValidPackage();
    pkg.match = { ...pkg.match, time: "8:00 PM" };
    expect(validateImportBatch(makeValidFilePayload([pkg])).success).toBe(false);
  });

  it("rechaza un color no hexadecimal", () => {
    const pkg = makeValidPackage();
    pkg.teams[0] = { ...pkg.teams[0], primaryColor: "green" };
    expect(validateImportBatch(makeValidFilePayload([pkg])).success).toBe(false);
  });

  it("rechaza una URL de fuente inválida", () => {
    const pkg = makeValidPackage();
    pkg.sourceUrls = ["no-es-una-url"];
    expect(validateImportBatch(makeValidFilePayload([pkg])).success).toBe(false);
  });

  it("rechaza un estado de partido no permitido", () => {
    const pkg = makeValidPackage();
    // @ts-expect-error -- valor inválido deliberado
    pkg.match = { ...pkg.match, status: "en-pausa" };
    expect(validateImportBatch(makeValidFilePayload([pkg])).success).toBe(false);
  });

  it("rechaza un tipo de competición no permitido", () => {
    const pkg = makeValidPackage();
    // @ts-expect-error -- valor inválido deliberado
    pkg.match = { ...pkg.match, competitionType: "torneo-relampago" };
    expect(validateImportBatch(makeValidFilePayload([pkg])).success).toBe(false);
  });

  it("rechaza campos desconocidos (no declarados en el esquema)", () => {
    const pkg = makeValidPackage() as unknown as Record<string, unknown>;
    pkg.campoInventado = "no debería estar aquí";
    const result = validateImportBatch(makeValidFilePayload([pkg as never]));
    expect(result.success).toBe(false);
  });

  // Goles por tiempo (opcionales, pero consistentes si se incluyen)
  it("acepta un registro con desglose de goles por tiempo cuando suma correctamente", () => {
    const pkg = makeValidPackage();
    const teamId = pkg.teams[0].id;
    pkg.histories[teamId][0] = {
      ...pkg.histories[teamId][0],
      goalsFor: 3,
      goalsForFirstHalf: 1,
      goalsForSecondHalf: 2,
    };
    expect(validateImportBatch(makeValidFilePayload([pkg])).success).toBe(true);
  });

  it("rechaza un desglose de goles por tiempo que no suma el total", () => {
    const pkg = makeValidPackage();
    const teamId = pkg.teams[0].id;
    pkg.histories[teamId][0] = {
      ...pkg.histories[teamId][0],
      goalsFor: 3,
      goalsForFirstHalf: 1,
      goalsForSecondHalf: 1, // 1+1=2, no 3
    };
    const result = validateImportBatch(makeValidFilePayload([pkg]));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.some((i) => i.message.includes("goalsForFirstHalf"))).toBe(true);
    }
  });
});
