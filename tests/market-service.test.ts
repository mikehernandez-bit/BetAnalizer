import { describe, expect, it } from "vitest";
import type { CommonOpponentsAnalysis, HeadToHead, Team, TeamMatchRecord } from "@/types";
import { evaluateAllMarkets, MarketEvalContext } from "@/services/market-service";
import { bettingMarkets } from "@/data/markets";
import { computeConfidenceBreakdown } from "@/utils/confidence";

function team(id: string): Team {
  return {
    id,
    name: id,
    shortName: id,
    code: id.slice(0, 3).toUpperCase(),
    country: "Test",
    competitionId: "league",
    stadium: "Test stadium",
    founded: 1900,
    primaryColor: "#111111",
    secondaryColor: "#ffffff",
    position: 1,
    played: 10,
    won: 6,
    drawn: 2,
    lost: 2,
    goalsFor: 18,
    goalsAgainst: 8,
    points: 20,
    form: ["W", "W", "D", "W", "L"],
    avgGoalsFor: 1.8,
    avgGoalsAgainst: 0.8,
    avgCorners: 6,
  };
}

function record(id: string, venue: "local" | "visitante", overrides: Partial<TeamMatchRecord> = {}): TeamMatchRecord {
  return {
    matchId: id,
    date: "2026-08-01",
    opponentId: "opponent",
    competitionId: "league",
    competitionType: "league",
    venue,
    result: "W",
    goalsFor: 2,
    goalsAgainst: 0,
    cornersFor: 7,
    cornersAgainst: 3,
    shotsFor: 14,
    shotsAgainst: 8,
    shotsOnTargetFor: 5,
    shotsOnTargetAgainst: 2,
    possession: 55,
    yellowCards: 1,
    redCards: 0,
    ...overrides,
  };
}

const headToHead: HeadToHead = {
  teamAId: "home",
  teamBId: "away",
  matches: [],
  summary: {
    totalMatches: 0,
    teamAWins: 0,
    teamBWins: 0,
    draws: 0,
    avgGoals: 0,
    avgCorners: 0,
    bothScoredPct: 0,
    over25Pct: 0,
    dominantTeamId: null,
  },
};

const commonOpponents: CommonOpponentsAnalysis = {
  opponents: [],
  summary: { betterTeamId: null, avgDifference: 0, matchesCount: 0, relevance: "baja" },
};

function context(): MarketEvalContext {
  return {
    homeTeam: team("home"),
    awayTeam: team("away"),
    homeRecords: Array.from({ length: 8 }, (_, index) => record(`h-${index}`, "local")),
    awayRecords: Array.from({ length: 8 }, (_, index) =>
      record(`a-${index}`, "visitante", {
        result: "L",
        goalsFor: 0,
        goalsAgainst: 2,
        cornersFor: 2,
        cornersAgainst: 7,
      })
    ),
    headToHead,
    commonOpponents,
    includeH2H: false,
    includeCommonOpponents: false,
  };
}

