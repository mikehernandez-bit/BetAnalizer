import { API_FOOTBALL_BASE_URL, ApiFootballClient, type ApiFootballGateway } from "@/services/api-football";
import { readImportedFile } from "@/lib/match-package-store";
import {
  API_FOOTBALL_TIMEZONE,
  type ApiFootballFixtureCandidate,
  type ApiFootballImportInput,
  type ApiFootballImportResult,
  type ApiFootballMissingData,
  type ApiFootballProgress,
} from "@/lib/api-football-import-types";
import { packageSchema, type HistoryRecord, type ImportedFile, type MatchPackage, type Team } from "@/lib/validation/match-package";
import type { CompetitionType, ResultLetter } from "@/types";

const HISTORY_SIZE = 10;
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO"]);
// Nombres historicos que API-Football publica bajo su denominacion actual.
// Solo se usan para resolver la identidad del fixture; el JSON conserva el
// nombre real devuelto por la fuente.
const TEAM_NAME_ALIASES = new Map([["iberia 1999 tbilisi", "saburtalo"]]);
const REQUIRED_HISTORY_FIELDS = [
  "matchId",
  "date",
  "opponentId",
  "competitionId",
  "competitionType",
  "venue",
  "result",
  "goalsFor",
  "goalsAgainst",
  "goalsForFirstHalf",
  "goalsForSecondHalf",
  "goalsAgainstFirstHalf",
  "goalsAgainstSecondHalf",
  "cornersFor",
  "cornersAgainst",
  "shotsFor",
  "shotsAgainst",
  "shotsOnTargetFor",
  "shotsOnTargetAgainst",
  "possession",
  "yellowCards",
  "redCards",
  "yellowCardsAgainst",
  "redCardsAgainst",
  "resultStatus",
  "statsStatus",
  "note",
];

interface ApiFixture {
  fixture: {
    id: number;
    timestamp: number;
    date?: string;
    venue?: { id?: number | null; name?: string | null; city?: string | null } | null;
    status?: { short?: string | null; long?: string | null } | null;
  };
  league: {
    id: number;
    name?: string | null;
    country?: string | null;
    season?: number | null;
    round?: string | null;
    type?: string | null;
    standings?: boolean | null;
  };
  teams: {
    home: { id: number; name?: string | null };
    away: { id: number; name?: string | null };
  };
  goals?: { home?: number | null; away?: number | null } | null;
  score?: {
    halftime?: { home?: number | null; away?: number | null } | null;
    fulltime?: { home?: number | null; away?: number | null } | null;
  } | null;
}

interface ApiTeamResponse {
  team: {
    id: number;
    name?: string | null;
    code?: string | null;
    country?: string | null;
    founded?: number | null;
  };
  venue?: { name?: string | null } | null;
}

interface ApiStatistic {
  type?: string | null;
  value?: number | string | null;
}

interface ApiFixtureStatistics {
  team: { id: number; name?: string | null };
  statistics?: ApiStatistic[] | null;
}

interface ApiFixtureEvent {
  time?: { elapsed?: number | null; extra?: number | null } | null;
  team?: { id?: number | null } | null;
  type?: string | null;
  detail?: string | null;
}

interface ApiStandingRow {
  rank?: number | null;
  team?: { id?: number | null } | null;
  all?: {
    played?: number | null;
    win?: number | null;
    draw?: number | null;
    lose?: number | null;
    goals?: { for?: number | null; against?: number | null } | null;
  } | null;
  points?: number | null;
  form?: string | null;
}

interface ApiStandingsResponse {
  league?: { standings?: ApiStandingRow[][] | null } | null;
}

interface ApiLeagueResponse {
  league?: { id?: number | null; name?: string | null; type?: string | null } | null;
  country?: { name?: string | null } | null;
  seasons?: Array<{ year?: number | null; coverage?: { fixtures?: { statistics_fixtures?: boolean | null } | null; standings?: boolean | null } | null }> | null;
}

interface VerifiedStyle {
  primaryColor: string;
  secondaryColor: string;
}

interface VerifiedCompetitionStyle {
  color: string;
  tier: number;
  totalTeams: number;
}

interface VerifiedFallbacks {
  teamStyles: Map<string, VerifiedStyle>;
  competitionStyles: Map<string, VerifiedCompetitionStyle>;
}

interface BuildDependencies {
  api?: ApiFootballGateway;
  onProgress?: (progress: ApiFootballProgress) => void;
  readCurrentFile?: () => Promise<ImportedFile>;
}

