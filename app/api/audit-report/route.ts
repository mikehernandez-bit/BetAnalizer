import { scanThreeDayAuditMatches, HistoryRiskTier } from "@/lib/bet-records";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const tiers: HistoryRiskTier[] = ["ultra", "balanced", "all"];
  const result: Record<string, unknown> = {};

  for (const tier of tiers) {
    const summary = scanThreeDayAuditMatches("2026-08-26", tier);
    const yesterdayMatches = summary.matches.filter((m) => m.date === "2026-08-25" && Boolean(m.outcome));
    const todayMatches = summary.matches.filter((m) => m.date === "2026-08-26" && Boolean(m.outcome));

    const calc = (list: typeof summary.matches) => {
      let hits = 0;
      let fails = 0;
      let totalBets = 0;
      const details = list.map((m) => {
        hits += m.hits;
        fails += m.failures;
        totalBets += m.totalBets;
        return {
          id: m.matchId,
          match: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
          score: `${m.outcome?.homeGoals}-${m.outcome?.awayGoals} (1T: ${m.outcome?.homeGoalsFirstHalf ?? 0}-${m.outcome?.awayGoalsFirstHalf ?? 0})`,
          hits: m.hits,
          failures: m.failures,
          totalBets: m.totalBets,
          bets: m.qualifyingBets.map((b) => ({
            name: b.marketName,
            status: b.status,
            probability: b.probability,
            confidence: b.confidence,
            note: b.settlementNote,
          })),
        };
      });
      return {
        matchesCount: list.length,
        hits,
        failures: fails,
        totalBets,
        accuracy: totalBets > 0 ? Math.round((hits / totalBets) * 100) : 0,
        details,
      };
    };

    result[tier] = {
      global: {
        lifetimeMatches: summary.stats.lifetimeMatches,
        lifetimeAuditedBets: summary.stats.lifetimeAuditedBets,
        lifetimeHits: summary.stats.lifetimeHits,
        lifetimeFailures: summary.stats.lifetimeFailures,
        lifetimeAccuracyRate: summary.stats.lifetimeAccuracyRate,
      },
      yesterday: calc(yesterdayMatches),
      today: calc(todayMatches),
    };
  }

  return Response.json({ success: true, ...result });
}