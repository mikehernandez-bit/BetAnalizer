import { describe, expect, it } from "vitest";
import type { RecordedMatchOutcome, TicketWinnerPrediction } from "@/types";
import { buildMarketReliability, buildResultCalibration, PredictionSnapshot } from "@/lib/model-feedback";

function prediction(home: number, draw: number, away: number): TicketWinnerPrediction {
  const leader = Math.max(home, draw, away);
  return {
    outcome: leader === home ? "local" : leader === away ? "visitante" : "empate",
    label: leader === home ? "Local" : leader === away ? "Visitante" : "Empate",
    probability: leader,
    homeWinProbability: home,
    drawProbability: draw,
    awayWinProbability: away,
  };
}

function snapshot(id: string, result: TicketWinnerPrediction, createdAt = "2026-08-01T10:00:00.000Z"): PredictionSnapshot {
  return {
    matchId: id,
    modelVersion: "test",
    createdAt,
    kickoffAt: "2026-08-01T20:00:00.000Z",
    winnerPrediction: result,
    selections: [],
  };
}

function outcome(homeGoals: number, awayGoals: number, recordedAt = "2026-08-01T23:00:00.000Z"): RecordedMatchOutcome {
  return { homeGoals, awayGoals, recordedAt };
}

describe("model feedback without data leakage", () => {
  it("requires five settlements and regularizes market reliability", () => {
    const profile = buildMarketReliability([
      ...Array.from({ length: 4 }, () => ({ marketId: "goals_over_25", probability: 80, fulfilled: false })),
      { marketId: "goals_over_25", probability: 80, fulfilled: true },
      { marketId: "single", probability: 90, fulfilled: false },
    ]);

    expect(profile.single).toBeUndefined();
    expect(profile.goals_over_25).toMatchObject({ sampleSize: 5, hits: 1, accuracyRate: 20 });
    expect(profile.goals_over_25.probabilityMultiplier).toBeGreaterThanOrEqual(0.8);
  });

  it("does not calibrate with fewer than five valid pre-match predictions", () => {
    const snapshots = Object.fromEntries(
      Array.from({ length: 4 }, (_, index) => [`m${index}`, snapshot(`m${index}`, prediction(50, 25, 25))])
    );
    const outcomes = Object.fromEntries(Array.from({ length: 4 }, (_, index) => [`m${index}`, outcome(1, 0)]));
    expect(buildResultCalibration(snapshots, outcomes)).toBeUndefined();
  });

  it("learns a bounded draw correction and reports proper audit metrics", () => {
    const snapshots = Object.fromEntries(
      Array.from({ length: 10 }, (_, index) => [`m${index}`, snapshot(`m${index}`, prediction(55, 20, 25))])
    );
    const outcomes = Object.fromEntries(
      Array.from({ length: 10 }, (_, index) => [`m${index}`, index < 6 ? outcome(1, 1) : outcome(1, 0)])
    );
    const profile = buildResultCalibration(snapshots, outcomes, "2026-08-02T00:00:00.000Z");

    expect(profile?.sampleSize).toBe(10);
    expect(profile?.winnerHits).toBe(4);
    expect(profile?.winnerAccuracyRate).toBe(40);
    expect(profile?.drawMultiplier).toBeGreaterThan(1);
    expect(profile?.drawMultiplier).toBeLessThanOrEqual(1.25);
    expect(profile?.brierScore).toBeGreaterThan(0);
  });

  it("rejects predictions created after kickoff or after the result was recorded", () => {
    const snapshots = Object.fromEntries(
      Array.from({ length: 6 }, (_, index) => [
        `m${index}`,
        snapshot(`m${index}`, prediction(50, 25, 25), index === 0 ? "2026-08-01T21:00:00.000Z" : "2026-08-01T10:00:00.000Z"),
      ])
    );
    const outcomes = Object.fromEntries(Array.from({ length: 6 }, (_, index) => [`m${index}`, outcome(1, 0)]));
    const profile = buildResultCalibration(snapshots, outcomes);
    expect(profile?.sampleSize).toBe(5);
  });

  it("accepts manual-result reconstructions so historical outcomes can be settled", () => {
    const snapshots = Object.fromEntries(
      Array.from({ length: 5 }, (_, index) => [
        `m${index}`,
        {
          ...snapshot(`m${index}`, prediction(55, 20, 25), "2026-08-02T01:00:00.000Z"),
          origin: "manual_result" as const,
        },
      ])
    );
    const outcomes = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [`m${index}`, outcome(1, 0)]));

    expect(buildResultCalibration(snapshots, outcomes)?.sampleSize).toBe(5);
  });
});
