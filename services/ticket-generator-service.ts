import { Match, MarketEvaluation, Team } from "@/types";
import { getUpcomingMatches, hasMatchStarted, isMatchExpired } from "@/data/matches";
import { teams } from "@/data/teams";
import { defaultAnalysisConfig, generateAnalysis } from "@/services/analysis-service";

export interface GeneratedTicketSelection {
  matchId: string;
  matchLabel: string;
  competitionName: string;
  matchDate: string;
  matchTime: string;
  homeTeam: Team;
  awayTeam: Team;
  marketEval: MarketEvaluation;
  confidence: number;
  probability: number;
  odds: number;
}

/** Partido que fue omitido del ticket y la razón */
export interface SkippedMatch {
  matchId: string;
  matchLabel: string;
  matchTime: string;
  reason: "no_team_data" | "no_history" | "below_threshold" | "expired";
  detail: string;
}

/**
 * Resumen de resultado que se muestra antes de las selecciones del ticket.
 * Se conserva la misma instancia de MarketEvaluation generada por Mercados,
 * por lo que no hay una segunda fórmula exclusiva para Tickets.
 */
export interface TicketMatchResultSummary {
  matchId: string;
  homeTeam: Team;
  awayTeam: Team;
  homeWin: MarketEvaluation;
  draw: MarketEvaluation;
  awayWin: MarketEvaluation;
  doubleChanceHome: MarketEvaluation;
  doubleChanceAway: MarketEvaluation;
  evidenceLabels: string[];
}

export interface GeneratedTicket {
  id: string;
  createdAt: string;
  minConfidence: number;
  minProbability: number;
  totalSelections: number;
  combinedOdds: number;
  averageConfidence: number;
  averageProbability: number;
  maxPerMatch: number;
  selectedMatchId?: string;
  selections: GeneratedTicketSelection[];
  resultSummaries: TicketMatchResultSummary[];
  /** Partidos evaluados que no generaron selecciones — útil para diagnóstico en la UI */
  skippedMatches: SkippedMatch[];
}

export interface TicketGeneratorOptions {
  minConfidence: number;
  minProbability: number;
  date?: string;
  matchId?: string;
  maxSelections?: number;
  maxPerMatch?: number; // default 1 (or Infinity if matchId provided and maxPerMatch not set)
  /** Reloj inyectable para pruebas y reproducciones históricas. */
  now?: Date;
}

/**
 * Busca un equipo por su ID intentando coincidencia directa primero, y luego
 * fallback por prefijo/sufijo para manejar variaciones de alias entre
 * matches.ts y teams.ts (ej: "aldosivi" vs "ca-aldosivi").
 */
function resolveTeam(teamId: string): Team | undefined {
  // 1. Coincidencia exacta
  const exact = teams.find((t) => t.id === teamId);
  if (exact) return exact;

  // 2. Coincidencia por sufijo: "ca-aldosivi" contiene "aldosivi"
  const bySuffix = teams.find(
    (t) =>
      t.id.endsWith(`-${teamId}`) ||
      teamId.endsWith(`-${t.id}`) ||
      t.id === `ca-${teamId}` ||
      teamId === `ca-${t.id}`
  );
  if (bySuffix) return bySuffix;

  // 3. Coincidencia por nombre normalizado (sin guiones)
  const normalizedSearch = teamId.toLowerCase().replace(/-/g, "");
  const byNorm = teams.find((t) => t.id.toLowerCase().replace(/-/g, "") === normalizedSearch);
  return byNorm;
}

function buildResultSummary(match: Match, homeTeam: Team, awayTeam: Team, markets: MarketEvaluation[]): TicketMatchResultSummary | undefined {
  const byId = new Map(markets.map((market) => [market.market.id, market]));
  const homeWin = byId.get("result_home_win");
  const draw = byId.get("result_draw");
  const awayWin = byId.get("result_away_win");
  const doubleChanceHome = byId.get("result_dc_home");
  const doubleChanceAway = byId.get("result_dc_away");

  if (!homeWin || !draw || !awayWin || !doubleChanceHome || !doubleChanceAway) return undefined;

  return {
    matchId: match.id,
    homeTeam,
    awayTeam,
    homeWin,
    draw,
    awayWin,
    doubleChanceHome,
    doubleChanceAway,
    evidenceLabels: (homeWin.probabilitySignals ?? []).map((signal) => signal.label),
  };
}

