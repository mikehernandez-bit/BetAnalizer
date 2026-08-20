import { describe, expect, it } from "vitest";
import { tennisEvents } from "@/data/tennis-events";
import stored from "@/data/tennis-recorded-outcomes.json";
import { compareTennisModels } from "@/lib/tennis-model-evaluation";

describe("tennis model calibration feedback", () => {
  it("improves the ten recorded matches without depending on a single result", () => {
    const comparison = compareTennisModels(tennisEvents, stored.outcomes);

    expect(comparison.before).toMatchObject({
      matches: 10,
      winnerHits: 9,
      winnerAccuracy: 90,
      marketHits: 95,
      marketTotal: 170,
      marketAccuracy: 56,
      actionableHits: 70,
      actionableTotal: 103,
      actionableAccuracy: 68,
    });
    expect(comparison.after).toMatchObject({
      matches: 10,
      winnerHits: 10,
      winnerAccuracy: 100,
      marketHits: 120,
      marketTotal: 170,
      marketAccuracy: 71,
      actionableHits: 70,
      actionableTotal: 82,
      actionableAccuracy: 85,
    });
    expect(comparison.delta).toEqual({ winnerAccuracy: 10, marketAccuracy: 15, actionableAccuracy: 17 });
    expect(comparison.jackknife.samples).toBe(10);
    expect(comparison.jackknife.minMarketDelta).toBeGreaterThan(0);
    expect(comparison.jackknife.minActionableDelta).toBeGreaterThan(0);
  });
});
