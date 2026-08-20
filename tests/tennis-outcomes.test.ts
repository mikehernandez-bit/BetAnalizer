import { describe, expect, it } from "vitest";
import { auditTennisMarkets, summarizeTennisMarketAudits, summarizeTennisPredictions } from "@/lib/tennis-outcomes";
import { analyzeTennisMatch } from "@/services/tennis-analysis-service";
import { tennisEvents } from "@/data/tennis-events";

describe("tennis result auditing", () => {
  it("counts hits, misses and pending predictions from recorded winners", () => {
    expect(summarizeTennisPredictions([
      { id: "a", predictedWinner: "Borges", outcome: { winner: "Borges" } },
      { id: "b", predictedWinner: "Medvedev", outcome: { winner: "Nakashima" } },
      { id: "c", predictedWinner: "Svitolina" },
    ])).toEqual({ audited: 2, hits: 1, misses: 1, pending: 1, accuracy: 50 });
  });

  it("does not invent accuracy before a result is recorded", () => {
    expect(summarizeTennisPredictions([{ id: "a", predictedWinner: "Borges" }])).toEqual({
      audited: 0,
      hits: 0,
      misses: 0,
      pending: 1,
      accuracy: 0,
    });
  });

  it("audits all 17 tennis markets from the final score", () => {
    const event = tennisEvents[0];
    const analysis = analyzeTennisMatch(event.input);
    const audits = auditTennisMarkets(analysis, {
      id: event.id,
      winner: "Nuno Borges",
      score: "6-3 6-4",
      recordedAt: "2026-08-18T12:00:00Z",
    });

    expect(audits).toHaveLength(17);
    expect(audits.every((item) => item.status === "hit" || item.status === "miss")).toBe(true);
    expect(audits.find((item) => item.marketId === "match-winner")?.status).toBe("hit");
    expect(audits.find((item) => item.marketId === "correct-match-score")?.actual).toBe("Nuno Borges gana 2-0");
    const summary = summarizeTennisMarketAudits(audits, 34);
    expect(summary.audited).toBe(17);
    expect(summary.hits + summary.misses).toBe(17);
    expect(summary.pending).toBe(34);
  });
});
