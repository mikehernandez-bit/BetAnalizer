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

describe("Clipboard Formatters", () => {
  it("formats a football match analysis to clipboard with all metadata and evaluated markets", () => {
    const match = matches[0];
    const analysisId = buildAnalysisId(match.homeTeamId, match.awayTeamId, 10);
    const analysis = resolveAnalysisById(analysisId);
    expect(analysis).toBeDefined();

    if (analysis) {
      const text = formatFootballAnalysisToClipboard(analysis);
      expect(text).toContain("BETANALYZER — ANÁLISIS COMPLETO DE FÚTBOL");
      expect(text).toContain(analysis.match.stadium);
      expect(text).toContain("TODOS LOS MERCADOS EVALUADOS");
      expect(text).toContain("PERFILES Y FORMA ESTADÍSTICA");
      expect(text).toContain("Confianza General:");
      expect(text).toContain("Lectura Rápida:");
      expect(text.length).toBeGreaterThan(500);
    }
  });

  it("formats a football match fallback to clipboard when given raw match", () => {
    const match = matches[0];
    const text = formatFootballMatchToClipboard(match);
    expect(text).toContain("BETANALYZER");
    expect(text).toContain(match.stadium);
    expect(text.length).toBeGreaterThan(100);
  });

  it("formats a tennis stored event to clipboard with all 17 markets, profiles and projections", () => {
    const event = tennisEvents[0];
    const text = formatTennisStoredEventToClipboard(event);
    expect(text).toContain("BETANALYZER — ANÁLISIS COMPLETO DE TENIS");
    expect(text).toContain(event.input.player1.name);
    expect(text).toContain(event.input.player2.name);
    expect(text).toContain(event.input.tournament);
    expect(text).toContain("PERFILES DE LOS JUGADORES");
    expect(text).toContain("TODOS LOS MERCADOS EVALUADOS (17 Mercados)");
    expect(text).toContain("Ganador Proyectado:");
    expect(text.length).toBeGreaterThan(800);
  });

  it("formats an ad-hoc tennis analysis to clipboard", () => {
    const event = tennisEvents[0];
    const analysis = analyzeTennisMatch(event.input);
    const text = formatTennisAnalysisToClipboard(analysis);
    expect(text).toContain("BETANALYZER — ANÁLISIS COMPLETO DE TENIS");
    expect(text).toContain(analysis.projectedWinner);
    expect(text).toContain("TODOS LOS MERCADOS EVALUADOS");
    expect(text.length).toBeGreaterThan(500);
  });
});
