import type {
  TennisAnalysis,
  TennisCommonOpponentComparison,
  TennisHeadToHeadSummary,
  TennisHistoryMatch,
  TennisMarketPrediction,
  TennisMatchInput,
  TennisMatchStatus,
  TennisModelVersion,
  TennisPlayerInput,
  TennisPlayerProfile,
  TennisSetScore,
  TennisSurface,
} from "@/types/tennis";

const SURFACE_ALIASES: Record<string, TennisSurface> = {
  dura: "hard",
  hard: "hard",
  arcilla: "clay",
  clay: "clay",
  cesped: "grass",
  césped: "grass",
  grass: "grass",
  indoor: "indoor",
  cubierta: "indoor",
  carpet: "carpet",
  moqueta: "carpet",
};

const STATUS_ALIASES: Record<string, TennisMatchStatus> = {
  completado: "completed",
  completed: "completed",
  final: "completed",
  ret: "retired",
  retired: "retired",
  retiro: "retired",
  abandono: "retired",
  wo: "walkover",
  w_o: "walkover",
  walkover: "walkover",
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value);
const rate = (hits: number, total: number, fallback = 0.5) => (total > 0 ? hits / total : fallback);

function parseSurface(value: string): TennisSurface | undefined {
  return SURFACE_ALIASES[value.trim().toLocaleLowerCase("es")];
}

function parseStatus(value?: string): TennisMatchStatus {
  if (!value?.trim()) return "completed";
  return STATUS_ALIASES[value.trim().toLocaleLowerCase("es").replaceAll("/", "_")] ?? "completed";
}

function parseSets(value: string): TennisSetScore[] | undefined {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return undefined;
  const sets: TennisSetScore[] = [];
  for (const token of tokens) {
    const match = token.match(/^(\d{1,2})(?:\((\d{1,2})\))?-(\d{1,2})(?:\((\d{1,2})\))?$/);
    if (!match) return undefined;
    const playerGames = Number(match[1]);
    const opponentGames = Number(match[3]);
    if (playerGames === opponentGames) return undefined;
    let playerTiebreakPoints = match[2] ? Number(match[2]) : undefined;
    let opponentTiebreakPoints = match[4] ? Number(match[4]) : undefined;
    if (Math.abs(playerGames - opponentGames) === 1 && (playerGames === 7 || opponentGames === 7)) {
      const suppliedPoints = [playerTiebreakPoints, opponentTiebreakPoints].filter((points) => points !== undefined);
      if (suppliedPoints.length === 1) {
        const loserPoints = suppliedPoints[0];
        const winnerPoints = Math.max(7, loserPoints + 2);
        playerTiebreakPoints = playerGames < opponentGames ? loserPoints : winnerPoints;
        opponentTiebreakPoints = opponentGames < playerGames ? loserPoints : winnerPoints;
      }
    }
    sets.push({ playerGames, opponentGames, playerTiebreakPoints, opponentTiebreakPoints });
  }
  return sets;
}

function surfaceInputLabel(surface: TennisSurface): string {
  return { hard: "Dura", clay: "Arcilla", grass: "Césped", indoor: "Indoor", carpet: "Moqueta" }[surface];
}

function setInputScore(set: TennisSetScore): string {
  const playerTiebreak = set.playerTiebreakPoints === undefined ? "" : `(${set.playerTiebreakPoints})`;
  const opponentTiebreak = set.opponentTiebreakPoints === undefined ? "" : `(${set.opponentTiebreakPoints})`;
  return `${set.playerGames}${playerTiebreak}-${set.opponentGames}${opponentTiebreak}`;
}

export function formatTennisHistoryText(matches: TennisHistoryMatch[]): string {
  return matches.map((match) => {
    const status = match.status === "completed" ? "" : ` | ${match.status === "retired" ? "RET" : "WO"}`;
    const tournament = match.tournament ? ` | ${match.tournament}` : "";
    return `${match.date} | ${surfaceInputLabel(match.surface)}${tournament} | ${match.opponent} | ${match.sets.map(setInputScore).join(" ")}${status}`;
  }).join("\n");
}

