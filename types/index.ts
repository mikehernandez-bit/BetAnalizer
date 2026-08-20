// ============================================================================
// BetAnalyzer — Core domain types
// ============================================================================

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";
export type MatchCondition = "local" | "visitante";
export type CompetitionType = "league" | "cup" | "continental" | "friendly";
export type TrendDirection = "ascendente" | "descendente" | "estable";
export type ResultLetter = "W" | "D" | "L";
export type DataQuality = "alta" | "media" | "baja";
export type RiskLevel = "bajo" | "moderado" | "alto";
export type ConfidenceLevel = "muy_alta" | "alta" | "moderada" | "baja" | "evitar";
export type PatternStrength = "muy_fuerte" | "fuerte" | "moderado" | "debil";
export type CrossPatternStrength = PatternStrength | "contradictorio";
export type ValueLevel = "sin_valor" | "valor_leve" | "valor_moderado" | "valor_alto";
export type MarketCategory =
  | "goles"
  | "corners"
  | "tiros_arco"
  | "remates"
  | "tarjetas"
  | "resultado"
  | "ambos_marcan"
  | "primera_parte"
  | "segunda_parte"
  | "equipo_local"
  | "equipo_visitante";
export type MarketRecommendationState = "recomendado" | "evitar" | "sin_datos_suficientes";
export type FavoriteType = "match" | "team" | "market" | "analysis" | "pattern";
export type AnalysisStatus = "ganada" | "perdida" | "pendiente" | "anulada";
export type BetSelectionStatus = "pendiente" | "acertada" | "fallida" | "sin_datos";
export type TicketTier = 70 | 80 | 90;
export type PredictedWinner = "local" | "empate" | "visitante";

// ----------------------------------------------------------------------------
// Competition & Team
// ----------------------------------------------------------------------------

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  country: string;
  tier: number;
  season: string;
  color: string;
  totalTeams: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  country: string;
  competitionId: string;
  stadium: string;
  founded: number;
  primaryColor: string;
  secondaryColor: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: ResultLetter[];
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  avgCorners: number;
}

// ----------------------------------------------------------------------------
// Matches & statistics
// ----------------------------------------------------------------------------

export interface MatchStatistics {
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  homeCorners: number;
  awayCorners: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossession: number;
  awayPossession: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
}

export interface Match {
  id: string;
  competitionId: string;
  competitionType: CompetitionType;
  season: string;
  matchday: number;
  date: string; // ISO date
  time: string; // HH:mm
  stadium: string;
  neutralVenue?: boolean;
  homeTeamId: string;
  awayTeamId: string;
  status: MatchStatus;
  statistics?: MatchStatistics;
}

// ----------------------------------------------------------------------------
// Team form (last N matches, from one team's perspective)
// ----------------------------------------------------------------------------

export type StatKey =
  | "goalsFor"
  | "goalsAgainst"
  | "cornersFor"
  | "cornersAgainst"
  | "shotsFor"
  | "shotsAgainst"
  | "shotsOnTargetFor"
  | "shotsOnTargetAgainst"
  | "possession";

export interface TeamMatchRecord {
  matchId: string;
  date: string;
  opponentId: string;
  competitionId: string;
  competitionType: CompetitionType;
  venue: MatchCondition;
  result: ResultLetter;
  goalsFor: number;
  goalsAgainst: number;
  /**
   * Desglose de goles por tiempo — opcionales porque no todas las fuentes
   * publican el resultado al descanso. Cuando están, deben sumar goalsFor /
   * goalsAgainst respectivamente.
   */
  goalsForFirstHalf?: number;
  goalsForSecondHalf?: number;
  goalsAgainstFirstHalf?: number;
  goalsAgainstSecondHalf?: number;
  cornersFor: number;
  cornersAgainst: number;
  shotsFor?: number;
  shotsAgainst?: number;
  shotsOnTargetFor?: number;
  shotsOnTargetAgainst?: number;
  possession?: number;
  yellowCards: number;
  redCards: number;
  /**
   * Tarjetas del RIVAL en ese mismo partido — opcionales porque la mayoría
   * de las fuentes no publican el desglose del otro equipo. Cuando están
   * presentes permiten calcular un total de tarjetas realmente del partido
   * completo; si faltan, el sistema sigue funcionando solo con las propias.
   */
  yellowCardsAgainst?: number;
  redCardsAgainst?: number;
  note?: string;
}

export interface StatDistribution {
  average: number;
  median: number;
  max: number;
  min: number;
  stdDev: number;
  trend: TrendDirection;
}

export interface TeamForm {
  teamId: string;
  sampleSize: number;
  matches: TeamMatchRecord[];
  stats: Record<StatKey, StatDistribution>;
}

// ----------------------------------------------------------------------------
// Head to head
// ----------------------------------------------------------------------------

export interface H2HMatchRecord {
  matchId: string;
  date: string;
  competitionId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  homeCorners?: number;
  awayCorners?: number;
  homeShotsOnTarget?: number;
  awayShotsOnTarget?: number;
  cards: number;
}

