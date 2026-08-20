export type TennisSurface = "hard" | "clay" | "grass" | "indoor" | "carpet";

export type TennisMatchStatus = "completed" | "retired" | "walkover";

export type TennisModelVersion = "legacy" | "calibrated";

export interface TennisSetScore {
  playerGames: number;
  opponentGames: number;
  playerTiebreakPoints?: number;
  opponentTiebreakPoints?: number;
}

export interface TennisHistoryMatch {
  date: string;
  tournament?: string;
  opponent: string;
  surface: TennisSurface;
  sets: TennisSetScore[];
  status: TennisMatchStatus;
  playerIsHome?: boolean;
  winner?: "player" | "opponent";
}

export interface TennisPlayerInput {
  name: string;
  ranking?: number;
  matches: TennisHistoryMatch[];
}

export interface TennisMatchInput {
  id?: string;
  tournament: string;
  date: string;
  time?: string;
  round?: string;
  surface: TennisSurface;
  bestOf: 3 | 5;
  player1: TennisPlayerInput;
  player2: TennisPlayerInput;
}

export interface TennisStoredEvent {
  id: string;
  status: "scheduled" | "completed";
  input: TennisMatchInput;
  actualResult?: {
    winner: string;
    sets: TennisSetScore[];
    source: string;
  };
  sourceUrls: string[];
  note?: string;
}

export interface TennisRecordedOutcome {
  id: string;
  winner: string;
  score: string;
  recordedAt: string;
}

export interface TennisAuditSummary {
  audited: number;
  hits: number;
  misses: number;
  pending: number;
  accuracy: number;
}

export interface TennisMarketAuditResult {
  marketId: string;
  market: string;
  selection: string;
  actual: string;
  status: "hit" | "miss" | "void";
}

export type TennisMarketCategory =
  | "match_winner"
  | "set_winner"
  | "match_total_games"
  | "total_games_handicap"
  | "match_set_handicap"
  | "set_games_handicap"
  | "set_total_games"
  | "set_score"
  | "match_total_sets"
  | "both_win_set"
  | "correct_set_score"
  | "player_wins_set";

export interface TennisMarketPrediction {
  id: string;
  category: TennisMarketCategory;
  market: string;
  selection: string;
  probability: number;
  confidence: number;
  recommendation: "fuerte" | "moderada" | "evitar";
  evidence: string[];
}

export interface TennisPlayerProfile {
  matchesUsed: number;
  surfaceMatches: number;
  winRate: number;
  surfaceWinRate: number;
  weightedWinRate: number;
  setWinRate: number;
  firstSetWinRate: number;
  secondSetWinRate: number;
  decidingSetRate: number;
  firstSetOver95Rate: number;
  secondSetOver95Rate: number;
  averageTotalGames: number;
  averageGamesWon: number;
  averageGamesLost: number;
}

export interface TennisCommonOpponentComparison {
  opponent: string;
  player1Matches: number;
  player2Matches: number;
  player1WinRate: number;
  player2WinRate: number;
  player1SetWinRate: number;
  player2SetWinRate: number;
  player1GameDifferential: number;
  player2GameDifferential: number;
  advantage: number;
}

export interface TennisHeadToHeadSummary {
  matches: number;
  player1Wins: number;
  player2Wins: number;
  player1SetWinRate: number;
  player2SetWinRate: number;
  advantage: number;
  records: Array<{
    date: string;
    tournament?: string;
    surface: TennisSurface;
    winner: string;
    setsFromPlayer1: TennisSetScore[];
  }>;
}

export interface TennisAnalysis {
  id: string;
  createdAt: string;
  input: TennisMatchInput;
  profiles: {
    player1: TennisPlayerProfile;
    player2: TennisPlayerProfile;
  };
  commonOpponents: TennisCommonOpponentComparison[];
  commonOpponentAdvantage: number;
  headToHead: TennisHeadToHeadSummary;
  projectedWinner: string;
  projectedWinnerProbability: number;
  projectedScore: string;
  markets: TennisMarketPrediction[];
  warnings: string[];
  modelVersion: TennisModelVersion;
}