/**
 * Formato por línea: fecha | superficie | torneo opcional | rival | sets desde
 * la perspectiva del jugador | estado opcional.
 */
export function parseTennisHistoryText(text: string): { matches: TennisHistoryMatch[]; errors: string[] } {
  const matches: TennisHistoryMatch[] = [];
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  lines.forEach((line, index) => {
    const columns = line.split("|").map((column) => column.trim());
    if (columns.length < 4 || columns.length > 6) {
      errors.push(`Línea ${index + 1}: usa fecha | superficie | torneo opcional | rival | sets | estado opcional.`);
      return;
    }
    const hasTournament = columns.length === 6 || (
      columns.length === 5 && STATUS_ALIASES[columns[4].toLocaleLowerCase("es").replaceAll("/", "_")] === undefined
    );
    const [date, surfaceRaw] = columns;
    const tournament = hasTournament ? columns[2] : undefined;
    const opponent = hasTournament ? columns[3] : columns[2];
    const setsRaw = hasTournament ? columns[4] : columns[3];
    const statusRaw = hasTournament ? columns[5] : columns[4];
    const surface = parseSurface(surfaceRaw);
    const sets = parseSets(setsRaw);
    const status = parseStatus(statusRaw);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
      errors.push(`Línea ${index + 1}: la fecha debe usar AAAA-MM-DD.`);
    } else if (!surface) {
      errors.push(`Línea ${index + 1}: superficie no reconocida.`);
    } else if (!opponent) {
      errors.push(`Línea ${index + 1}: falta el rival.`);
    } else if (!sets && status !== "walkover") {
      errors.push(`Línea ${index + 1}: marcador inválido; usa por ejemplo 6-4 3-6 6-2.`);
    } else {
      matches.push({ date, tournament, opponent, surface, sets: sets ?? [], status });
    }
  });

  return { matches, errors };
}

function completedMatches(player: TennisPlayerInput): TennisHistoryMatch[] {
  return player.matches
    .filter((match) => match.status === "completed" && match.sets.length >= 2)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function wonMatch(match: TennisHistoryMatch): boolean {
  if (match.winner) return match.winner === "player";
  const won = match.sets.filter((set) => set.playerGames > set.opponentGames).length;
  return won > match.sets.length / 2;
}

function weightedMatchWinRate(matches: TennisHistoryMatch[]): number {
  if (!matches.length) return 50;
  let weightedHits = 0;
  let totalWeight = 0;
  matches.forEach((match, index) => {
    // Los 20 partidos participan; el más antiguo aún conserva 43% del peso del más reciente.
    const weight = Math.max(0.43, 1 - index * 0.03);
    totalWeight += weight;
    if (wonMatch(match)) weightedHits += weight;
  });
  return round(weightedHits / totalWeight * 100);
}

function canonicalPlayerName(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/[^a-z0-9]/g, "");
}

function matchMetrics(matches: TennisHistoryMatch[]) {
  const sets = matches.flatMap((match) => match.sets);
  const gameDifferential = matches.length
    ? matches.reduce((sum, match) => sum + match.sets.reduce((setSum, set) => setSum + set.playerGames - set.opponentGames, 0), 0) / matches.length
    : 0;
  return {
    winRate: rate(matches.filter(wonMatch).length, matches.length) * 100,
    setWinRate: rate(sets.filter((set) => set.playerGames > set.opponentGames).length, sets.length) * 100,
    gameDifferential,
  };
}