function canonical(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(fc|cf|afc|sc|ac|cd|club|deportivo)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slug(value: string): string {
  return canonical(value).replace(/\s+/g, "-") || "sin-nombre";
}

function matchesApiTeamName(requestedName: string, apiName: string | null | undefined): boolean {
  const requested = canonical(requestedName);
  const api = canonical(apiName);
  return api === requested || api === TEAM_NAME_ALIASES.get(requested);
}

function apiId(kind: "fixture" | "team" | "league", value: number | string): string {
  return `api-${kind}-${String(value)}`;
}

function asInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value);
  return undefined;
}

function asPositiveInteger(value: unknown): number | undefined {
  const number = asInteger(value);
  return number && number > 0 ? number : undefined;
}

function asPercentage(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100) return value;
  if (typeof value === "string" && /^\d+(?:\.\d+)?%?$/.test(value.trim())) {
    const number = Number(value.trim().replace("%", ""));
    return number >= 0 && number <= 100 ? number : undefined;
  }
  return undefined;
}

function isHexColor(value: string | undefined): value is string {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value));
}

function formatTimestamp(timestamp: number): { date: string; time: string } {
  const date = new Date(timestamp * 1000);
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: API_FOOTBALL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: API_FOOTBALL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return {
    date: `${part(dateParts, "year")}-${part(dateParts, "month")}-${part(dateParts, "day")}`,
    time: `${part(timeParts, "hour")}:${part(timeParts, "minute")}`,
  };
}

