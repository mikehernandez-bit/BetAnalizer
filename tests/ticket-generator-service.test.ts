import { describe, it, expect } from "vitest";
import { generateBetTicket } from "../services/ticket-generator-service";
import { getUpcomingMatches } from "@/data/matches";
import { defaultAnalysisConfig, generateAnalysis } from "@/services/analysis-service";

describe("Ticket Generator Service", () => {
  it("reutiliza exactamente la evaluación de Mercados para cada selección", () => {
    const now = new Date(2026, 7, 10, 12, 0, 0, 0);
    const match = getUpcomingMatches(now)[0];
    expect(match).toBeDefined();

    const analysis = generateAnalysis(defaultAnalysisConfig(match.homeTeamId, match.awayTeamId, 10));
    const ticket = generateBetTicket({
      minConfidence: 0,
      minProbability: 0,
      matchId: match.id,
      maxPerMatch: Infinity,
      now,
    });

    for (const selection of ticket.selections) {
      const market = analysis.markets.find((item) => item.id === selection.marketEval.id);
      expect(market).toBeDefined();
      expect(selection.confidence).toBe(market!.confidence);
      expect(selection.probability).toBe(market!.statisticalEstimate);
      expect(selection.marketEval.recommendation).toBe("recomendado");
    }
  });

  it("expone el mismo 1X2 y doble oportunidad de Mercados al inicio del ticket", () => {
    const now = new Date(2026, 7, 10, 12, 0, 0, 0);
    const ticket = generateBetTicket({
      minConfidence: 0,
      minProbability: 0,
      maxPerMatch: 1,
      now,
    });
    const summary = ticket.resultSummaries[0];
    const match = getUpcomingMatches(now).find((item) => item.id === summary?.matchId);

    expect(summary).toBeDefined();
    expect(match).toBeDefined();
    const analysis = generateAnalysis(defaultAnalysisConfig(match!.homeTeamId, match!.awayTeamId, 10));
    for (const ticketMarket of [summary!.homeWin, summary!.draw, summary!.awayWin, summary!.doubleChanceHome, summary!.doubleChanceAway]) {
      const market = analysis.markets.find((item) => item.id === ticketMarket.id);
      expect(market).toBeDefined();
      expect(ticketMarket.statisticalEstimate).toBe(market!.statisticalEstimate);
      expect(ticketMarket.confidence).toBe(market!.confidence);
    }
  });

  it("generates a ticket with +80% confidence and +80% probability filters (default 1 per match)", () => {
    const ticket = generateBetTicket({
      minConfidence: 80,
      minProbability: 80,
      maxPerMatch: 1,
    });

    expect(ticket).toBeDefined();
    expect(ticket.minConfidence).toBe(80);
    expect(ticket.minProbability).toBe(80);
    expect(ticket.maxPerMatch).toBe(1);
    expect(Array.isArray(ticket.selections)).toBe(true);

    const matchIds = ticket.selections.map((s) => s.matchId);
    const uniqueMatchIds = new Set(matchIds);
    expect(matchIds.length).toBe(uniqueMatchIds.size);

    for (const sel of ticket.selections) {
      expect(sel.confidence).toBeGreaterThanOrEqual(80);
      expect(sel.probability).toBeGreaterThanOrEqual(80);
      expect(sel.odds).toBeGreaterThan(1.0);
    }
  });

  it("generates a ticket allowing multiple markets per match when maxPerMatch > 1", () => {
    const ticket = generateBetTicket({
      minConfidence: 70,
      minProbability: 70,
      maxPerMatch: 5,
    });

    expect(ticket).toBeDefined();
    expect(ticket.maxPerMatch).toBe(5);
  });

  it("generates a ticket with strict +90% confidence and +90% probability filters", () => {
    const ticket = generateBetTicket({
      minConfidence: 90,
      minProbability: 90,
    });

    expect(ticket).toBeDefined();
    expect(ticket.minConfidence).toBe(90);
    expect(ticket.minProbability).toBe(90);

    for (const sel of ticket.selections) {
      expect(sel.confidence).toBeGreaterThanOrEqual(90);
      expect(sel.probability).toBeGreaterThanOrEqual(90);
    }
  });
});