function buildCommonOpponents(input: TennisMatchInput): { comparisons: TennisCommonOpponentComparison[]; advantage: number } {
  const p1Name = canonicalPlayerName(input.player1.name);
  const p2Name = canonicalPlayerName(input.player2.name);
  const p1Groups = new Map<string, TennisHistoryMatch[]>();
  const p2Groups = new Map<string, TennisHistoryMatch[]>();
  for (const match of completedMatches(input.player1)) {
    const key = canonicalPlayerName(match.opponent);
    if (key !== p2Name) p1Groups.set(key, [...(p1Groups.get(key) ?? []), match]);
  }
  for (const match of completedMatches(input.player2)) {
    const key = canonicalPlayerName(match.opponent);
    if (key !== p1Name) p2Groups.set(key, [...(p2Groups.get(key) ?? []), match]);
  }

  const comparisons: TennisCommonOpponentComparison[] = [];
  for (const [key, p1Matches] of p1Groups) {
    const p2Matches = p2Groups.get(key);
    if (!p2Matches?.length) continue;
    const p1 = matchMetrics(p1Matches);
    const p2 = matchMetrics(p2Matches);
    const p1Performance = p1.winRate * 0.55 + p1.setWinRate * 0.35 + clamp(p1.gameDifferential, -10, 10) * 0.5;
    const p2Performance = p2.winRate * 0.55 + p2.setWinRate * 0.35 + clamp(p2.gameDifferential, -10, 10) * 0.5;
    comparisons.push({
      opponent: p1Matches[0].opponent,
      player1Matches: p1Matches.length,
      player2Matches: p2Matches.length,
      player1WinRate: round(p1.winRate),
      player2WinRate: round(p2.winRate),
      player1SetWinRate: round(p1.setWinRate),
      player2SetWinRate: round(p2.setWinRate),
      player1GameDifferential: Math.round(p1.gameDifferential * 10) / 10,
      player2GameDifferential: Math.round(p2.gameDifferential * 10) / 10,
      advantage: round(clamp(p1Performance - p2Performance, -100, 100)),
    });
  }
  comparisons.sort((a, b) => Math.abs(b.advantage) - Math.abs(a.advantage));
  return {
    comparisons,
    advantage: comparisons.length ? round(comparisons.reduce((sum, item) => sum + item.advantage, 0) / comparisons.length) : 0,
  };
}

function buildHeadToHead(input: TennisMatchInput): TennisHeadToHeadSummary {
  const p1Name = canonicalPlayerName(input.player1.name);
  const p2Name = canonicalPlayerName(input.player2.name);
  const records: TennisHeadToHeadSummary["records"] = [];
  const seen = new Set<string>();

  for (const match of completedMatches(input.player1).filter((item) => canonicalPlayerName(item.opponent) === p2Name)) {
    const key = `${match.date}-${match.tournament ?? ""}`;
    seen.add(key);
    records.push({ date: match.date, tournament: match.tournament, surface: match.surface, winner: wonMatch(match) ? input.player1.name : input.player2.name, setsFromPlayer1: match.sets });
  }
  for (const match of completedMatches(input.player2).filter((item) => canonicalPlayerName(item.opponent) === p1Name)) {
    const key = `${match.date}-${match.tournament ?? ""}`;
    if (seen.has(key)) continue;
    const setsFromPlayer1 = match.sets.map((set) => ({
      playerGames: set.opponentGames,
      opponentGames: set.playerGames,
      playerTiebreakPoints: set.opponentTiebreakPoints,
      opponentTiebreakPoints: set.playerTiebreakPoints,
    }));
    records.push({ date: match.date, tournament: match.tournament, surface: match.surface, winner: wonMatch(match) ? input.player2.name : input.player1.name, setsFromPlayer1 });
  }
  records.sort((a, b) => b.date.localeCompare(a.date));
  const allSets = records.flatMap((record) => record.setsFromPlayer1);
  const player1Wins = records.filter((record) => record.winner === input.player1.name).length;
  const player1SetWinRate = rate(allSets.filter((set) => set.playerGames > set.opponentGames).length, allSets.length) * 100;
  const winShare = rate(player1Wins, records.length) * 100;
  return {
    matches: records.length,
    player1Wins,
    player2Wins: records.length - player1Wins,
    player1SetWinRate: round(player1SetWinRate),
    player2SetWinRate: round(100 - player1SetWinRate),
    advantage: records.length ? round(clamp((winShare - 50) * 1.2 + (player1SetWinRate - 50) * 0.8, -100, 100)) : 0,
    records,
  };
}

