import { describe, it, expect } from "vitest";
import {
  formatFootballAnalysisToClipboard,
  formatFootballMatchToClipboard,
  formatTennisStoredEventToClipboard,
  formatTennisAnalysisToClipboard,
} from "@/lib/clipboard-formatters";
import { matches } from "@/data/matches";
import { tennisEvents } from "@/data/tennis-events";
import { resolveAnalysisById, buildAnalysisId } from "@/services/analysis-service";
import { analyzeTennisMatch } from "@/services/tennis-analysis-service";

describe("Exhaustive Clipboard Formatters", () => {
  it("formats a football match analysis with full match history and all evaluated markets", () => {
    const match = matches[0];
    const analysisId = buildAnalysisId(match.homeTeamId, match.awayTeamId, 10);
    const analysis = resolveAnalysisById(analysisId);
    expect(analysis).toBeDefined();

    if (analysis) {
      const text = formatFootballAnalysisToClipboard(analysis);
      expect(text).toContain("BETANALYZER — REPORTE COMPLETO DE ANÁLISIS DE FÚTBOL");
      expect(text).toContain(analysis.match.stadium);
      expect(text).toContain("HISTORIAL DE LOS");
      expect(text).toContain("TODOS LOS MERCADOS EVALUADOS");
      expect(text).toContain("PERFILES ESTADÍSTICOS Y MÉTRICAS DE EQUIPO");
      expect(text).toContain("Confianza General:");
      expect(text).toContain("Lectura Rápida:");
      // Check that all markets are numbered and listed
      expect(text).toContain("#1.");
      expect(text.length).toBeGreaterThan(1500);
    }
  });

  it("formats a tennis stored event with complete 20-match histories for both players and all 17 markets", () => {
    const event = tennisEvents[0];
    const text = formatTennisStoredEventToClipboard(event);
    expect(text).toContain("BETANALYZER — REPORTE COMPLETO DE ANÁLISIS DE TENIS");
    expect(text).toContain(event.input.player1.name);
    expect(text).toContain(event.input.player2.name);
    expect(text).toContain(event.input.tournament);
    expect(text).toContain(`HISTORIAL DE LOS 20 ÚLTIMOS PARTIDOS: ${event.input.player1.name}`);
    expect(text).toContain(`HISTORIAL DE LOS 20 ÚLTIMOS PARTIDOS: ${event.input.player2.name}`);
    expect(text).toContain("TODOS LOS MERCADOS EVALUADOS (17 MERCADOS)");
    expect(text).toContain("Ganador Proyectado:");
    // Check that each of the 20 matches is formatted
    expect(text).toContain("# 1 |");
    expect(text).toContain("#20 |");
    // Check that all 17 markets are listed
    expect(text).toContain("#17.");
    expect(text.length).toBeGreaterThan(2500);
  });

  it("formats an ad-hoc tennis analysis to clipboard", () => {
    const event = tennisEvents[0];
    const analysis = analyzeTennisMatch(event.input);
    const text = formatTennisAnalysisToClipboard(analysis);
    expect(text).toContain("BETANALYZER — REPORTE COMPLETO DE ANÁLISIS DE TENIS");
    expect(text).toContain(analysis.projectedWinner);
    expect(text).toContain("TODOS LOS MERCADOS EVALUADOS");
    expect(text.length).toBeGreaterThan(2000);
  });
});