function sourceUrl(endpoint: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(endpoint, API_FOOTBALL_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function fixtureCandidate(fixture: ApiFixture): ApiFootballFixtureCandidate {
  const scheduled = formatTimestamp(fixture.fixture.timestamp);
  return {
    fixtureId: fixture.fixture.id,
    homeTeam: fixture.teams.home.name ?? "Equipo local sin nombre",
    awayTeam: fixture.teams.away.name ?? "Equipo visitante sin nombre",
    competition: fixture.league.name ?? "Competicion sin nombre",
    country: fixture.league.country ?? "Sin pais",
    date: scheduled.date,
    time: scheduled.time,
    status: fixture.fixture.status?.long ?? fixture.fixture.status?.short ?? "Sin estado",
  };
}

function mapMatchStatus(status: string | null | undefined): "scheduled" | "live" | "finished" | "postponed" {
  if (FINISHED_STATUSES.has(status ?? "")) return "finished";
  if (["1H", "HT", "2H", "ET", "BT", "P", "INT", "LIVE"].includes(status ?? "")) return "live";
  if (["PST", "CANC", "ABD", "SUSP"].includes(status ?? "")) return "postponed";
  return "scheduled";
}

function mapCompetitionType(apiType: string | null | undefined, name: string | null | undefined): CompetitionType {
  if (apiType?.toLowerCase() === "league") return "league";
  const text = canonical(name);
  if (/(champions|libertadores|sudamericana|europa league|conference league|continental)/.test(text)) return "continental";
  if (/(cup|copa|coupe|trofeo)/.test(text)) return "cup";
  return "friendly";
}

function resultFor(goalsFor: number, goalsAgainst: number): ResultLetter {
  return goalsFor > goalsAgainst ? "W" : goalsFor === goalsAgainst ? "D" : "L";
}

function findStatistic(blocks: ApiFixtureStatistics[], teamId: number, name: string): number | undefined {
  const block = blocks.find((item) => item.team.id === teamId);
  const value = block?.statistics?.find((stat) => stat.type?.toLowerCase() === name.toLowerCase())?.value;
  return name === "Ball Possession" ? asPercentage(value) : asInteger(value);
}

function validGoalEvent(event: ApiFixtureEvent): boolean {
  if (event.type !== "Goal") return false;
  const detail = canonical(event.detail);
  return !detail.includes("missed penalty") && !detail.includes("cancelled");
}

function goalBreakdown(events: ApiFixtureEvent[], teamId: number, halftime: number, fulltime: number): { first: number; second: number } | undefined {
  const goals = events.filter(validGoalEvent);
  const first = goals.filter((event) => event.team?.id === teamId && (event.time?.elapsed ?? 0) <= 45).length;
  const second = goals.filter((event) => {
    const minute = event.time?.elapsed;
    return event.team?.id === teamId && typeof minute === "number" && minute > 45 && minute <= 90;
  }).length;
  if (first !== halftime || second !== fulltime - halftime) return undefined;
  return { first, second };
}

function flattenStandings(response: ApiStandingsResponse[]): ApiStandingRow[] {
  return response.flatMap((item) => item.league?.standings?.flat() ?? []);
}

function verifiedPackage(pkg: MatchPackage): boolean {
  return (
    pkg.dataQuality?.resultData === "verified" &&
    pkg.dataQuality.providedAdvancedStats === "provided" &&
    pkg.dataQuality.newAdvancedStats === "provided" &&
    (pkg.historyMeta?.estimatedFieldsForNewMatches?.length ?? 0) === 0
  );
}

function buildVerifiedFallbacks(file: ImportedFile): VerifiedFallbacks {
  const teamStyles = new Map<string, VerifiedStyle>();
  const competitionStyles = new Map<string, VerifiedCompetitionStyle>();
  for (const pkg of file.packages.filter(verifiedPackage)) {
    for (const team of pkg.teams) {
      if (isHexColor(team.primaryColor) && isHexColor(team.secondaryColor)) {
        teamStyles.set(canonical(team.name), { primaryColor: team.primaryColor, secondaryColor: team.secondaryColor });
      }
    }
    for (const competition of pkg.competitions) {
      if (isHexColor(competition.color)) {
        competitionStyles.set(`${canonical(competition.name)}|${canonical(competition.country)}`, {
          color: competition.color,
          tier: competition.tier,
          totalTeams: competition.totalTeams,
        });
      }
    }
  }
  return { teamStyles, competitionStyles };
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await mapper(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function missingFixture(fixture: ApiFixture, team: string, fields: string[]): ApiFootballMissingData {
  const timing = formatTimestamp(fixture.fixture.timestamp);
  const isHome = fixture.teams.home.name === team;
  return {
    fixtureId: fixture.fixture.id,
    team,
    opponent: isHome ? fixture.teams.away.name ?? undefined : fixture.teams.home.name ?? undefined,
    date: timing.date,
    fields,
  };
}

async function collectHistory(
  api: ApiFootballGateway,
  fixture: ApiFixture,
  teamId: number,
  teamName: string
): Promise<{ record?: HistoryRecord; issue?: ApiFootballMissingData; sources: string[] }> {
  const sourceParams = { fixture: fixture.fixture.id };
  const [statistics, events] = await Promise.all([
    api.get<ApiFixtureStatistics>("/fixtures/statistics", sourceParams),
    api.get<ApiFixtureEvent>("/fixtures/events", sourceParams),
  ]);
  const sources = [sourceUrl("/fixtures", { id: fixture.fixture.id }), sourceUrl("/fixtures/statistics", sourceParams), sourceUrl("/fixtures/events", sourceParams)];
  const homeId = fixture.teams.home.id;
  const isHome = homeId === teamId;
  const opponent = isHome ? fixture.teams.away : fixture.teams.home;
  const ownFinal = asInteger(fixture.score?.fulltime?.[isHome ? "home" : "away"]);
  const againstFinal = asInteger(fixture.score?.fulltime?.[isHome ? "away" : "home"]);
  const ownHalftime = asInteger(fixture.score?.halftime?.[isHome ? "home" : "away"]);
  const againstHalftime = asInteger(fixture.score?.halftime?.[isHome ? "away" : "home"]);

  const ownBreakdown = ownFinal !== undefined && ownHalftime !== undefined ? goalBreakdown(events, teamId, ownHalftime, ownFinal) : undefined;
  const againstBreakdown = againstFinal !== undefined && againstHalftime !== undefined ? goalBreakdown(events, opponent.id, againstHalftime, againstFinal) : undefined;
  const values = {
    cornersFor: findStatistic(statistics, teamId, "Corner Kicks"),
    cornersAgainst: findStatistic(statistics, opponent.id, "Corner Kicks"),
    shotsFor: findStatistic(statistics, teamId, "Total Shots"),
    shotsAgainst: findStatistic(statistics, opponent.id, "Total Shots"),
    shotsOnTargetFor: findStatistic(statistics, teamId, "Shots on Goal"),
    shotsOnTargetAgainst: findStatistic(statistics, opponent.id, "Shots on Goal"),
    possession: findStatistic(statistics, teamId, "Ball Possession"),
    yellowCards: findStatistic(statistics, teamId, "Yellow Cards"),
    redCards: findStatistic(statistics, teamId, "Red Cards"),
    yellowCardsAgainst: findStatistic(statistics, opponent.id, "Yellow Cards"),
    redCardsAgainst: findStatistic(statistics, opponent.id, "Red Cards"),
  };

  const missing = [
    ownFinal === undefined || againstFinal === undefined ? "fulltime score" : undefined,
    ownHalftime === undefined || againstHalftime === undefined ? "halftime score" : undefined,
    ownBreakdown === undefined || againstBreakdown === undefined ? "goal events / validated second-half goals" : undefined,
    ...Object.entries(values)
      .filter(([, value]) => value === undefined)
      .map(([field]) => field),
  ].filter((value): value is string => Boolean(value));
  if (missing.length > 0) return { issue: missingFixture(fixture, teamName, missing), sources };

  const timing = formatTimestamp(fixture.fixture.timestamp);
  const leagueId = asPositiveInteger(fixture.league.id);
  const season = asPositiveInteger(fixture.league.season);
  if (!leagueId || !season || !opponent.name) {
    return { issue: missingFixture(fixture, teamName, ["opponent or competition metadata"]), sources };
  }

  return {
    record: {
      matchId: apiId("fixture", fixture.fixture.id),
      date: timing.date,
      opponentId: apiId("team", opponent.id),
      competitionId: apiId("league", `${leagueId}-${season}`),
      competitionType: mapCompetitionType(fixture.league.type, fixture.league.name),
      venue: isHome ? "local" : "visitante",
      result: resultFor(ownFinal!, againstFinal!),
      goalsFor: ownFinal!,
      goalsAgainst: againstFinal!,
      goalsForFirstHalf: ownBreakdown!.first,
      goalsForSecondHalf: ownBreakdown!.second,
      goalsAgainstFirstHalf: againstBreakdown!.first,
      goalsAgainstSecondHalf: againstBreakdown!.second,
      cornersFor: values.cornersFor!,
      cornersAgainst: values.cornersAgainst!,
      shotsFor: values.shotsFor!,
      shotsAgainst: values.shotsAgainst!,
      shotsOnTargetFor: values.shotsOnTargetFor!,
      shotsOnTargetAgainst: values.shotsOnTargetAgainst!,
      possession: values.possession!,
      yellowCards: values.yellowCards!,
      redCards: values.redCards!,
      yellowCardsAgainst: values.yellowCardsAgainst!,
      redCardsAgainst: values.redCardsAgainst!,
      resultStatus: "verified",
      statsStatus: "provided",
      note: `API-Football fixture ${fixture.fixture.id}; statistics and events verified through API-Football.`,
    },
    sources,
  };
}

function selectedPreviousFixtures(fixtures: ApiFixture[], teamId: number, target: ApiFixture): ApiFixture[] {
  return fixtures
    .filter(
      (fixture) =>
        fixture.fixture.id !== target.fixture.id &&
        fixture.fixture.timestamp < target.fixture.timestamp &&
        FINISHED_STATUSES.has(fixture.fixture.status?.short ?? "") &&
        (fixture.teams.home.id === teamId || fixture.teams.away.id === teamId)
    )
    .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)
    .filter((fixture, index, all) => all.findIndex((item) => item.fixture.id === fixture.fixture.id) === index)
    .slice(0, HISTORY_SIZE);
}

function strictPackageIssues(pkg: MatchPackage): ApiFootballMissingData[] {
  const issues: ApiFootballMissingData[] = [];
  const parsed = packageSchema.safeParse(pkg);
  if (!parsed.success) {
    issues.push({ fields: parsed.error.issues.map((issue) => issue.path.join(".") || "package") });
  }
  const allRecords = Object.values(pkg.histories).flat();
  for (const [teamId, records] of Object.entries(pkg.histories)) {
    if (records.length !== HISTORY_SIZE) issues.push({ team: teamId, fields: [`exactly ${HISTORY_SIZE} historical matches`] });
    records.forEach((record, index) => {
      const missing = REQUIRED_HISTORY_FIELDS.filter((field) => record[field as keyof HistoryRecord] === undefined || record[field as keyof HistoryRecord] === null);
      if (record.resultStatus !== "verified") missing.push("resultStatus=verified");
      if (record.statsStatus !== "provided") missing.push("statsStatus=provided");
      if (index > 0 && record.date > records[index - 1].date) missing.push("date_desc order");
      if (missing.length > 0) issues.push({ fixtureId: Number(record.matchId.replace("api-fixture-", "")) || undefined, team: teamId, date: record.date, fields: missing });
    });
  }
  if (new Set(allRecords.map((record) => record.matchId)).size !== allRecords.length) {
    issues.push({ fields: ["duplicated fixture across histories"] });
  }
  if (pkg.dataQuality?.resultData !== "verified" || pkg.dataQuality.providedAdvancedStats !== "provided" || pkg.dataQuality.newAdvancedStats !== "provided") {
    issues.push({ fields: ["dataQuality must be fully verified/provided"] });
  }
  if (pkg.historyMeta?.estimatedFieldsForNewMatches?.length !== 0) issues.push({ fields: ["estimatedFieldsForNewMatches must be empty"] });
  const containsEstimatedValue = (value: unknown): boolean => {
    if (typeof value === "string") return value.toLowerCase().includes("estimated");
    if (Array.isArray(value)) return value.some(containsEstimatedValue);
    if (value && typeof value === "object") return Object.values(value).some(containsEstimatedValue);
    return false;
  };
  if (containsEstimatedValue(pkg)) issues.push({ fields: ["estimated is prohibited"] });
  return issues;
}

function preferredTeamCode(code: string | null | undefined): string | undefined {
  const normalized = code?.trim().toUpperCase();
  return normalized && /^[A-Z0-9]{2,4}$/.test(normalized) ? normalized : undefined;
}

function fieldOrIssue<T>(value: T | undefined, field: string, issues: string[]): T | undefined {
  if (value === undefined) issues.push(field);
  return value;
}

export async function buildApiFootballPackage(input: ApiFootballImportInput, dependencies: BuildDependencies = {}): Promise<ApiFootballImportResult> {
  const api = dependencies.api ?? new ApiFootballClient();
  const progress = (step: string, completed: number, total: number, homeCompleted?: number, awayCompleted?: number) =>
    dependencies.onProgress?.({ step, completed, total, homeCompleted, awayCompleted });
  const sourceUrls = new Set<string>();

  progress("Resolviendo equipos y buscando partido...", 0, 24);
  const [homeSearch, awaySearch, dayFixtures] = await Promise.all([
    api.get<ApiTeamResponse>("/teams", { search: input.homeTeam }, 24 * 60 * 60 * 1000),
    api.get<ApiTeamResponse>("/teams", { search: input.awayTeam }, 24 * 60 * 60 * 1000),
    input.fixtureId ? api.get<ApiFixture>("/fixtures", { id: input.fixtureId, timezone: API_FOOTBALL_TIMEZONE }, 10 * 60 * 1000) : api.get<ApiFixture>("/fixtures", { date: input.date, timezone: API_FOOTBALL_TIMEZONE }, 10 * 60 * 1000),
  ]);
  sourceUrls.add(sourceUrl("/teams", { search: input.homeTeam }));
  sourceUrls.add(sourceUrl("/teams", { search: input.awayTeam }));
  sourceUrls.add(sourceUrl("/fixtures", input.fixtureId ? { id: input.fixtureId, timezone: API_FOOTBALL_TIMEZONE } : { date: input.date, timezone: API_FOOTBALL_TIMEZONE }));

  const homeExactIds = new Set(homeSearch.filter((item) => canonical(item.team.name) === canonical(input.homeTeam)).map((item) => item.team.id));
  const awayExactIds = new Set(awaySearch.filter((item) => canonical(item.team.name) === canonical(input.awayTeam)).map((item) => item.team.id));
  const candidates = dayFixtures.filter((fixture) => {
    const timing = formatTimestamp(fixture.fixture.timestamp);
    const namesMatch = matchesApiTeamName(input.homeTeam, fixture.teams.home.name) && matchesApiTeamName(input.awayTeam, fixture.teams.away.name);
    const idsMatch = (homeExactIds.size === 0 || homeExactIds.has(fixture.teams.home.id)) && (awayExactIds.size === 0 || awayExactIds.has(fixture.teams.away.id));
    const competitionMatches = !input.competition || canonical(fixture.league.name).includes(canonical(input.competition));
    const timeMatches = !input.time || timing.time === input.time;
    return namesMatch && idsMatch && competitionMatches && timeMatches;
  });

  if (candidates.length !== 1) {
    return {
      kind: "ambiguous",
      message: candidates.length === 0 ? "No se encontro una coincidencia inequívoca. Revisa equipos, fecha, hora y competicion." : "Hay varios partidos posibles. Selecciona el fixture correcto antes de continuar.",
      candidates: candidates.map(fixtureCandidate),
    };
  }
  const target = candidates[0];
  progress("Partido encontrado. Obteniendo equipos, liga y tabla...", 2, 24);

  const targetLeagueId = asPositiveInteger(target.league.id);
  const targetSeason = asPositiveInteger(target.league.season);
  if (!targetLeagueId || !targetSeason) {
    return { kind: "incomplete", message: "Datos incompletos de API-Football.", issues: [missingFixture(target, target.teams.home.name ?? input.homeTeam, ["league id or season"])] };
  }

  const [homeDetails, awayDetails, standingsResponse, leagueResponse, importedFile] = await Promise.all([
    api.get<ApiTeamResponse>("/teams", { id: target.teams.home.id }, 24 * 60 * 60 * 1000),
    api.get<ApiTeamResponse>("/teams", { id: target.teams.away.id }, 24 * 60 * 60 * 1000),
    api.get<ApiStandingsResponse>("/standings", { league: targetLeagueId, season: targetSeason }, 30 * 60 * 1000),
    api.get<ApiLeagueResponse>("/leagues", { id: targetLeagueId, season: targetSeason }, 24 * 60 * 60 * 1000),
    (dependencies.readCurrentFile ?? readImportedFile)(),
  ]);
  sourceUrls.add(sourceUrl("/teams", { id: target.teams.home.id }));
  sourceUrls.add(sourceUrl("/teams", { id: target.teams.away.id }));
  sourceUrls.add(sourceUrl("/standings", { league: targetLeagueId, season: targetSeason }));
  sourceUrls.add(sourceUrl("/leagues", { id: targetLeagueId, season: targetSeason }));

  const [homePrevious, awayPrevious] = await Promise.all([
    api.get<ApiFixture>("/fixtures", { team: target.teams.home.id, last: 50, timezone: API_FOOTBALL_TIMEZONE }, 12 * 60 * 60 * 1000),
    api.get<ApiFixture>("/fixtures", { team: target.teams.away.id, last: 50, timezone: API_FOOTBALL_TIMEZONE }, 12 * 60 * 60 * 1000),
  ]);
  sourceUrls.add(sourceUrl("/fixtures", { team: target.teams.home.id, last: 50, timezone: API_FOOTBALL_TIMEZONE }));
  sourceUrls.add(sourceUrl("/fixtures", { team: target.teams.away.id, last: 50, timezone: API_FOOTBALL_TIMEZONE }));
  const homeFixtures = selectedPreviousFixtures(homePrevious, target.teams.home.id, target);
  const awayFixtures = selectedPreviousFixtures(awayPrevious, target.teams.away.id, target);
  const initialIssues: ApiFootballMissingData[] = [];
  if (homeFixtures.length !== HISTORY_SIZE) initialIssues.push({ team: target.teams.home.name ?? input.homeTeam, fields: [`${HISTORY_SIZE} previous finished fixtures (only ${homeFixtures.length} found)`] });
  if (awayFixtures.length !== HISTORY_SIZE) initialIssues.push({ team: target.teams.away.name ?? input.awayTeam, fields: [`${HISTORY_SIZE} previous finished fixtures (only ${awayFixtures.length} found)`] });
  if (initialIssues.length > 0) return { kind: "incomplete", message: "Datos incompletos de API-Football.", issues: initialIssues };

  progress("Obteniendo estadisticas verificadas del equipo local...", 4, 24, 0, 0);
  let homeCompleted = 0;
  const homeHistoryResults = await mapWithConcurrency(homeFixtures, 4, async (fixture) => {
    const result = await collectHistory(api, fixture, target.teams.home.id, target.teams.home.name ?? input.homeTeam);
    homeCompleted += 1;
    progress(`Local: ${homeCompleted}/${HISTORY_SIZE}`, 4 + homeCompleted, 24, homeCompleted, 0);
    return result;
  });

  progress("Obteniendo estadisticas verificadas del equipo visitante...", 14, 24, homeCompleted, 0);
  let awayCompleted = 0;
  const awayHistoryResults = await mapWithConcurrency(awayFixtures, 4, async (fixture) => {
    const result = await collectHistory(api, fixture, target.teams.away.id, target.teams.away.name ?? input.awayTeam);
    awayCompleted += 1;
    progress(`Visitante: ${awayCompleted}/${HISTORY_SIZE}`, 14 + awayCompleted, 24, homeCompleted, awayCompleted);
    return result;
  });

  const historyIssues = [...homeHistoryResults, ...awayHistoryResults].flatMap((result) => (result.issue ? [result.issue] : []));
  for (const result of [...homeHistoryResults, ...awayHistoryResults]) result.sources.forEach((url) => sourceUrls.add(url));
  if (historyIssues.length > 0) return { kind: "incomplete", message: "Datos incompletos de API-Football.", issues: historyIssues };
  const homeHistory = homeHistoryResults.map((item) => item.record!).sort((a, b) => b.date.localeCompare(a.date));
  const awayHistory = awayHistoryResults.map((item) => item.record!).sort((a, b) => b.date.localeCompare(a.date));

  progress("Validando datos del paquete...", 22, 24, homeCompleted, awayCompleted);
  const fallbacks = buildVerifiedFallbacks(importedFile);
  const standings = flattenStandings(standingsResponse);
  const homeStanding = standings.find((row) => row.team?.id === target.teams.home.id);
  const awayStanding = standings.find((row) => row.team?.id === target.teams.away.id);
  const homeInfo = homeDetails.find((item) => item.team.id === target.teams.home.id);
  const awayInfo = awayDetails.find((item) => item.team.id === target.teams.away.id);
  const targetTiming = formatTimestamp(target.fixture.timestamp);
  const targetCompetitionName = target.league.name?.trim();
  const targetCountry = target.league.country?.trim();
  const targetVenue = target.fixture.venue?.name?.trim();
  const visualCompetition = fallbacks.competitionStyles.get(`${canonical(targetCompetitionName)}|${canonical(targetCountry)}`);
  const metadataIssues: ApiFootballMissingData[] = [];

  const buildTeam = (apiTeam: ApiTeamResponse | undefined, standing: ApiStandingRow | undefined, history: HistoryRecord[], fixtureTeam: ApiFixture["teams"]["home"]): Team | undefined => {
    const fields: string[] = [];
    const style = fallbacks.teamStyles.get(canonical(apiTeam?.team.name ?? fixtureTeam.name));
    const name = fieldOrIssue(apiTeam?.team.name?.trim() || undefined, "team.name", fields);
    const code = fieldOrIssue(preferredTeamCode(apiTeam?.team.code), "team.code", fields);
    const country = fieldOrIssue(apiTeam?.team.country?.trim() || undefined, "team.country", fields);
    const stadium = fieldOrIssue(apiTeam?.venue?.name?.trim() || undefined, "team.venue.name", fields);
    const founded = fieldOrIssue(asPositiveInteger(apiTeam?.team.founded), "team.founded", fields);
    const position = fieldOrIssue(asPositiveInteger(standing?.rank), "standings.rank", fields);
    const played = fieldOrIssue(asInteger(standing?.all?.played), "standings.played", fields);
    const won = fieldOrIssue(asInteger(standing?.all?.win), "standings.win", fields);
    const drawn = fieldOrIssue(asInteger(standing?.all?.draw), "standings.draw", fields);
    const lost = fieldOrIssue(asInteger(standing?.all?.lose), "standings.lose", fields);
    const goalsFor = fieldOrIssue(asInteger(standing?.all?.goals?.for), "standings.goals.for", fields);
    const goalsAgainst = fieldOrIssue(asInteger(standing?.all?.goals?.against), "standings.goals.against", fields);
    const points = fieldOrIssue(asInteger(standing?.points), "standings.points", fields);
    if (!style) fields.push("primaryColor and secondaryColor (API-Football does not publish colours and no previous fully verified package exists)");
    if (fields.length > 0) {
      metadataIssues.push({ team: fixtureTeam.name ?? undefined, fields });
      return undefined;
    }
    const calculatedForm = history.slice(0, 5).map((record) => record.result);
    const average = (field: "goalsFor" | "goalsAgainst" | "cornersFor") => Number((history.reduce((sum, record) => sum + record[field], 0) / history.length).toFixed(2));
    return {
      id: apiId("team", fixtureTeam.id),
      name: name!,
      shortName: name!,
      code: code!,
      country: country!,
      competitionId: apiId("league", `${targetLeagueId}-${targetSeason}`),
      stadium: stadium!,
      founded: founded!,
      primaryColor: style!.primaryColor,
      secondaryColor: style!.secondaryColor,
      position: position!,
      played: played!,
      won: won!,
      drawn: drawn!,
      lost: lost!,
      goalsFor: goalsFor!,
      goalsAgainst: goalsAgainst!,
      points: points!,
      form: calculatedForm,
      avgGoalsFor: average("goalsFor"),
      avgGoalsAgainst: average("goalsAgainst"),
      avgCorners: average("cornersFor"),
    };
  };

  const homeTeam = buildTeam(homeInfo, homeStanding, homeHistory, target.teams.home);
  const awayTeam = buildTeam(awayInfo, awayStanding, awayHistory, target.teams.away);
  const matchday = target.league.round?.match(/\d+/)?.[0];
  if (!targetCompetitionName) metadataIssues.push({ fixtureId: target.fixture.id, fields: ["league.name"] });
  if (!targetCountry) metadataIssues.push({ fixtureId: target.fixture.id, fields: ["league.country"] });
  if (!matchday || Number(matchday) <= 0) metadataIssues.push({ fixtureId: target.fixture.id, fields: ["league.round / matchday"] });
  if (!visualCompetition) metadataIssues.push({ fixtureId: target.fixture.id, fields: ["competition color and tier (API-Football does not publish them and no previous fully verified package exists)"] });
  if (!targetVenue) metadataIssues.push({ fixtureId: target.fixture.id, fields: ["fixture.venue.name"] });
  if (metadataIssues.length > 0 || !homeTeam || !awayTeam || !visualCompetition) {
    return { kind: "incomplete", message: "Datos incompletos de API-Football.", issues: metadataIssues };
  }

  // Las comprobaciones anteriores evitan construir un JSON con un dato de
  // interfaz inventado. TypeScript no puede deducirlo desde metadataIssues.
  if (!targetCompetitionName || !targetCountry || !targetVenue) {
    return { kind: "incomplete", message: "Datos incompletos de API-Football.", issues: metadataIssues };
  }

  const packageId = `${slug(homeTeam.name)}-vs-${slug(awayTeam.name)}-${targetTiming.date}`;
  const pkg: MatchPackage = {
    id: packageId,
    researchedAt: new Date().toISOString(),
    sourceUrls: [...sourceUrls].sort(),
    competitions: [
      {
        id: apiId("league", `${targetLeagueId}-${targetSeason}`),
        name: targetCompetitionName,
        shortName: targetCompetitionName,
        country: targetCountry,
        tier: visualCompetition.tier,
        season: String(targetSeason),
        color: visualCompetition.color,
        totalTeams: standings.length || visualCompetition.totalTeams,
      },
    ],
    teams: [homeTeam, awayTeam],
    match: {
      id: apiId("fixture", target.fixture.id),
      competitionId: apiId("league", `${targetLeagueId}-${targetSeason}`),
      competitionType: mapCompetitionType(target.league.type ?? leagueResponse[0]?.league?.type, targetCompetitionName),
      season: String(targetSeason),
      matchday: Number(matchday),
      date: targetTiming.date,
      time: targetTiming.time,
      stadium: targetVenue,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: mapMatchStatus(target.fixture.status?.short),
    },
    histories: { [homeTeam.id]: homeHistory, [awayTeam.id]: awayHistory },
    dataQuality: {
      resultData: "verified",
      providedAdvancedStats: "provided",
      newAdvancedStats: "provided",
      warning: "Todos los datos de este paquete fueron obtenidos y validados mediante API-Football.",
    },
    historyMeta: {
      matchesPerTeam: HISTORY_SIZE,
      newMatchesPerTeam: HISTORY_SIZE,
      sortOrder: "date_desc",
      verifiedFieldsForNewMatches: REQUIRED_HISTORY_FIELDS,
      estimatedFieldsForNewMatches: [],
    },
  };
  const strictIssues = strictPackageIssues(pkg);
  if (strictIssues.length > 0) return { kind: "incomplete", message: "El paquete no paso la validacion estricta.", issues: strictIssues };

  progress("Paquete completo y validado.", 24, 24, HISTORY_SIZE, HISTORY_SIZE);
  return {
    kind: "complete",
    package: pkg,
    file: { version: 1, packages: [pkg] },
    summary: {
      fixtureId: target.fixture.id,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      competition: targetCompetitionName,
      homeHistoryCount: homeHistory.length,
      awayHistoryCount: awayHistory.length,
      sourceCount: sourceUrls.size,
    },
  };
}
