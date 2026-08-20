import { describe, expect, it } from "vitest";
import { createTrackedTicket, evaluateTrackedSelection, scanThreeDayAuditMatches, settleTrackedTicketMatch } from "@/lib/bet-records";
import { RecordedMatchOutcome, TrackedTicketMatch } from "@/types";
import { GeneratedTicket } from "@/services/ticket-generator-service";

const CIENCIANO_GARCILASO: RecordedMatchOutcome = {
  homeGoals: 0,
  awayGoals: 0,
  homeGoalsFirstHalf: 0,
  awayGoalsFirstHalf: 0,
  homeCorners: 6,
  awayCorners: 1,
  homeYellowCards: 2,
  awayYellowCards: 5,
  homeRedCards: 1,
  awayRedCards: 0,
  recordedAt: "2026-08-16T23:00:00.000Z",
};

describe("auditoría de mercados guardados", () => {
  it("congela el ganador previsto junto con las selecciones del ticket blindado", () => {
    const market = (id: string, probability: number) => ({
      id,
      market: { id, name: id, category: "resultado", description: "", side: "partido" },
      confidence: probability,
      statisticalEstimate: probability,
      sampleSize: 10,
      recommendation: "recomendado",
      positivePatterns: [],
      contradictions: [],
    });
    const ticket = {
      id: "ticket-70",
      minConfidence: 70,
      minProbability: 70,
      selections: [{
        matchId: "match-1", matchLabel: "Cienciano vs Dep. Garcilaso", competitionName: "PERU LIGA 1", matchDate: "2026-08-16", matchTime: "18:30",
        homeTeam: { id: "cienciano", shortName: "Cienciano" }, awayTeam: { id: "deportivo-garcilaso", shortName: "Dep. Garcilaso" },
        marketEval: market("corners_over_65", 72), confidence: 73, probability: 72, odds: 1.4,
      }],
      resultSummaries: [{
        matchId: "match-1", homeTeam: { id: "cienciano", shortName: "Cienciano" }, awayTeam: { id: "deportivo-garcilaso", shortName: "Dep. Garcilaso" },
        homeWin: market("result_home_win", 43), draw: market("result_draw", 24), awayWin: market("result_away_win", 33),
        doubleChanceHome: market("result_dc_home", 67), doubleChanceAway: market("result_dc_away", 57), evidenceLabels: [],
      }],
    } as unknown as GeneratedTicket;

    const tracked = createTrackedTicket(ticket, 70);
    expect(tracked.tier).toBe(70);
    expect(tracked.matches).toHaveLength(1);
    expect(tracked.matches[0].winnerPrediction).toMatchObject({ outcome: "local", label: "Cienciano", probability: 43 });
    expect(tracked.matches[0].selections[0]).toMatchObject({ marketId: "corners_over_65", probability: 72, confidence: 72 });
  });

  it("contrasta correctamente los mercados de córners y tarjetas del resultado final", () => {
    expect(evaluateTrackedSelection({ marketId: "corners_over_65" }, CIENCIANO_GARCILASO)?.fulfilled).toBe(true);
    expect(evaluateTrackedSelection({ marketId: "corners_over_75" }, CIENCIANO_GARCILASO)?.fulfilled).toBe(false);
    expect(evaluateTrackedSelection({ marketId: "corners_most_team", targetSide: "home" }, CIENCIANO_GARCILASO)?.fulfilled).toBe(true);
    expect(evaluateTrackedSelection({ marketId: "cards_total_over_25" }, CIENCIANO_GARCILASO)?.fulfilled).toBe(true);
    expect(evaluateTrackedSelection({ marketId: "cards_away_over_25" }, CIENCIANO_GARCILASO)?.fulfilled).toBe(true);
    expect(evaluateTrackedSelection({ marketId: "red_card_shown" }, CIENCIANO_GARCILASO)?.fulfilled).toBe(true);
  });

  it("deja sin auditar, en vez de fallar, un mercado que necesita un dato no registrado", () => {
    const withoutCorners = { ...CIENCIANO_GARCILASO, homeCorners: undefined, awayCorners: undefined };
    expect(evaluateTrackedSelection({ marketId: "corners_over_65" }, withoutCorners)).toBeUndefined();
  });

  it("conserva pendientes las selecciones sin métrica oficial y audita al ganador previsto", () => {
    const match: TrackedTicketMatch = {
      matchId: "cienciano-vs-deportivo-garcilaso-2026-08-16",
      competition: "Primera División",
      homeTeamId: "cienciano",
      awayTeamId: "deportivo-garcilaso",
      date: "2026-08-16",
      time: "18:30",
      status: "pendiente",
      winnerPrediction: {
        outcome: "local",
        label: "Cienciano",
        probability: 43,
        homeWinProbability: 43,
        drawProbability: 24,
        awayWinProbability: 33,
      },
      selections: [
        { id: "1", marketId: "corners_over_65", marketName: "Más de 6.5 córners", category: "corners", probability: 72, confidence: 73, sampleSize: 10, recommendation: "recomendado", evidence: [], status: "pendiente" },
        { id: "2", marketId: "first_half_under_25", marketName: "Menos de 2.5 goles 1ª parte", category: "primera_parte", probability: 70, confidence: 70, sampleSize: 10, recommendation: "recomendado", evidence: [], status: "pendiente" },
      ],
    };
    const withoutFirstHalf = { ...CIENCIANO_GARCILASO, homeGoals: 3, awayGoals: 2, homeGoalsFirstHalf: undefined, awayGoalsFirstHalf: undefined };
    const updated = settleTrackedTicketMatch(match, withoutFirstHalf);

    expect(updated.selections[0].status).toBe("acertada");
    expect(updated.selections[1].status).toBe("sin_datos");
    expect(updated.status).toBe("pendiente");
    expect(updated.winnerPrediction?.correct).toBe(true);
  });

  it("audita correctamente mercados de 1T cuando el marcador del 1er tiempo es 0-0", () => {
    const outcomeWithZero1T: RecordedMatchOutcome = {
      homeGoals: 2,
      awayGoals: 1,
      homeGoalsFirstHalf: 0,
      awayGoalsFirstHalf: 0,
      recordedAt: new Date().toISOString(),
    };

    // Menos de 3.5 goles 1ª parte debe ser acertada con 0-0 (0 < 3.5)
    const checkUnder35 = evaluateTrackedSelection({ marketId: "first_half_under_35" }, outcomeWithZero1T);
    expect(checkUnder35?.fulfilled).toBe(true);
    expect(checkUnder35?.note).toBe("1T: 0-0");

    // Menos de 2.5 goles 1ª parte debe ser acertada con 0-0 (0 < 2.5)
    const checkUnder25 = evaluateTrackedSelection({ marketId: "first_half_under_25" }, outcomeWithZero1T);
    expect(checkUnder25?.fulfilled).toBe(true);
    expect(checkUnder25?.note).toBe("1T: 0-0");

    // Más de 0.5 goles 1ª parte debe ser fallida con 0-0 (0 > 0.5 es false)
    const checkOver05 = evaluateTrackedSelection({ marketId: "first_half_over_05" }, outcomeWithZero1T);
    expect(checkOver05?.fulfilled).toBe(false);
    expect(checkOver05?.note).toBe("1T: 0-0");

    // Menos de 3.5 goles 2ª parte: FT 2-1 (3 goles en 2T) -> 3 < 3.5 es true
    const check2HUnder35 = evaluateTrackedSelection({ marketId: "second_half_under_35" }, outcomeWithZero1T);
    expect(check2HUnder35?.fulfilled).toBe(true);
    expect(check2HUnder35?.note).toBe("2T: 2-1");

    // Menos de 2.5 goles 2ª parte: FT 2-1 (3 goles en 2T) -> 3 < 2.5 es false
    const check2HUnder25 = evaluateTrackedSelection({ marketId: "second_half_under_25" }, outcomeWithZero1T);
    expect(check2HUnder25?.fulfilled).toBe(false);
    expect(check2HUnder25?.note).toBe("2T: 2-1");

    // Más de 0.5 goles 2ª parte: FT 2-1 (3 goles en 2T) -> 3 > 0.5 es true (Acertó)
    const check2HOver05 = evaluateTrackedSelection({ marketId: "second_half_over_05" }, outcomeWithZero1T);
    expect(check2HOver05?.fulfilled).toBe(true);
    expect(check2HOver05?.note).toBe("2T: 2-1");

    // Local más de 0.5 goles 2ª parte: FT 2-1 (2 goles local en 2T) -> 2 > 0.5 es true (Acertó)
    const check2HHomeOver05 = evaluateTrackedSelection({ marketId: "second_half_home_over_05" }, outcomeWithZero1T);
    expect(check2HHomeOver05?.fulfilled).toBe(true);
    expect(check2HHomeOver05?.note).toBe("2T: 2-1");
  });

  it("escanea la ventana de 3 días y filtra exclusivamente apuestas con >= 70% en ambas métricas", () => {
    const summary = scanThreeDayAuditMatches("2026-08-17");

    expect(summary.dates.yesterday).toBe("2026-08-16");
    expect(summary.dates.today).toBe("2026-08-17");
    expect(summary.dates.tomorrow).toBe("2026-08-18");
    expect(summary.matches.length).toBeGreaterThan(0);

    for (const match of summary.matches) {
      for (const bet of match.qualifyingBets) {
        expect(bet.confidence).toBeGreaterThanOrEqual(70);
        expect(bet.probability).toBeGreaterThanOrEqual(70);
      }
      // Verificar orden descendente de probabilidad
      for (let i = 0; i < match.qualifyingBets.length - 1; i++) {
        expect(match.qualifyingBets[i].probability).toBeGreaterThanOrEqual(match.qualifyingBets[i + 1].probability);
      }
    }
  });
});
