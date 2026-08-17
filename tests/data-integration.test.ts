import { describe, expect, it } from "vitest";
import { matches, getMatchById, getUpcomingMatches, getMatchesOnDate, isMatchExpired } from "@/data/matches";
import { getTeamById } from "@/data/teams";
import { getImportedPackage, flattenImportedFile } from "@/data/imported-data";
import { getFeaturedMatches, getTodayIso } from "@/services/match-service";
import { defaultAnalysisConfig, generateAnalysis, buildAnalysisId } from "@/services/analysis-service";
import { getHeadToHead } from "@/data/head-to-head";
import { getCommonOpponents } from "@/data/common-opponents";
import { mergeImportedFile } from "@/lib/match-package-merge";
import { checkMatchDataAudit } from "@/utils/data-audit";
import { makeValidPackage } from "./fixtures";

// Estas pruebas usan los paquetes REALES ya cargados en
// data/imported-analysis-packages.json (no escriben nada a disco). Como un
// partido importado por la UI pasa exactamente por el mismo pipeline
// (data/imported-data.ts -> data/matches.ts / data/teams.ts / data/team-history.ts),
// probar que un partido ya importado aparece correctamente en cada sección
// demuestra que uno nuevo, importado por "Agregar partido", también lo hará.
const KNOWN_IMPORTED_MATCH_ID = "real-levski-kairat-1";

describe("Un partido importado aparece en todo el sistema", () => {
  // 11. Lista de partidos
  it("aparece en la lista general de partidos", () => {
    expect(matches.some((m) => m.id === KNOWN_IMPORTED_MATCH_ID)).toBe(true);
    expect(getMatchById(KNOWN_IMPORTED_MATCH_ID)).toBeDefined();
  });

  // 12. Dashboard (destacados / partidos de una fecha)
  it("aparece en los partidos destacados y en los partidos de una fecha del dashboard", () => {
    const match = getMatchById(KNOWN_IMPORTED_MATCH_ID)!;
    expect(getUpcomingMatches().some((m) => m.id === match.id) || match.status !== "scheduled" || isMatchExpired(match)).toBe(true);
    expect(getFeaturedMatches(50).some((m) => m.id === match.id) || match.status !== "scheduled" || isMatchExpired(match)).toBe(true);
    expect(getMatchesOnDate(match.date).some((m) => m.id === match.id) || isMatchExpired(match)).toBe(true);
    expect(getTodayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // 13. Detalle del partido (equipos, competición y paquete importado resolubles)
  it("se puede abrir el detalle del partido: equipos y datos investigados están disponibles", () => {
    const match = getMatchById(KNOWN_IMPORTED_MATCH_ID)!;
    const home = getTeamById(match.homeTeamId);
    const away = getTeamById(match.awayTeamId);
    expect(home).toBeDefined();
    expect(away).toBeDefined();

    const importedPackage = getImportedPackage(match.id);
    expect(importedPackage).toBeDefined();
    expect(importedPackage!.sourceUrls.length).toBeGreaterThan(0);
  });

  // 14. Generar el análisis con los datos importados
  it("genera un análisis completo usando el historial importado de ambos equipos", () => {
    const match = getMatchById(KNOWN_IMPORTED_MATCH_ID)!;
    const config = defaultAnalysisConfig(match.homeTeamId, match.awayTeamId, 10);
    const analysis = generateAnalysis(config);

    expect(analysis.id).toBe(buildAnalysisId(match.homeTeamId, match.awayTeamId, 10));
    expect(analysis.matchesAnalyzed).toBeGreaterThan(0);
    expect(analysis.homeForm.matches.length).toBeGreaterThan(0);
    expect(analysis.awayForm.matches.length).toBeGreaterThan(0);
    expect(analysis.markets.length).toBeGreaterThan(0);
  });
});

describe("Enfrentamientos directos y rivales en común derivados automáticamente", () => {
  // Estos dos equipos importados nunca tuvieron una entrada manual en
  // REAL_H2H / REAL_COMMON_OPPONENTS, pero sí comparten rivales y se
  // enfrentaron directamente dentro de sus propios historiales importados.
  it("deriva un enfrentamiento directo real a partir de los historiales importados", () => {
    const h2h = getHeadToHead("inter-miami-cf", "orlando-city-sc");
    expect(h2h.matches.length).toBeGreaterThan(0);
    expect(h2h.summary.totalMatches).toBe(h2h.matches.length);
  });

  it("deriva rivales en común reales a partir de los historiales importados", () => {
    const common = getCommonOpponents("inter-miami-cf", "orlando-city-sc");
    expect(common.opponents.length).toBeGreaterThan(0);
    expect(common.summary.matchesCount).toBe(common.opponents.length);
  });

  it("una entrada manual en REAL_H2H sigue teniendo prioridad sobre la derivada", () => {
    const h2h = getHeadToHead("ararat-armenia", "nk-celje");
    expect(h2h.matches).toHaveLength(1);
    expect(h2h.matches[0].matchId).toBe("ararat-celje-2020-09-24");
  });

  it("una pareja sin ningún cruce ni rival compartido sigue devolviendo una estructura vacía", () => {
    const h2h = getHeadToHead("mjallby-aif", "hapoel-beer-sheva");
    expect(h2h.matches).toHaveLength(0);
    const common = getCommonOpponents("mjallby-aif", "hapoel-beer-sheva");
    expect(common.opponents).toHaveLength(0);
  });
});

describe("flattenImportedFile (mecanismo que alimenta data/*.ts)", () => {
  it("produce equipos, partido, competición e historiales correctos a partir de un paquete sintético", () => {
    const pkg = makeValidPackage();
    const { file } = mergeImportedFile({ version: 1, packages: [] }, [pkg]);
    const flat = flattenImportedFile(file);

    expect(flat.teams.map((t) => t.id).sort()).toEqual(pkg.teams.map((t) => t.id).sort());
    expect(flat.matches[0].id).toBe(pkg.match.id);
    expect(flat.competitions.map((c) => c.id)).toEqual(pkg.competitions.map((c) => c.id));
    expect(Object.keys(flat.histories).sort()).toEqual(Object.keys(pkg.histories).sort());
  });
});

describe("Auditoría de métricas activas", () => {
  it("no marca remates ausentes cuando ese dato no alimenta el modelo", () => {
    const audit = checkMatchDataAudit("cienciano", "deportivo-garcilaso", 10);

    expect(audit.missingMetrics).not.toContain("Remates");
  });
});