describe("market-service matchup probabilities", () => {
  it("excluye señales no aplicables en vez de duplicar el rendimiento reciente", () => {
    const breakdown = computeConfidenceBreakdown({
      recentPerformance: 90,
      rivalVulnerability: 90,
      homeAwayCondition: 90,
      headToHead: 50,
      commonOpponents: 50,
      lastThreeTrend: 90,
      dataQuality: 90,
      availableSignals: { headToHead: false, commonOpponents: false },
    });

    expect(breakdown.finalScore).toBe(90);
  });

  it("shows all four scoring signals for over 0.5 goals", () => {
    const market = evaluateAllMarkets(context(), {}).find((evaluation) => evaluation.market.id === "goals_over_05");

    expect(market).toBeDefined();
    expect(market!.statisticalEstimate).toBeGreaterThanOrEqual(85);
    expect(market!.probabilitySignals).toHaveLength(4);
    expect(market!.probabilitySignals?.map((signal) => signal.label)).toEqual([
      "home anota +0.5 goles",
      "away concede +0.5 goles",
      "away anota +0.5 goles",
      "home concede +0.5 goles",
    ]);
    expect(market!.evidence?.series).toHaveLength(4);
    expect(market!.evidence?.series[0]).toMatchObject({ title: "home anota +0.5", hits: 8, total: 8, percentage: 100 });
    expect(market!.evidence?.series[0].matches[0]).toMatchObject({ score: "FT 2-0", fulfilled: true });
  });

  it("derives 1X2 and double chance from venue, full history, H2H and common opponents", () => {
    const ctx = context();
    ctx.includeH2H = true;
    ctx.includeCommonOpponents = true;
    ctx.headToHead = {
      teamAId: "home",
      teamBId: "away",
      matches: [
        { matchId: "h2h-1", date: "2026-07-01", competitionId: "league", homeTeamId: "home", awayTeamId: "away", homeGoals: 2, awayGoals: 0, cards: 2 },
        { matchId: "h2h-2", date: "2026-06-01", competitionId: "league", homeTeamId: "away", awayTeamId: "home", homeGoals: 0, awayGoals: 1, cards: 3 },
      ],
      summary: { totalMatches: 2, teamAWins: 2, teamBWins: 0, draws: 0, avgGoals: 1.5, avgCorners: 0, bothScoredPct: 0, over25Pct: 0, dominantTeamId: "home" },
    };
    ctx.commonOpponents = {
      opponents: [
        {
          opponentId: "shared-opponent",
          teamA: { matchId: "common-home", date: "2026-07-15", venue: "local", result: "W", goalsFor: 2, goalsAgainst: 0 },
          teamB: { matchId: "common-away", date: "2026-07-14", venue: "visitante", result: "L", goalsFor: 0, goalsAgainst: 2 },
          difference: { goals: 4, corners: 0, shots: 0, shotsOnTarget: 0, possession: 0 },
          conclusion: "home tuvo un mejor resultado",
        },
      ],
      summary: { betterTeamId: "home", avgDifference: 4, matchesCount: 1, relevance: "media" },
    };

    const markets = evaluateAllMarkets(ctx, {});
    const homeWin = markets.find((market) => market.market.id === "result_home_win");
    const draw = markets.find((market) => market.market.id === "result_draw");
    const awayWin = markets.find((market) => market.market.id === "result_away_win");
    const doubleChanceHome = markets.find((market) => market.market.id === "result_dc_home");
    const doubleChanceAway = markets.find((market) => market.market.id === "result_dc_away");

    expect(homeWin).toBeDefined();
    expect(draw).toBeDefined();
    expect(awayWin).toBeDefined();
    expect(homeWin!.statisticalEstimate + draw!.statisticalEstimate + awayWin!.statisticalEstimate).toBe(100);
    expect(doubleChanceHome!.statisticalEstimate).toBe(homeWin!.statisticalEstimate + draw!.statisticalEstimate);
    expect(doubleChanceAway!.statisticalEstimate).toBe(awayWin!.statisticalEstimate + draw!.statisticalEstimate);
    expect(homeWin!.probabilitySignals?.map((signal) => signal.label)).toEqual([
      "home como local",
      "away como visitante",
      "Historial total home",
      "Historial total away",
      "Ataque y defensa por condición",
      "Enfrentamiento directo (H2H)",
      "Rivales en común",
    ]);
  });

  it("no recomienda una victoria simple cuando la proyección 1X2 no tiene consenso", () => {
    const ctx = context();
    const drawRecord = (id: string, venue: "local" | "visitante") =>
      record(id, venue, { result: "D", goalsFor: 1, goalsAgainst: 1 });
    ctx.homeRecords = Array.from({ length: 8 }, (_, index) => drawRecord(`home-draw-${index}`, "local"));
    ctx.awayRecords = Array.from({ length: 8 }, (_, index) => drawRecord(`away-draw-${index}`, "visitante"));

    const homeWin = evaluateAllMarkets(ctx, {}).find((market) => market.market.id === "result_home_win");

    expect(homeWin).toBeDefined();
    expect(homeWin!.statisticalEstimate).toBeLessThan(45);
    expect(homeWin!.recommendation).toBe("evitar");
    expect(homeWin!.confidence).toBeLessThanOrEqual(65);
    expect(homeWin!.contradictions).toContain("No hay una ventaja suficiente y consistente para recomendar una victoria simple.");
  });

  it("calculates goal and corner handicaps from team coverage and rival allowance", () => {
    const markets = evaluateAllMarkets(context(), {});
    const goalsHandicap = markets.find((evaluation) => evaluation.market.id === "goals_handicap_home_minus_15");
    const cornersWinner = markets.find((evaluation) => evaluation.market.id === "corners_home_most");
    const cornersHandicap = markets.find((evaluation) => evaluation.market.id === "corners_handicap_home_minus_15");

    expect(goalsHandicap?.statisticalEstimate).toBeGreaterThanOrEqual(85);
    expect(goalsHandicap?.probabilitySignals?.[0]?.value).toBe("100%");
    expect(cornersWinner?.statisticalEstimate).toBeGreaterThanOrEqual(85);
    expect(cornersWinner?.probabilitySignals?.[0]?.value).toBe("100%");
    expect(cornersHandicap?.statisticalEstimate).toBeGreaterThanOrEqual(85);
  });

  it("evaluates 1st half and 2nd half win and double chance markets", () => {
    const ctx = context();
    ctx.homeRecords = ctx.homeRecords.map((r) => ({
      ...r,
      goalsForFirstHalf: 1,
      goalsAgainstFirstHalf: 0,
      goalsForSecondHalf: 1,
      goalsAgainstSecondHalf: 0,
    }));
    ctx.awayRecords = ctx.awayRecords.map((r) => ({
      ...r,
      goalsForFirstHalf: 0,
      goalsAgainstFirstHalf: 1,
      goalsForSecondHalf: 0,
      goalsAgainstSecondHalf: 1,
    }));

    const markets = evaluateAllMarkets(ctx, {});
    const win1THome = markets.find((m) => m.market.id === "first_half_win_home");
    const dc1THome = markets.find((m) => m.market.id === "first_half_dc_home");
    const win2THome = markets.find((m) => m.market.id === "second_half_win_home");
    const dc2THome = markets.find((m) => m.market.id === "second_half_dc_home");
    const dcFullHome = markets.find((m) => m.market.id === "result_dc_home");

    expect(win1THome).toBeDefined();
    expect(win1THome!.statisticalEstimate).toBeGreaterThanOrEqual(80);
    expect(dc1THome).toBeDefined();
    expect(dc1THome!.statisticalEstimate).toBeGreaterThanOrEqual(80);
    expect(win2THome).toBeDefined();
    expect(win2THome!.statisticalEstimate).toBeGreaterThanOrEqual(80);
    expect(dc2THome).toBeDefined();
    expect(dc2THome!.statisticalEstimate).toBeGreaterThanOrEqual(80);
    expect(dcFullHome).toBeDefined();
    expect(dcFullHome!.statisticalEstimate).toBeGreaterThanOrEqual(70);
  });

  it("no recomienda un under de 1T con muestra corta y antecedentes de alta anotación", () => {
    const ctx = context();
    const volatileHistory = Array.from({ length: 10 }, (_, index) =>
      record(`volatile-${index}`, "local", {
        goalsForFirstHalf: index === 0 ? 2 : 1,
        goalsAgainstFirstHalf: index === 0 ? 2 : 0,
        goalsForSecondHalf: 1,
        goalsAgainstSecondHalf: 0,
      })
    );
    ctx.homeRecords = volatileHistory;
    ctx.awayRecords = volatileHistory.map((item, index) => ({ ...item, matchId: `away-volatile-${index}`, venue: "visitante" }));

    const under35 = evaluateAllMarkets(ctx, {}).find((market) => market.market.id === "first_half_under_35");
    expect(under35).toBeDefined();
    expect(under35!.sampleSize).toBe(10);
    expect(under35!.confidence).toBeLessThanOrEqual(70);
    expect(under35!.recommendation).toBe("evitar");
    expect(under35!.contradictions.some((message) => message.includes("Volatilidad alta"))).toBe(true);
  });

  it("evaluates team goal over and under markets for Home and Away", () => {
    const ctx = context();
    const markets = evaluateAllMarkets(ctx, {});

    const homeOver05 = markets.find((m) => m.market.id === "goals_home_over_05");
    const homeOver15 = markets.find((m) => m.market.id === "goals_home_over_15");
    const homeUnder05 = markets.find((m) => m.market.id === "goals_home_under_05");
    const homeUnder25 = markets.find((m) => m.market.id === "goals_home_under_25");
    const awayUnder15 = markets.find((m) => m.market.id === "goals_away_under_15");

    expect(homeOver05).toBeDefined();
    expect(homeOver05!.statisticalEstimate).toBeGreaterThanOrEqual(80);
    expect(homeOver15).toBeDefined();
    expect(homeOver15!.statisticalEstimate).toBeGreaterThanOrEqual(80);
    expect(homeUnder05).toBeDefined();
    expect(homeUnder05!.statisticalEstimate).toBeLessThan(30);
    expect(homeUnder25).toBeDefined();
    expect(homeUnder25!.statisticalEstimate).toBeGreaterThanOrEqual(80);
    expect(awayUnder15).toBeDefined();
    expect(awayUnder15!.statisticalEstimate).toBeGreaterThanOrEqual(80);
  });

  it("generates ALL markets with no NaN confidence and covers every category", () => {
    const ctx = context();
    const markets = evaluateAllMarkets(ctx, {});

    // Debe generar exactamente los 107 mercados definidos en data/markets.ts
    expect(markets.length).toBe(bettingMarkets.length);

    // Ningún mercado que cayó al catch
    const errorMarkets = markets.filter((m) => m.contradictions.includes("Error interno al evaluar este mercado."));
    expect(errorMarkets.length).toBe(0);

    // Ningún mercado debe tener NaN en confidence o statisticalEstimate
    const nanMarkets = markets.filter((m) => Number.isNaN(m.confidence) || Number.isNaN(m.statisticalEstimate));
    expect(nanMarkets.map((m) => m.market.id)).toEqual([]);

    // Todas las categorías deben estar representadas
    const categories = new Set(markets.map((m) => m.market.category));
    expect(categories).toContain("goles");
    expect(categories).toContain("corners");
    expect(categories).toContain("tarjetas");
    expect(categories).toContain("resultado");
    expect(categories).toContain("ambos_marcan");
    expect(categories).toContain("primera_parte");
    expect(categories).toContain("segunda_parte");
    expect(categories).toContain("equipo_local");
    expect(categories).toContain("equipo_visitante");

    // Verificar que tarjetas, primera parte y segunda parte tienen la cantidad correcta
    const tarjetas = markets.filter((m) => m.market.category === "tarjetas");
    expect(tarjetas.length).toBe(12);

    const primeraParte = markets.filter((m) => m.market.category === "primera_parte");
    expect(primeraParte.length).toBe(13);

    const segundaParte = markets.filter((m) => m.market.category === "segunda_parte");
    expect(segundaParte.length).toBe(13);
  });
});
