import { describe, expect, it } from "vitest";
import { parseFootballOutcomeFile } from "@/lib/football-outcome-store";

describe("football outcome file storage", () => {
  it("validates and parses correct football outcomes file", () => {
    const valid = {
      version: 1,
      outcomes: {
        "fulham-vs-chelsea-2026-08-24": {
          homeGoals: 2,
          awayGoals: 3,
          homeGoalsFirstHalf: 1,
          awayGoalsFirstHalf: 1,
          recordedAt: "2026-08-25T12:00:00.000Z",
        },
      },
    };
    const parsed = parseFootballOutcomeFile(valid);
    expect(parsed.version).toBe(1);
    expect(parsed.outcomes["fulham-vs-chelsea-2026-08-24"]).toBeDefined();
    expect(parsed.outcomes["fulham-vs-chelsea-2026-08-24"].homeGoals).toBe(2);
    expect(parsed.outcomes["fulham-vs-chelsea-2026-08-24"].awayGoals).toBe(3);
  });

  it("rejects invalid schema or missing version", () => {
    expect(() => parseFootballOutcomeFile(null)).toThrow();
    expect(() => parseFootballOutcomeFile({ version: 2, outcomes: {} })).toThrow();
    expect(() => parseFootballOutcomeFile({ version: 1, outcomes: { "bad-match": { homeGoals: "invalid" } } })).toThrow();
  });
});