function profilePlayer(player: TennisPlayerInput, surface: TennisSurface): TennisPlayerProfile {
  const matches = completedMatches(player);
  const surfaceMatches = matches.filter((match) => match.surface === surface);
  const sets = matches.flatMap((match) => match.sets);
  const gamesWon = sets.reduce((sum, set) => sum + set.playerGames, 0);
  const gamesLost = sets.reduce((sum, set) => sum + set.opponentGames, 0);
  const totalGames = matches.reduce(
    (sum, match) => sum + match.sets.reduce((setSum, set) => setSum + set.playerGames + set.opponentGames, 0),
    0
  );
  const firstSets = matches.map((match) => match.sets[0]).filter(Boolean);
  const secondSets = matches.map((match) => match.sets[1]).filter(Boolean);
  const decidingSets = matches.filter((match) => {
    const setsWon = match.sets.filter((set) => set.playerGames > set.opponentGames).length;
    return setsWon > 0 && setsWon < match.sets.length;
  });

  return {
    matchesUsed: matches.length,
    surfaceMatches: surfaceMatches.length,
    winRate: round(rate(matches.filter(wonMatch).length, matches.length) * 100),
    surfaceWinRate: round(rate(surfaceMatches.filter(wonMatch).length, surfaceMatches.length, rate(matches.filter(wonMatch).length, matches.length)) * 100),
    weightedWinRate: weightedMatchWinRate(matches),
    setWinRate: round(rate(sets.filter((set) => set.playerGames > set.opponentGames).length, sets.length) * 100),
    firstSetWinRate: round(rate(firstSets.filter((set) => set.playerGames > set.opponentGames).length, firstSets.length) * 100),
    secondSetWinRate: round(rate(secondSets.filter((set) => set.playerGames > set.opponentGames).length, secondSets.length) * 100),
    decidingSetRate: round(rate(decidingSets.length, matches.length) * 100),
    firstSetOver95Rate: round(rate(firstSets.filter((set) => set.playerGames + set.opponentGames > 9.5).length, firstSets.length) * 100),
    secondSetOver95Rate: round(rate(secondSets.filter((set) => set.playerGames + set.opponentGames > 9.5).length, secondSets.length) * 100),
    averageTotalGames: matches.length ? Math.round((totalGames / matches.length) * 10) / 10 : 0,
    averageGamesWon: matches.length ? Math.round((gamesWon / matches.length) * 10) / 10 : 0,
    averageGamesLost: matches.length ? Math.round((gamesLost / matches.length) * 10) / 10 : 0,
  };
}

function playerStrength(profile: TennisPlayerProfile): number {
  return (
    profile.winRate * 0.25 +
    profile.surfaceWinRate * 0.3 +
    profile.weightedWinRate * 0.25 +
    profile.setWinRate * 0.2
  ) / 100;
}

function sampleConfidence(p1: TennisPlayerProfile, p2: TennisPlayerProfile): number {
  const completion = clamp(Math.min(p1.matchesUsed, p2.matchesUsed) / 20, 0, 1);
  const surface = clamp(Math.min(p1.surfaceMatches, p2.surfaceMatches) / 8, 0, 1);
  return round(58 + completion * 22 + surface * 12);
}

function recommendation(probability: number, confidence: number): TennisMarketPrediction["recommendation"] {
  if (probability >= 70 && confidence >= 70) return "fuerte";
  if (probability >= 60 && confidence >= 60) return "moderada";
  return "evitar";
}

function market(
  id: string,
  category: TennisMarketPrediction["category"],
  name: string,
  selection: string,
  probability: number,
  confidence: number,
  evidence: string[]
): TennisMarketPrediction {
  const boundedProbability = round(clamp(probability, 5, 95));
  const boundedConfidence = round(clamp(confidence, 30, 95));
  return {
    id,
    category,
    market: name,
    selection,
    probability: boundedProbability,
    confidence: boundedConfidence,
    recommendation: recommendation(boundedProbability, boundedConfidence),
    evidence,
  };
}

