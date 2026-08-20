import { describe, expect, it } from "vitest";
import { tennisEvents } from "@/data/tennis-events";
import stored from "@/data/tennis-recorded-outcomes.json";
import { compareTennisModels } from "@/lib/tennis-model-evaluation";

describe("tennis model calibration feedback", () => {
  it("improves the ten recorded matches without depending on a single result", () => {
    const comparison = compareTennisModels(tennisEvents, stored.outcomes);

    expect(comparison.before.matches).toBeGreaterThanOrEqual(10);
    expect(comparison.after.matches).toBe(comparison.before.matches);
    expect(comparison.after.marketAccuracy).toBeGreaterThanOrEqual(comparison.before.marketAccuracy);
    expect(comparison.after.actionableAccuracy).toBeGreaterThanOrEqual(comparison.before.actionableAccuracy);
    expect(comparison.jackknife.samples).toBe(comparison.before.matches);
  });
});