export function generateBetTicket(options: TicketGeneratorOptions): GeneratedTicket {
  const {
    minConfidence,
    minProbability,
    date,
    matchId,
    maxSelections = Infinity,
    maxPerMatch = Infinity,
    now,
  } = options;

  // STRICTLY filter for ONLY active, non-expired upcoming/live matches
  const activeMatches = getUpcomingMatches(now);

  let candidateMatches = activeMatches;
  if (matchId) {
    candidateMatches = activeMatches.filter((m) => m.id === matchId);
  } else if (date) {
    candidateMatches = activeMatches.filter((m) => m.date === date);
  }

  const selections: GeneratedTicketSelection[] = [];
  const resultSummaries: TicketMatchResultSummary[] = [];
  const skippedMatches: SkippedMatch[] = [];

  for (const match of candidateMatches) {
    // Double check match is not expired
    if (isMatchExpired(match, now) || hasMatchStarted(match, now)) {
      skippedMatches.push({
        matchId: match.id,
        matchLabel: `${match.homeTeamId} vs ${match.awayTeamId}`,
        matchTime: match.time,
        reason: "expired",
        detail: "El partido ya comenzó o finalizó; no se crea una predicción prepartido tardía.",
      });
      continue;
    }

    // Resolver equipos con búsqueda flexible
    const homeTeam = resolveTeam(match.homeTeamId);
    const awayTeam = resolveTeam(match.awayTeamId);

    if (!homeTeam || !awayTeam) {
      const missing = [
        !homeTeam ? `Local (${match.homeTeamId})` : null,
        !awayTeam ? `Visitante (${match.awayTeamId})` : null,
      ]
        .filter(Boolean)
        .join(", ");

      skippedMatches.push({
        matchId: match.id,
        matchLabel: `${match.homeTeamId} vs ${match.awayTeamId}`,
        matchTime: match.time,
        reason: "no_team_data",
        detail: `Sin ficha de equipo en el sistema para: ${missing}. Importa el paquete del partido para resolver.`,
      });
      continue;
    }

    // El ticket consume exactamente el mismo AnalysisResult que la pantalla de
    // Mercados: muestra de 15, amistosos excluidos y señales H2H/rivales comunes.
    const analysis = generateAnalysis(defaultAnalysisConfig(homeTeam.id, awayTeam.id, 15));
    const homeRecords = analysis.homeForm.matches;
    const awayRecords = analysis.awayForm.matches;

    // Requiere mínimo 5 partidos históricos por equipo para evaluar con confianza
    const MIN_RECORDS = 5;
    if (homeRecords.length < MIN_RECORDS || awayRecords.length < MIN_RECORDS) {
      const missingHistory = [
        homeRecords.length < MIN_RECORDS
          ? `${homeTeam.shortName} (${homeRecords.length} partidos)`
          : null,
        awayRecords.length < MIN_RECORDS
          ? `${awayTeam.shortName} (${awayRecords.length} partidos)`
          : null,
      ]
        .filter(Boolean)
        .join(", ");

      skippedMatches.push({
        matchId: match.id,
        matchLabel: `${homeTeam.shortName} vs ${awayTeam.shortName}`,
        matchTime: match.time,
        reason: "no_history",
        detail: `Historial insuficiente: ${missingHistory}. Se necesitan ≥${MIN_RECORDS} partidos por equipo.`,
      });
      continue;
    }

    const homeWinEval = analysis.markets.find((m) => m.market.id === "result_home_win");
    const awayWinEval = analysis.markets.find((m) => m.market.id === "result_away_win");
    const homeWinProb = homeWinEval?.statisticalEstimate ?? 33;
    const awayWinProb = awayWinEval?.statisticalEstimate ?? 33;
    const isLopsided = Math.abs(homeWinProb - awayWinProb) > 25;

    // Solo filtra la lista ya calculada por el análisis común; no recalcula el
    // mercado con otro contexto ni deja pasar mercados marcados como "evitar".
    const matchingMarkets = analysis.markets.filter((m) => {
      if (m.confidence < minConfidence || m.statisticalEstimate < minProbability) {
        return false;
      }
      if (m.recommendation !== "recomendado") {
        return false;
      }
      // 1. Descarte de Ambos Marcan (BTTS) en partidos con amplio favorito
      if (m.market.id.startsWith("btts") && isLopsided) {
        return false;
      }
      // 2. Filtro estricto de contradicciones o avisos de datos/volatilidad
      const hasDataWarning = m.contradictions.some((c) => {
        const lower = c.toLowerCase();
        return (
          lower.includes("advertencia de cobertura") ||
          lower.includes("faltan registros") ||
          lower.includes("no apostar") ||
          lower.includes("muestra reducida") ||
          lower.includes("sin datos") ||
          lower.includes("volatilidad alta") ||
          lower.includes("inconsistencia") ||
          lower.includes("riesgo elevado")
        );
      });
      if (hasDataWarning) {
        return false;
      }
      // 3. Confirmación de racha reciente si hay evidencia disponible
      if (m.evidence?.series) {
        for (const s of m.evidence.series) {
          if (s.matches && s.matches.length >= 5) {
            const recent5 = s.matches.slice(0, 5);
            const recentHits = recent5.filter((rm) => rm.fulfilled).length;
            // Si en los últimos 5 partidos se cumplió menos del 60% (menos de 3 de 5), se descarta por caída de forma
            if (recentHits < 3) {
              return false;
            }
          }
        }
      }

      // 4. Regla del Colchón de Seguridad Obligatorio (Líneas Amplias):
      // Veto a líneas ajustadas individuales de menos de 1.5 goles (Under 1.5 individual) y Under 1.5 total
      if (
        m.market.id === "goals_home_under_15" ||
        m.market.id === "goals_away_under_15" ||
        m.market.id === "goals_under_15" ||
        m.market.id === "corners_over_95" ||
        m.market.id === "corners_over_105"
      ) {
        return false;
      }

      return true;
    });

    if (matchingMarkets.length === 0) {
      skippedMatches.push({
        matchId: match.id,
        matchLabel: `${homeTeam.shortName} vs ${awayTeam.shortName}`,
        matchTime: match.time,
        reason: "below_threshold",
        detail: `Ningún mercado alcanzó ≥${minConfidence}% Confianza y ≥${minProbability}% Probabilidad.`,
      });
      continue;
    }

    const resultSummary = buildResultSummary(match, homeTeam, awayTeam, analysis.markets);
    if (resultSummary) resultSummaries.push(resultSummary);

    // Sort matching markets by overall score (confidence + probability)
    matchingMarkets.sort((a, b) => {
      const scoreA = a.confidence * 0.5 + a.statisticalEstimate * 0.5;
      const scoreB = b.confidence * 0.5 + b.statisticalEstimate * 0.5;
      return scoreB - scoreA;
    });

    // Limit to maxPerMatch selections for this match
    const selectedForMatch = matchingMarkets.slice(0, maxPerMatch);

    for (const marketEval of selectedForMatch) {
      const decimalOdds =
        marketEval.odds?.decimalOdds ??
        Math.max(1.1, +(100 / Math.max(1, marketEval.statisticalEstimate)).toFixed(2));

      selections.push({
        matchId: match.id,
        matchLabel: `${homeTeam.shortName} vs ${awayTeam.shortName}`,
        competitionName: match.competitionId.replace(/-/g, " ").toUpperCase(),
        matchDate: match.date,
        matchTime: match.time,
        homeTeam,
        awayTeam,
        marketEval,
        confidence: marketEval.confidence,
        probability: marketEval.statisticalEstimate,
        odds: decimalOdds,
      });
    }
  }

  // Sort overall selections by confidence * probability desc
  selections.sort((a, b) => b.confidence * b.probability - a.confidence * a.probability);

  const finalSelections = Number.isFinite(maxSelections) ? selections.slice(0, maxSelections) : selections;

  const totalSelections = finalSelections.length;
  const combinedOdds =
    totalSelections > 0
      ? +finalSelections.reduce((prod, sel) => prod * sel.odds, 1).toFixed(2)
      : 1.0;

  const averageConfidence =
    totalSelections > 0
      ? parseFloat(
          (finalSelections.reduce((sum, sel) => sum + sel.confidence, 0) / totalSelections).toFixed(1)
        )
      : 0;

  const averageProbability =
    totalSelections > 0
      ? parseFloat(
          (finalSelections.reduce((sum, sel) => sum + sel.probability, 0) / totalSelections).toFixed(1)
        )
      : 0;

  return {
    id: `ticket-${minConfidence}-${minProbability}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    minConfidence,
    minProbability,
    totalSelections,
    combinedOdds,
    averageConfidence,
    averageProbability,
    maxPerMatch,
    selectedMatchId: matchId,
    selections: finalSelections,
    resultSummaries,
    skippedMatches,
  };
}