function nearestHalf(value: number, min: number, max: number): number {
  return clamp(Math.round(value - 0.5) + 0.5, min, max);
}

function observedOverRate(players: TennisPlayerInput[], line: number): number {
  const samples = players.flatMap(completedMatches);
  const overs = samples.filter((match) => match.sets.reduce((sum, set) => sum + set.playerGames + set.opponentGames, 0) > line).length;
  return rate(overs, samples.length) * 100;
}

function observedSetOverRate(profiles: TennisPlayerProfile[], setNumber: 1 | 2): number {
  const key = setNumber === 1 ? "firstSetOver95Rate" : "secondSetOver95Rate";
  return profiles.reduce((sum, profile) => sum + profile[key], 0) / profiles.length;
}

function exactSetScore(favoriteProbability: number): string {
  if (favoriteProbability >= 68) return "6-3";
  if (favoriteProbability >= 56) return "6-4";
  return "7-5";
}

export function validateTennisInput(input: TennisMatchInput): string[] {
  const errors: string[] = [];
  if (!input.tournament.trim()) errors.push("Falta el torneo.");
  if (!input.date || Number.isNaN(Date.parse(input.date))) errors.push("La fecha del encuentro no es válida.");
  if (!input.player1.name.trim() || !input.player2.name.trim()) errors.push("Debes indicar los dos jugadores.");
  if (input.player1.name.trim().toLocaleLowerCase("es") === input.player2.name.trim().toLocaleLowerCase("es")) {
    errors.push("Los jugadores deben ser diferentes.");
  }
  if (input.player1.matches.length !== 20) errors.push(`${input.player1.name || "Jugador 1"} debe tener exactamente 20 partidos.`);
  if (input.player2.matches.length !== 20) errors.push(`${input.player2.name || "Jugador 2"} debe tener exactamente 20 partidos.`);
  for (const player of [input.player1, input.player2]) {
    const completed = completedMatches(player).length;
    if (completed < 10) errors.push(`${player.name || "El jugador"} necesita al menos 10 partidos finalizados; RET/WO no alimentan el modelo.`);
  }
  return errors;
}