export interface HeadToHead {
  teamAId: string;
  teamBId: string;
  matches: H2HMatchRecord[];
  summary: {
    totalMatches: number;
    teamAWins: number;
    teamBWins: number;
    draws: number;
    avgGoals: number;
    avgCorners: number;
    bothScoredPct: number;
    over25Pct: number;
    dominantTeamId: string | null;
  };
}

// ----------------------------------------------------------------------------
// Common opponents
// ----------------------------------------------------------------------------

export interface CommonOpponentSide {
  matchId: string;
  date: string;
  venue: MatchCondition;
  result: ResultLetter;
  goalsFor: number;
  goalsAgainst: number;
  corners?: number;
  shots?: number;
  shotsOnTarget?: number;
  possession?: number;
}

export interface CommonOpponent {
  opponentId: string;
  teamA: CommonOpponentSide;
  teamB: CommonOpponentSide;
  difference: {
    goals: number;
    corners: number;
    shots: number;
    shotsOnTarget: number;
    possession: number;
  };
  conclusion: string;
}

export interface CommonOpponentsAnalysis {
  opponents: CommonOpponent[];
  summary: {
    betterTeamId: string | null;
    avgDifference: number;
    matchesCount: number;
    relevance: "alta" | "media" | "baja";
  };
}

// ----------------------------------------------------------------------------
// Patterns
// ----------------------------------------------------------------------------

export interface Pattern {
  id: string;
  teamId: string;
  category: MarketCategory;
  title: string;
  description: string;
  hits: number;
  total: number;
  percentage: number;
  strength: PatternStrength;
  trend: TrendDirection;
  relatedMatchIds: string[];
}

export interface CrossPatternStat {
  description: string;
  hits: number;
  total: number;
  percentage: number;
}

export interface CrossPattern {
  id: string;
  category: MarketCategory;
  marketId: string;
  marketLabel: string;
  teamAId: string;
  teamBId: string;
  teamAStat: CrossPatternStat;
  teamBStat: CrossPatternStat;
  combinedConfidence: number;
  strength: CrossPatternStrength;
  conclusion: string;
  risks: string[];
}

// ----------------------------------------------------------------------------
// Markets, odds & confidence engine
// ----------------------------------------------------------------------------

export interface BettingMarket {
  id: string;
  category: MarketCategory;
  name: string;
  description: string;
  side: "local" | "visitante" | "ambos" | "partido";
}

export interface BettingOdds {
  marketId: string;
  decimalOdds: number;
  impliedProbability: number;
}

export interface MarketSignal {
  label: string;
  value: string;
  detail?: string;
}

export interface MarketEvidenceMatch {
  matchId: string;
  date: string;
  opponent: string;
  venue: MatchCondition;
  result: ResultLetter;
  score: string;
  statistics: string;
  fulfilled: boolean;
}

export interface MarketEvidenceSeries {
  id: string;
  title: string;
  description: string;
  hits: number;
  total: number;
  percentage: number;
  matches: MarketEvidenceMatch[];
}

export interface MarketEvidence {
  methodology: string[];
  series: MarketEvidenceSeries[];
}

export interface ConfidenceBreakdown {
  recentPerformance: number;
  rivalVulnerability: number;
  homeAwayCondition: number;
  headToHead: number;
  commonOpponents: number;
  lastThreeTrend: number;
  dataQuality: number;
  finalScore: number;
  classification: ConfidenceLevel;
}

export const CONFIDENCE_WEIGHTS = {
  recentPerformance: 0.3,
  rivalVulnerability: 0.25,
  homeAwayCondition: 0.15,
  headToHead: 0.1,
  commonOpponents: 0.1,
  lastThreeTrend: 0.05,
  dataQuality: 0.05,
} as const;

export interface MarketEvaluation {
  id: string;
  matchId: string;
  market: BettingMarket;
  confidenceBreakdown: ConfidenceBreakdown;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  odds?: BettingOdds;
  statisticalEstimate: number;
  valueDifference?: number;
  valueLevel?: ValueLevel;
  riskLevel: RiskLevel;
  positivePatterns: string[];
  probabilitySignals?: MarketSignal[];
  evidence?: MarketEvidence;
  contradictions: string[];
  dataQuality: DataQuality;
  sampleSize: number;
  recommendation: MarketRecommendationState;
}

export interface RiskFactor {
  id: string;
  description: string;
  severity: "alta" | "media" | "baja";
}

export interface BettingRecommendation {
  id: string;
  marketEvaluation: MarketEvaluation;
  reasons: string[];
  risks: RiskFactor[];
  isBestBet: boolean;
}

// ----------------------------------------------------------------------------
// Analysis configuration (wizard) & result
// ----------------------------------------------------------------------------

export type MatchSampleSize = 5 | 10 | 15 | 20;

export interface AnalysisConfig {
  competitionId: string;
  season: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  matchCount: MatchSampleSize;
  onlyLeague: boolean;
  includeCups: boolean;
  onlyHomeConditionTeamA: boolean;
  onlyAwayConditionTeamB: boolean;
  includeH2H: boolean;
  includeCommonOpponents: boolean;
  weightLastFive: boolean;
  excludeRedCards: boolean;
  excludeFriendlies: boolean;
  odds: Partial<Record<string, number>>;
}

