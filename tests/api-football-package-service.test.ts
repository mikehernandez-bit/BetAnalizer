import { describe, expect, it } from "vitest";
import { buildApiFootballPackage } from "@/services/api-football-package-service";
import type { ApiFootballGateway } from "@/services/api-football";
import type { ImportedFile } from "@/lib/validation/match-package";
import { makeValidPackage } from "./fixtures";

const targetTimestamp = Math.floor(new Date("2026-08-10T19:00:00.000Z").getTime() / 1000);

function fixture(id: number, timestamp: number, homeId: number, awayId: number, homeName: string, awayName: string, status = "FT") {
  return {
    fixture: { id, timestamp, venue: { name: "Test Stadium" }, status: { short: status, long: status === "FT" ? "Match Finished" : "Not Started" } },
    league: { id: 99, name: "Test League", country: "Testland", season: 2026, round: "Regular Season - 1", type: "League", standings: true },
    teams: { home: { id: homeId, name: homeName }, away: { id: awayId, name: awayName } },
    goals: { home: 1, away: 0 },
    score: { halftime: { home: 0, away: 0 }, fulltime: { home: 1, away: 0 } },
  };
}

function stats(homeId: number, awayId: number) {
  const line = (possession: string) => [
    { type: "Corner Kicks", value: 4 },
    { type: "Total Shots", value: 10 },
    { type: "Shots on Goal", value: 4 },
    { type: "Ball Possession", value: possession },
    { type: "Yellow Cards", value: 0 },
    { type: "Red Cards", value: 0 },
  ];
  return [
    { team: { id: homeId }, statistics: line("55%") },
    { team: { id: awayId }, statistics: line("45%") },
  ];
}

function verifiedFallbacks(): ImportedFile {
  const pkg = makeValidPackage({
    dataQuality: { resultData: "verified", providedAdvancedStats: "provided", newAdvancedStats: "provided", warning: "Verified." },
    historyMeta: { matchesPerTeam: 10, newMatchesPerTeam: 10, sortOrder: "date_desc", verifiedFieldsForNewMatches: [], estimatedFieldsForNewMatches: [] },
  });
  pkg.teams = [
    { ...pkg.teams[0], name: "Home Club", primaryColor: "#112233", secondaryColor: "#FFFFFF" },
    { ...pkg.teams[1], name: "Away Club", primaryColor: "#445566", secondaryColor: "#FFFFFF" },
  ];
  pkg.competitions = [{ ...pkg.competitions[0], name: "Test League", country: "Testland", color: "#0A8F44", tier: 1, totalTeams: 2 }];
  return { version: 1, packages: [pkg] };
}

function fakeGateway(options: { omitStatistics?: boolean; ambiguous?: boolean } = {}): ApiFootballGateway {
  const target = fixture(500, targetTimestamp, 1, 2, "Home Club", "Away Club", "NS");
  const homeHistory = Array.from({ length: 10 }, (_, index) => fixture(100 + index, targetTimestamp - (index + 1) * 86_400, 1, 1000 + index, "Home Club", `Home Rival ${index}`));
  const awayHistory = Array.from({ length: 10 }, (_, index) => fixture(200 + index, targetTimestamp - (index + 1) * 86_400, 2000 + index, 2, `Away Rival ${index}`, "Away Club"));

  return {
    async get<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<T[]> {
      if (endpoint === "/teams" && params.search === "Home Club") return [{ team: { id: 1, name: "Home Club" } }] as T[];
      if (endpoint === "/teams" && params.search === "Away Club") return [{ team: { id: 2, name: "Away Club" } }] as T[];
      if (endpoint === "/teams" && params.id === 1) return [{ team: { id: 1, name: "Home Club", code: "HOM", country: "Testland", founded: 1901 }, venue: { name: "Home Stadium" } }] as T[];
      if (endpoint === "/teams" && params.id === 2) return [{ team: { id: 2, name: "Away Club", code: "AWY", country: "Testland", founded: 1902 }, venue: { name: "Away Stadium" } }] as T[];
      if (endpoint === "/fixtures" && params.date) return (options.ambiguous ? [target, { ...target, fixture: { ...target.fixture, id: 501 } }] : [target]) as T[];
      if (endpoint === "/fixtures" && params.team === 1) return homeHistory as T[];
      if (endpoint === "/fixtures" && params.team === 2) return awayHistory as T[];
      if (endpoint === "/fixtures/statistics") {
        if (options.omitStatistics) return [] as T[];
        const item = [...homeHistory, ...awayHistory].find((history) => history.fixture.id === params.fixture)!;
        return stats(item.teams.home.id, item.teams.away.id) as T[];
      }
      if (endpoint === "/fixtures/events") {
        const item = [...homeHistory, ...awayHistory].find((history) => history.fixture.id === params.fixture)!;
        return [{ time: { elapsed: 60 }, team: { id: item.teams.home.id }, type: "Goal", detail: "Normal Goal" }] as T[];
      }
      if (endpoint === "/standings") {
        return [
          {
            league: {
              standings: [
                [
                  { rank: 1, team: { id: 1 }, all: { played: 1, win: 1, draw: 0, lose: 0, goals: { for: 1, against: 0 } }, points: 3, form: "W" },
                  { rank: 2, team: { id: 2 }, all: { played: 1, win: 0, draw: 0, lose: 1, goals: { for: 0, against: 1 } }, points: 0, form: "L" },
                ],
              ],
            },
          },
        ] as T[];
      }
      if (endpoint === "/leagues") return [{ league: { id: 99, type: "League" } }] as T[];
      throw new Error(`Unexpected API call ${endpoint} ${JSON.stringify(params)}`);
    },
  };
}

describe("API-Football package builder", () => {
  const input = { homeTeam: "Home Club", awayTeam: "Away Club", date: "2026-08-10" };

  it("creates a complete package only when all required statistics are returned", async () => {
    const result = await buildApiFootballPackage(input, { api: fakeGateway(), readCurrentFile: async () => verifiedFallbacks() });

    expect(result.kind).toBe("complete");
    if (result.kind === "complete") {
      expect(result.file.version).toBe(1);
      expect(result.file.packages).toHaveLength(1);
      expect(result.package.histories["api-team-1"]).toHaveLength(10);
      expect(result.package.histories["api-team-2"]).toHaveLength(10);
      expect(result.package.dataQuality?.newAdvancedStats).toBe("provided");
      expect(result.package.historyMeta?.estimatedFieldsForNewMatches).toEqual([]);
      expect(result.package.sourceUrls.some((url) => url.includes("fixtures/statistics"))).toBe(true);
    }
  });

  it("blocks the JSON when API-Football omits a required statistic", async () => {
    const result = await buildApiFootballPackage(input, { api: fakeGateway({ omitStatistics: true }), readCurrentFile: async () => verifiedFallbacks() });

    expect(result.kind).toBe("incomplete");
    if (result.kind === "incomplete") {
      expect(result.issues.some((issue) => issue.fields.includes("cornersFor"))).toBe(true);
      expect("package" in result).toBe(false);
    }
  });

  it("does not choose the first fixture when the match is ambiguous", async () => {
    const result = await buildApiFootballPackage(input, { api: fakeGateway({ ambiguous: true }), readCurrentFile: async () => verifiedFallbacks() });

    expect(result.kind).toBe("ambiguous");
    if (result.kind === "ambiguous") expect(result.candidates).toHaveLength(2);
  });
});