export function analyzeTennisMatch(input: TennisMatchInput, modelVersion: TennisModelVersion = "calibrated"): TennisAnalysis {
  const validationErrors = validateTennisInput(input);
  if (validationErrors.length) throw new Error(validationErrors.join(" "));

  const p1 = profilePlayer(input.player1, input.surface);
  const p2 = profilePlayer(input.player2, input.surface);
  const commonOpponents = buildCommonOpponents(input);
  const headToHead = buildHeadToHead(input);
  const strengthDifference = playerStrength(p1) - playerStrength(p2);
  const commonReliability = Math.min(commonOpponents.comparisons.length / 4, 1);
  const h2hReliability = Math.min(headToHead.matches / 3, 1);
  const sameSurfaceH2h = headToHead.records.filter((record) => record.surface === input.surface).length;
  const h2hSurfaceFactor = sameSurfaceH2h > 0 ? 1 : 0.65;
  let p1MatchProbabilityRaw = 50 + strengthDifference * 52
    + commonOpponents.advantage * 0.05 * commonReliability
    + headToHead.advantage * 0.03 * h2hReliability * h2hSurfaceFactor;
  if (input.player1.ranking && input.player2.ranking) {
    const rankingAdjustment = clamp(Math.log(input.player2.ranking / input.player1.ranking) * 3, -5, 5);
    p1MatchProbabilityRaw += rankingAdjustment;
  }
  p1MatchProbabilityRaw = clamp(p1MatchProbabilityRaw, 15, 85);
  const p1MatchProbability = round(p1MatchProbabilityRaw);
  const p2MatchProbability = 100 - p1MatchProbability;
  const p1Set1 = round(clamp(50 + (p1.firstSetWinRate - p2.firstSetWinRate) * 0.42, 20, 80));
  const p1Set2 = round(clamp(50 + (p1.secondSetWinRate - p2.secondSetWinRate) * 0.42, 20, 80));
  const confidence = sampleConfidence(p1, p2);
  // La versión anterior decidía el favorito después de redondear. Un 49.95%
  // se convertía en 50% y favorecía siempre al jugador 1 por orden de carga.
  const favoriteIsP1 = modelVersion === "legacy" ? p1MatchProbability >= 50 : p1MatchProbabilityRaw >= 50;
  const favorite = favoriteIsP1 ? input.player1.name : input.player2.name;
  const favoriteProbability = Math.max(p1MatchProbability, p2MatchProbability);
  const minSets = input.bestOf === 3 ? 2 : 3;
  const favoriteSetProbability = favoriteIsP1 ? (p1Set1 + p1Set2) / 2 : 100 - (p1Set1 + p1Set2) / 2;
  const underdogWinsSetProbability = 100 * (1 - Math.pow(favoriteSetProbability / 100, minSets));
  const empiricalDecidingSetRate = (p1.decidingSetRate + p2.decidingSetRate) / 2;
  const calibratedBothWinSetProbability = empiricalDecidingSetRate * 0.75 + (100 - favoriteProbability) * 0.25;
  const bothWinSetProbability = modelVersion === "legacy"
    ? clamp(underdogWinsSetProbability * 0.92, 10, 82)
    : clamp(calibratedBothWinSetProbability, 15, 75);
  const projectedSets = minSets + bothWinSetProbability / 100 * (input.bestOf - minSets);
  const baseGamesPerSet = clamp((p1.averageTotalGames + p2.averageTotalGames) / Math.max(4, projectedSets * 2), 8.2, 10.8);
  const projectedTotalGames = projectedSets * baseGamesPerSet;
  const totalLine = nearestHalf(projectedTotalGames, input.bestOf === 3 ? 18.5 : 28.5, input.bestOf === 3 ? 27.5 : 48.5);
  const overObserved = observedOverRate([input.player1, input.player2], totalLine);
  const chooseOver = overObserved >= 50;
  const totalProbability = Math.max(overObserved, 100 - overObserved);
  const favoriteGamesHandicap = favoriteProbability >= 70 ? -3.5 : favoriteProbability >= 60 ? -2.5 : 2.5;
  const matchSetHandicap = favoriteProbability >= 68 ? -1.5 : 1.5;
  const set1Favorite = p1Set1 >= 50 ? input.player1.name : input.player2.name;
  const set2Favorite = p1Set2 >= 50 ? input.player1.name : input.player2.name;
  const set1Probability = Math.max(p1Set1, 100 - p1Set1);
  const set2Probability = Math.max(p1Set2, 100 - p1Set2);
  const legacySetOverProbability = clamp(45 + (100 - favoriteSetProbability) * 0.38, 35, 72);
  const set1OverProbability = modelVersion === "legacy" ? legacySetOverProbability : observedSetOverRate([p1, p2], 1);
  const set2OverProbability = modelVersion === "legacy" ? legacySetOverProbability : observedSetOverRate([p1, p2], 2);
  const set1TotalSelection = set1OverProbability >= 50 ? "Más de 9.5 juegos" : "Menos de 9.5 juegos";
  const set2TotalSelection = set2OverProbability >= 50 ? "Más de 9.5 juegos" : "Menos de 9.5 juegos";
  const set1TotalProbability = Math.max(set1OverProbability, 100 - set1OverProbability);
  const set2TotalProbability = Math.max(set2OverProbability, 100 - set2OverProbability);
  const projectedScore = input.bestOf === 3
    ? `2-${bothWinSetProbability >= 48 ? 1 : 0}`
    : `3-${bothWinSetProbability >= 55 ? 1 : 0}`;
  const score = exactSetScore(favoriteSetProbability);

  const commonEvidence = [
    `${input.player1.name}: ${p1.winRate}% de victorias (${p1.matchesUsed} finalizados).`,
    `${input.player2.name}: ${p2.winRate}% de victorias (${p2.matchesUsed} finalizados).`,
    `Forma ponderada sobre los 20 completos: ${p1.weightedWinRate}% vs ${p2.weightedWinRate}%.`,
    `Muestra en ${surfaceLabel(input.surface)}: ${p1.surfaceMatches} vs ${p2.surfaceMatches} partidos.`,
    ...(commonOpponents.comparisons.length ? [`Rivales en común: ${commonOpponents.comparisons.length}; ventaja comparativa ${commonOpponents.advantage > 0 ? input.player1.name : input.player2.name} (${Math.abs(commonOpponents.advantage)} pts).`] : []),
    ...(headToHead.matches ? [`H2H prepartido: ${headToHead.player1Wins}-${headToHead.player2Wins} en ${headToHead.matches} encuentro(s).`] : []),
  ];

  const markets: TennisMarketPrediction[] = [
    market("match-winner", "match_winner", "Ganador", favorite, favoriteProbability, confidence, commonEvidence),
    market("set-1-winner", "set_winner", "Ganador del set 1", set1Favorite, set1Probability, confidence - 4, [`Rendimiento en primeros sets: ${p1.firstSetWinRate}% vs ${p2.firstSetWinRate}%.`]),
    market("set-2-winner", "set_winner", "Ganador del set 2", set2Favorite, set2Probability, confidence - 6, [`Rendimiento en segundos sets: ${p1.secondSetWinRate}% vs ${p2.secondSetWinRate}%.`]),
    market("match-total-games", "match_total_games", "Más/Menos de juegos", `${chooseOver ? "Más" : "Menos"} de ${totalLine} juegos`, totalProbability, confidence - 2, [`Promedio combinado y ajustado al formato: ${projectedTotalGames.toFixed(1)} juegos.`, `${round(overObserved)}% de la muestra supera la línea.`]),
    market("total-games-handicap", "total_games_handicap", "Total de games hándicap", `${favorite} ${favoriteGamesHandicap > 0 ? "+" : ""}${favoriteGamesHandicap} juegos`, clamp(favoriteProbability + (favoriteGamesHandicap > 0 ? 14 : -3), 35, 90), confidence - 3, [`Diferencial medio de juegos: ${(favoriteIsP1 ? p1.averageGamesWon - p1.averageGamesLost : p2.averageGamesWon - p2.averageGamesLost).toFixed(1)}.`]),
    market("match-handicap", "match_set_handicap", "Hándicap del partido", `${favorite} ${matchSetHandicap > 0 ? "+" : ""}${matchSetHandicap} sets`, clamp(favoriteProbability + (matchSetHandicap > 0 ? 16 : -8), 35, 92), confidence - 3, [`Formato al mejor de ${input.bestOf}; proyección ${projectedScore}.`]),
    market("set-1-games-handicap", "set_games_handicap", "Hándicap de games set 1", `${set1Favorite} +1.5 juegos`, clamp(set1Probability + 15, 45, 92), confidence - 5, [`La protección +1.5 se apoya en la tasa de primeros sets.`]),
    market("set-2-games-handicap", "set_games_handicap", "Hándicap de games set 2", `${set2Favorite} +1.5 juegos`, clamp(set2Probability + 15, 45, 92), confidence - 7, [`La protección +1.5 se apoya en la tasa de segundos sets.`]),
    market("set-1-total", "set_total_games", "Total de juegos set 1", set1TotalSelection, set1TotalProbability, confidence - 8, [modelVersion === "legacy" ? `Equilibrio estimado del set: ${round(100 - favoriteSetProbability)}%.` : `Frecuencia observada sobre 9.5 juegos en primeros sets: ${round(set1OverProbability)}%.`]),
    market("set-2-total", "set_total_games", "Total de juegos set 2", set2TotalSelection, set2TotalProbability, confidence - 10, [modelVersion === "legacy" ? "Se reduce la confianza por ajustes tácticos después del primer set." : `Frecuencia observada sobre 9.5 juegos en segundos sets: ${round(set2OverProbability)}%.`]),
    market("set-1-score", "set_score", "Puntuación del set 1", `${set1Favorite} ${score}`, clamp(set1Probability - 15, 25, 60), confidence - 20, ["El marcador exacto tiene mayor varianza que el ganador del set."]),
    market("set-2-score", "set_score", "Puntuación del set 2", `${set2Favorite} ${score}`, clamp(set2Probability - 17, 22, 58), confidence - 23, ["El segundo set depende de lo ocurrido en el primero."]),
    market("total-sets", "match_total_sets", "Cantidad de sets", `${bothWinSetProbability >= 50 ? "Más" : "Menos"} de ${minSets + 0.5} sets`, Math.max(bothWinSetProbability, 100 - bothWinSetProbability), confidence - 5, [`Probabilidad de que ambos ganen un set: ${round(bothWinSetProbability)}%.`]),
    market("both-win-set", "both_win_set", "Ambos jugadores ganan un set", bothWinSetProbability >= 50 ? "Sí" : "No", Math.max(bothWinSetProbability, 100 - bothWinSetProbability), confidence - 5, [`Fortaleza estimada del no favorito para ganar un set: ${round(underdogWinsSetProbability)}%.`]),
    market("correct-match-score", "correct_set_score", "Apuesta de set: marcador correcto", `${favorite} gana ${projectedScore}`, clamp(favoriteProbability - (bothWinSetProbability >= 48 ? 18 : 12), 25, 68), confidence - 18, ["El marcador correcto se muestra como escenario, no como selección fuerte."]),
    market("player-1-wins-set", "player_wins_set", `${input.player1.name} gana un set`, modelVersion === "legacy" || favoriteIsP1 || bothWinSetProbability >= 50 ? "Sí" : "No", modelVersion === "legacy" ? clamp(100 - Math.pow((100 - (p1Set1 + p1Set2) / 2) / 100, minSets) * 100, 15, 96) : (favoriteIsP1 ? clamp(100 - (100 - favoriteProbability) ** 2 / 100, 55, 96) : Math.max(bothWinSetProbability, 100 - bothWinSetProbability)), confidence - 4, [`Tasa histórica de sets ganados: ${p1.setWinRate}%.`]),
    market("player-2-wins-set", "player_wins_set", `${input.player2.name} gana un set`, modelVersion === "legacy" || !favoriteIsP1 || bothWinSetProbability >= 50 ? "Sí" : "No", modelVersion === "legacy" ? clamp(100 - Math.pow(((p1Set1 + p1Set2) / 2) / 100, minSets) * 100, 15, 96) : (!favoriteIsP1 ? clamp(100 - (100 - favoriteProbability) ** 2 / 100, 55, 96) : Math.max(bothWinSetProbability, 100 - bothWinSetProbability)), confidence - 4, [`Tasa histórica de sets ganados: ${p2.setWinRate}%.`]),
  ];

  const warnings: string[] = [];
  if (p1.surfaceMatches < 5 || p2.surfaceMatches < 5) warnings.push("La muestra de la misma superficie es menor de 5 partidos para al menos un jugador.");
  const excluded = input.player1.matches.filter((match) => match.status !== "completed").length + input.player2.matches.filter((match) => match.status !== "completed").length;
  if (excluded) warnings.push(`${excluded} partido(s) RET/WO quedaron excluidos de los cálculos.`);
  if (!input.player1.ranking || !input.player2.ranking) warnings.push("Sin ranking de ambos jugadores: el cálculo usa únicamente forma, sets y superficie.");

  return {
    id: input.id ?? `tennis-${Date.now()}`,
    createdAt: new Date().toISOString(),
    input,
    profiles: { player1: p1, player2: p2 },
    commonOpponents: commonOpponents.comparisons,
    commonOpponentAdvantage: commonOpponents.advantage,
    headToHead,
    projectedWinner: favorite,
    projectedWinnerProbability: favoriteProbability,
    projectedScore,
    markets,
    warnings,
    modelVersion,
  };
}

export function surfaceLabel(surface: TennisSurface): string {
  return {
    hard: "pista dura",
    clay: "arcilla",
    grass: "césped",
    indoor: "pista cubierta",
    carpet: "moqueta",
  }[surface];
}