export interface RadarProfile {
  attack: number;
  defense: number;
  goals: number;
  corners: number;
  shots: number;
  shotsOnTarget: number;
  form: number;
}

export interface AnalysisResult {
  id: string;
  matchId: string;
  match: Match;
  generatedAt: string;
  config: AnalysisConfig;
  homeForm: TeamForm;
  awayForm: TeamForm;
  homePatterns: Pattern[];
  awayPatterns: Pattern[];
  headToHead: HeadToHead;
  commonOpponents: CommonOpponentsAnalysis;
  crossPatterns: CrossPattern[];
  markets: MarketEvaluation[];
  bestBet: BettingRecommendation | null;
  alternatives: BettingRecommendation[];
  avoid: MarketEvaluation[];
  overallConfidence: number;
  dataQuality: DataQuality;
  matchesAnalyzed: number;
  lastUpdated: string;
  quickRead: string;
  radar: { home: RadarProfile; away: RadarProfile };
}

export interface SavedAnalysis {
  id: string;
  analysisId: string;
  matchId: string;
  competition: string;
  homeTeamId: string;
  awayTeamId: string;
  recommendedMarket: string;
  confidence: number;
  odds: number;
  status: AnalysisStatus;
  result?: string;
  date: string;
  savedAt: string;
}

// ----------------------------------------------------------------------------
// Registro de predicciones / apuestas
// ----------------------------------------------------------------------------

/**
 * Corrección aprendida exclusivamente de pronósticos guardados antes del
 * inicio y resultados finales posteriores. Los multiplicadores ya incluyen
 * regularización hacia 1 para que una muestra corta no sobreentrene el 1X2.
 */
export interface ResultCalibrationProfile {
  sampleSize: number;
  winnerHits: number;
  winnerAccuracyRate: number;
  brierScore: number;
  homeMultiplier: number;
  drawMultiplier: number;
  awayMultiplier: number;
  generatedAt: string;
}

/** Fiabilidad observada de una selección binaria concreta. */
export interface MarketReliability {
  marketId: string;
  sampleSize: number;
  hits: number;
  accuracyRate: number;
  probabilityMultiplier: number;
}

export type MarketReliabilityProfile = Record<string, MarketReliability>;

/** Resultado verificable introducido una vez que el encuentro terminó. */
export interface RecordedMatchOutcome {
  homeGoals: number;
  awayGoals: number;
  homeGoalsFirstHalf?: number;
  awayGoalsFirstHalf?: number;
  homeCorners?: number;
  awayCorners?: number;
  homeYellowCards?: number;
  awayYellowCards?: number;
  homeRedCards?: number;
  awayRedCards?: number;
  recordedAt: string;
}

/** Foto inmutable de un mercado incluido en un ticket. */
export interface TrackedBetSelection {
  id: string;
  marketId: string;
  marketName: string;
  category: MarketCategory;
  probability: number;
  confidence: number;
  sampleSize: number;
  recommendation: MarketRecommendationState;
  /** Equipo favorecido en mercados cuyo nombre no expresa el lado, p.ej. "más córners". */
  targetSide?: "home" | "away";
  evidence: string[];
  status: BetSelectionStatus;
  settledAt?: string;
  settlementNote?: string;
}

/** Resultado 1X2 que el modelo tenía al crear el ticket. */
export interface TicketWinnerPrediction {
  outcome: PredictedWinner;
  label: string;
  probability: number;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  correct?: boolean;
}

/** Un encuentro perteneciente a un ticket guardado. */
export interface TrackedTicketMatch {
  matchId: string;
  competition: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  status: AnalysisStatus;
  selections: TrackedBetSelection[];
  winnerPrediction?: TicketWinnerPrediction;
  outcome?: RecordedMatchOutcome;
  settledAt?: string;
}

/** Foto inmutable de un ticket generado con uno de los niveles blindados. */
export interface TrackedTicket {
  id: string;
  tier: TicketTier;
  minConfidence: number;
  minProbability: number;
  modelVersion: string;
  createdAt: string;
  status: AnalysisStatus;
  matches: TrackedTicketMatch[];
}

// ----------------------------------------------------------------------------
// User preferences & favorites
// ----------------------------------------------------------------------------

export interface UserPreferences {
  displayName: string;
  email: string;
  theme: "dark" | "light";
  language: "es" | "en";
  timezone: string;
  oddsFormat: "decimal" | "fraccional" | "americana";
  defaultMatchCount: MatchSampleSize;
  minConfidence: number;
  favoriteMarketCategories: MarketCategory[];
  notifications: {
    newPatterns: boolean;
    matchReminders: boolean;
    weeklySummary: boolean;
    oddsMovement: boolean;
  };
}

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  refId: string;
  label: string;
  meta?: string;
  addedAt: string;
}

// ----------------------------------------------------------------------------
// Misc UI helper types
// ----------------------------------------------------------------------------

export interface ChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface DashboardSummary {
  matchesToday: number;
  analysesDone: number;
  strongPatterns: number;
  valueBets: number;
  historicalAccuracy: number;
  savedMarkets: number;
}
