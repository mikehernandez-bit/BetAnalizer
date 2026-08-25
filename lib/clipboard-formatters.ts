import { AnalysisResult, Match, MarketEvaluation, TeamMatchRecord } from "@/types";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { buildAnalysisId, resolveAnalysisById } from "@/services/analysis-service";
import { estimateFeaturedStats, getTodayIso } from "@/services/match-service";
import { getTeamMatchPool } from "@/data/team-history";
import { COMPETITION_TYPE_LABEL, MATCH_STATUS_LABEL, DATA_QUALITY_LABEL } from "@/lib/labels";
import { formatDateLong, relativeDayLabel } from "@/utils/formatters";
import type {
  TennisAnalysis,
  TennisHistoryMatch,
  TennisMarketAuditResult,
  TennisMarketPrediction,
  TennisPlayerProfile,
  TennisRecordedOutcome,
  TennisSetScore,
  TennisStoredEvent,
} from "@/types/tennis";
import { analyzeTennisMatch, surfaceLabel } from "@/services/tennis-analysis-service";
import { auditTennisMarkets } from "@/lib/tennis-outcomes";

/**
 * Copia texto al portapapeles de forma robusta con soporte para APIs modernas y fallback tradicional.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback a document.execCommand si navigator.clipboard falla
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Error al copiar al portapapeles:", err);
    return false;
  }
}

function recTennisEmoji(rec: string): string {
  if (rec === "fuerte") return "🟢 [RECOMENDACIÓN: FUERTE]";
  if (rec === "moderada") return "🟡 [RECOMENDACIÓN: MODERADA]";
  return "⚪ [INFORMATIVO / EVITAR]";
}

function recFootballEmoji(rec: string, conf: number): string {
  if (rec === "recomendado") {
    return conf >= 80 ? "🟢 [RECOMENDACIÓN: FUERTE]" : "🟡 [RECOMENDACIÓN: RECOMENDADO]";
  }
  if (rec === "sin_datos_suficientes") return "❓ [SIN DATOS SUFICIENTES]";
  return "⚪ [INFORMATIVO / EVITAR]";
}

function formatTennisSets(sets: TennisSetScore[]): string {
  return sets
    .map((s) => {
      const pTb = s.playerTiebreakPoints !== undefined ? `(${s.playerTiebreakPoints})` : "";
      const oTb = s.opponentTiebreakPoints !== undefined ? `(${s.opponentTiebreakPoints})` : "";
      return `${s.playerGames}${pTb}-${s.opponentGames}${oTb}`;
    })
    .join(" ");
}

function wonTennisMatch(match: TennisHistoryMatch): boolean {
  if (match.winner) return match.winner === "player";
  const pWon = match.sets.filter((s) => s.playerGames > s.opponentGames).length;
  return pWon > match.sets.length / 2;
}

// ----------------------------------------------------------------------------
// TENIS: Formateador Exhaustivo (Todos los 20 partidos, perfiles y 17 mercados)
// ----------------------------------------------------------------------------

export function formatTennisStoredEventToClipboard(
  event: TennisStoredEvent,
  outcome?: TennisRecordedOutcome,
  providedAnalysis?: TennisAnalysis
): string {
  const analysis = providedAnalysis ?? analyzeTennisMatch(event.input);
  const p1 = analysis.profiles.player1;
  const p2 = analysis.profiles.player2;
  const p1Matches = event.input.player1.matches;
  const p2Matches = event.input.player2.matches;

  const lines: string[] = [
    "🎾 ============================================================================",
    `📊 BETANALYZER — REPORTE COMPLETO DE ANÁLISIS DE TENIS`,
    "============================================================================",
    `🏆 Torneo: ${event.input.tournament}${event.input.round ? ` · Ronda: ${event.input.round}` : ""}`,
    `⚔️ Encuentro: ${event.input.player1.name} vs ${event.input.player2.name}`,
    `📅 Fecha/Hora: ${event.input.date}${event.input.time ? ` · ${event.input.time}` : ""}`,
    `🏟️ Superficie: ${surfaceLabel(event.input.surface).toUpperCase()} · Formato: Al mejor de ${event.input.bestOf} sets`,
    `📈 Estado del Evento: ${outcome ? "FINALIZADO (Resultado Oficial Registrado)" : event.status === "completed" ? "FINALIZADO" : "PROGRAMADO"}`,
  ];

  if (outcome) {
    const hit = outcome.winner === analysis.projectedWinner;
    lines.push(
      `🏁 Resultado Final Oficial: Ganador: ${outcome.winner} | Marcador: ${outcome.score}`,
      `   • Auditoría Ganador del Partido: [${hit ? "ACERTADO ✅" : "FALLADO ❌"}] (Proyección: ${analysis.projectedWinner})`
    );
  }

  lines.push(
    "",
    "🎯 PRONÓSTICO PRINCIPAL Y PROYECCIÓN DEL MODELO",
    "----------------------------------------------------------------------------",
    `• Ganador Proyectado: ${analysis.projectedWinner}`,
    `• Probabilidad de Victoria: ${analysis.projectedWinnerProbability}%`,
    `• Marcador de Sets Proyectado: ${analysis.projectedScore}`,
    `• Confianza de la Muestra: ${analysis.markets[0]?.confidence ?? 75}% (${p1.matchesUsed + p2.matchesUsed} partidos oficiales finalizados)`,
    analysis.warnings.length > 0 ? `• Advertencias de Muestra: ${analysis.warnings.join(" | ")}` : "",
    ""
  );

  // Perfiles estadísticos consolidados
  lines.push(
    "📊 PERFILES ESTADÍSTICOS COMPARATIVOS (Muestra de 20 Partidos)",
    "----------------------------------------------------------------------------",
    `🎾 Jugador 1: ${event.input.player1.name}${event.input.player1.ranking ? ` (Ranking ATP: ${event.input.player1.ranking})` : ""}`,
    `   • Victorias Globales: ${p1.winRate}% (${p1.matchesUsed} finalizados)`,
    `   • Victorias en ${surfaceLabel(event.input.surface)}: ${p1.surfaceWinRate}% (${p1.surfaceMatches} partidos)`,
    `   • Forma Ponderada (Últimos 20): ${p1.weightedWinRate}% | Sets Ganados: ${p1.setWinRate}%`,
    `   • Primer Set Ganado: ${p1.firstSetWinRate}% | Segundo Set Ganado: ${p1.secondSetWinRate}%`,
    `   • Tasa de Set Decisivo (3er/5to set): ${p1.decidingSetRate}%`,
    `   • Juegos por Partido (Ganados / Perdidos / Total): ${p1.averageGamesWon.toFixed(1)} / ${p1.averageGamesLost.toFixed(1)} / ${p1.averageTotalGames.toFixed(1)}`,
    `   • Sets con Más de 9.5 Juegos: Set 1 (${p1.firstSetOver95Rate.toFixed(0)}%) | Set 2 (${p1.secondSetOver95Rate.toFixed(0)}%)`,
    "",
    `🎾 Jugador 2: ${event.input.player2.name}${event.input.player2.ranking ? ` (Ranking ATP: ${event.input.player2.ranking})` : ""}`,
    `   • Victorias Globales: ${p2.winRate}% (${p2.matchesUsed} finalizados)`,
    `   • Victorias en ${surfaceLabel(event.input.surface)}: ${p2.surfaceWinRate}% (${p2.surfaceMatches} partidos)`,
    `   • Forma Ponderada (Últimos 20): ${p2.weightedWinRate}% | Sets Ganados: ${p2.setWinRate}%`,
    `   • Primer Set Ganado: ${p2.firstSetWinRate}% | Segundo Set Ganado: ${p2.secondSetWinRate}%`,
    `   • Tasa de Set Decisivo (3er/5to set): ${p2.decidingSetRate}%`,
    `   • Juegos por Partido (Ganados / Perdidos / Total): ${p2.averageGamesWon.toFixed(1)} / ${p2.averageGamesLost.toFixed(1)} / ${p2.averageTotalGames.toFixed(1)}`,
    `   • Sets con Más de 9.5 Juegos: Set 1 (${p2.firstSetOver95Rate.toFixed(0)}%) | Set 2 (${p2.secondSetOver95Rate.toFixed(0)}%)`,
    "",
    `⚔️ Enfrentamientos Directos Previos (H2H): ${analysis.headToHead.matches} partido(s) prepartido`,
    `   • Balance: ${analysis.headToHead.player1Wins} victorias ${event.input.player1.name} - ${analysis.headToHead.player2Wins} victorias ${event.input.player2.name}`,
    analysis.headToHead.records.length > 0
      ? analysis.headToHead.records.map((r, i) => `     #${i + 1} | ${r.date} | ${surfaceLabel(r.surface)} | Ganador: ${r.winner} | Sets: ${formatTennisSets(r.setsFromPlayer1)}`).join("\n")
      : "     (Sin enfrentamientos previos registrados)",
    "",
    `👥 Rivales en Común (${analysis.commonOpponents.length} comparaciones):`,
    `   • Ventaja Comparativa: ${analysis.commonOpponentAdvantage > 0 ? event.input.player1.name : analysis.commonOpponentAdvantage < 0 ? event.input.player2.name : "Igualdad"} (${Math.abs(analysis.commonOpponentAdvantage)} pts)`,
    analysis.commonOpponents.length > 0
      ? analysis.commonOpponents.map((c) => `     • vs ${c.opponent}: ${event.input.player1.name} (WR: ${c.player1WinRate}%, Dif Juegos: ${c.player1GameDifferential > 0 ? `+${c.player1GameDifferential}` : c.player1GameDifferential}) vs ${event.input.player2.name} (WR: ${c.player2WinRate}%, Dif Juegos: ${c.player2GameDifferential > 0 ? `+${c.player2GameDifferential}` : c.player2GameDifferential})`).join("\n")
      : "     (Sin rivales comunes en la muestra)",
    ""
  );

  // --------------------------------------------------------------------------
  // HISTORIAL DE LOS 20 PARTIDOS DE CADA JUGADOR
  // --------------------------------------------------------------------------
  lines.push(
    "📜 ============================================================================",
    `🎾 HISTORIAL DE LOS ${p1Matches.length} ÚLTIMOS PARTIDOS: ${event.input.player1.name}`,
    "============================================================================"
  );
  p1Matches.forEach((m, idx) => {
    const won = wonTennisMatch(m);
    const setsStr = formatTennisSets(m.sets);
    const num = String(idx + 1).padStart(2, " ");
    const statusNote = m.status !== "completed" ? ` [${m.status.toUpperCase()}]` : "";
    const tourStr = m.tournament ? ` | ${m.tournament}` : "";
    lines.push(
      `#${num} | ${m.date} | ${surfaceLabel(m.surface).padEnd(14, " ")}${tourStr} | vs ${m.opponent} | Sets: ${setsStr} | ${won ? "VICTORIA (G) ✅" : "DERROTA (P) ❌"}${statusNote}`
    );
  });

  lines.push(
    "",
    "📜 ============================================================================",
    `🎾 HISTORIAL DE LOS ${p2Matches.length} ÚLTIMOS PARTIDOS: ${event.input.player2.name}`,
    "============================================================================"
  );
  p2Matches.forEach((m, idx) => {
    const won = wonTennisMatch(m);
    const setsStr = formatTennisSets(m.sets);
    const num = String(idx + 1).padStart(2, " ");
    const statusNote = m.status !== "completed" ? ` [${m.status.toUpperCase()}]` : "";
    const tourStr = m.tournament ? ` | ${m.tournament}` : "";
    lines.push(
      `#${num} | ${m.date} | ${surfaceLabel(m.surface).padEnd(14, " ")}${tourStr} | vs ${m.opponent} | Sets: ${setsStr} | ${won ? "VICTORIA (G) ✅" : "DERROTA (P) ❌"}${statusNote}`
    );
  });

  // --------------------------------------------------------------------------
  // TODOS LOS 17 MERCADOS DE TENIS
  // --------------------------------------------------------------------------
  const audits = outcome ? auditTennisMarkets(analysis, outcome) : [];
  const auditMap = new Map<string, TennisMarketAuditResult>();
  audits.forEach((a) => auditMap.set(a.marketId, a));

  if (outcome) {
    const hits = audits.filter((a) => a.status === "hit").length;
    const misses = audits.filter((a) => a.status === "miss").length;
    lines.push(
      "",
      "🏁 ============================================================================",
      `📋 AUDITORÍA OFICIAL DE RESULTADOS EN LOS 17 MERCADOS`,
      "============================================================================",
      `• Resultado Oficial: ${outcome.winner} (${outcome.score})`,
      `• Desempeño Global: ${hits} Aciertos ✅ | ${misses} Fallos ❌ | Precisión: ${Math.round((hits / audits.length) * 100)}%`
    );
  }

  lines.push(
    "",
    `📋 ============================================================================`,
    `🎯 TODOS LOS MERCADOS EVALUADOS (${analysis.markets.length} MERCADOS)`,
    `============================================================================`
  );

  const sortedTennisMarkets = [...analysis.markets].sort((a, b) => {
    const recOrder = { fuerte: 0, moderada: 1, evitar: 2 };
    const rA = recOrder[a.recommendation] ?? 2;
    const rB = recOrder[b.recommendation] ?? 2;
    return rA - rB || b.probability - a.probability || b.confidence - a.confidence;
  });

  sortedTennisMarkets.forEach((m, idx) => {
    const auditItem = auditMap.get(m.id);
    const auditStatusStr = auditItem
      ? ` | AUDITORÍA: ${auditItem.status === "hit" ? "ACERTADO ✅" : auditItem.status === "miss" ? "FALLADO ❌" : "NULO ⚪"} (Real: ${auditItem.actual})`
      : "";

    lines.push(
      `#${idx + 1}. ${recTennisEmoji(m.recommendation)} ${m.market.toUpperCase()}`,
      `   • Selección: ${m.selection}`,
      `   • Probabilidad Estimada: ${m.probability}% | Confianza del Modelo: ${m.confidence}%${auditStatusStr}`,
      m.evidence.length > 0 ? `   • Evidencia Estadística: ${m.evidence.join(" ")}` : "",
      ""
    );
  });

  lines.push(
    "============================================================================",
    "📌 BetAnalyzer — Información estadística orientativa para tenis profesional.",
    "============================================================================"
  );

  return lines.filter((line) => line !== "").join("\n");
}

export function formatTennisAnalysisToClipboard(analysis: TennisAnalysis): string {
  const fakeStoredEvent: TennisStoredEvent = {
    id: analysis.id,
    status: "scheduled",
    input: analysis.input,
    sourceUrls: [],
  };
  return formatTennisStoredEventToClipboard(fakeStoredEvent, undefined, analysis);
}

// ----------------------------------------------------------------------------
// FÚTBOL: Formateador Exhaustivo (Todos los partidos, perfiles y mercados)
// ----------------------------------------------------------------------------

export function formatFootballAnalysisToClipboard(analysis: AnalysisResult): string {
  const home = getTeamById(analysis.match.homeTeamId);
  const away = getTeamById(analysis.match.awayTeamId);
  const competition = getCompetitionById(analysis.match.competitionId);

  const homeName = home?.name ?? analysis.match.homeTeamId;
  const awayName = away?.name ?? analysis.match.awayTeamId;
  const compName = competition?.name ?? analysis.match.competitionId;

  const homeMatches = analysis.homeForm.matches;
  const awayMatches = analysis.awayForm.matches;

  const lines: string[] = [
    "⚽ ============================================================================",
    `📊 BETANALYZER — REPORTE COMPLETO DE ANÁLISIS DE FÚTBOL`,
    "============================================================================",
    `🏆 Competición: ${compName} (${COMPETITION_TYPE_LABEL[analysis.match.competitionType] || ""}) · Jornada ${analysis.match.matchday}`,
    `⚔️ Encuentro: ${homeName} vs ${awayName}`,
    `📅 Fecha/Hora: ${formatDateLong(analysis.match.date)} · ${analysis.match.time}`,
    `🏟️ Estadio: ${analysis.match.neutralVenue ? `Sede Neutral · ${analysis.match.stadium}` : analysis.match.stadium}`,
    `📈 Estado del Partido: ${MATCH_STATUS_LABEL[analysis.match.status]}`,
  ];

  if (analysis.match.statistics) {
    lines.push(
      `🏁 Resultado Final Oficial: ${homeName} ${analysis.match.statistics.homeGoals} - ${analysis.match.statistics.awayGoals} ${awayName}`,
      `   • Córners: ${analysis.match.statistics.homeCorners ?? "—"} - ${analysis.match.statistics.awayCorners ?? "—"}`,
      `   • Tarjetas Amarillas: ${analysis.match.statistics.homeYellowCards ?? "—"} - ${analysis.match.statistics.awayYellowCards ?? "—"}`,
      `   • Tarjetas Rojas: ${analysis.match.statistics.homeRedCards ?? "0"} - ${analysis.match.statistics.awayRedCards ?? "0"}`
    );
  }

  lines.push(
    "",
    "🎯 RESUMEN Y PRONÓSTICO DEL MODELO",
    "----------------------------------------------------------------------------",
    `• Confianza General: ${analysis.overallConfidence}%`,
    `• Calidad de Datos: ${DATA_QUALITY_LABEL[analysis.dataQuality]} (${analysis.matchesAnalyzed} partidos oficiales analizados)`,
    `• Fecha de Generación: ${new Date(analysis.generatedAt).toLocaleString("es-ES")}`,
    "",
    `📝 Lectura Rápida:`,
    analysis.quickRead,
    ""
  );

  if (analysis.bestBet) {
    lines.push(
      `⭐ MEJOR APUESTA RECOMENDADA (BEST BET):`,
      `   • Mercado: ${analysis.bestBet.marketEvaluation.market.name}`,
      `   • Confianza: ${analysis.bestBet.marketEvaluation.confidence}% | Probabilidad Estimada: ${analysis.bestBet.marketEvaluation.statisticalEstimate}%`,
      `   • Nivel: ${analysis.bestBet.marketEvaluation.confidenceLevel.toUpperCase()}`,
      analysis.bestBet.marketEvaluation.odds ? `   • Cuota Oficial: ${analysis.bestBet.marketEvaluation.odds.decimalOdds}` : "",
      `   • Argumentos: ${analysis.bestBet.reasons.join(" ")}`,
      analysis.bestBet.risks.length > 0
        ? `   • Factores de Riesgo: ${analysis.bestBet.risks.map((r) => `[${r.severity.toUpperCase()}] ${r.description}`).join(" | ")}`
        : "",
      ""
    );
  }

  // Perfiles estadísticos consolidados
  lines.push(
    "📊 PERFILES ESTADÍSTICOS Y MÉTRICAS DE EQUIPO",
    "----------------------------------------------------------------------------",
    `🏠 Local: ${homeName} (Posición en Tabla: ${home?.position ?? "—"})`,
    `   • Forma Reciente: ${home?.form.join(" ") ?? "—"}`,
    `   • Goles a Favor / En Contra (Media): ${analysis.homeForm.stats.goalsFor?.average.toFixed(1) ?? "—"} / ${analysis.homeForm.stats.goalsAgainst?.average.toFixed(1) ?? "—"}`,
    `   • Córners a Favor / En Contra (Media): ${analysis.homeForm.stats.cornersFor?.average.toFixed(1) ?? "—"} / ${analysis.homeForm.stats.cornersAgainst?.average.toFixed(1) ?? "—"}`,
    `   • Remates a Puerta (Media): ${analysis.homeForm.stats.shotsOnTargetFor?.average.toFixed(1) ?? "—"}`,
    `   • Posesión Media: ${analysis.homeForm.stats.possession?.average.toFixed(0) ?? "—"}%`,
    "",
    `✈️ Visitante: ${awayName} (Posición en Tabla: ${away?.position ?? "—"})`,
    `   • Forma Reciente: ${away?.form.join(" ") ?? "—"}`,
    `   • Goles a Favor / En Contra (Media): ${analysis.awayForm.stats.goalsFor?.average.toFixed(1) ?? "—"} / ${analysis.awayForm.stats.goalsAgainst?.average.toFixed(1) ?? "—"}`,
    `   • Córners a Favor / En Contra (Media): ${analysis.awayForm.stats.cornersFor?.average.toFixed(1) ?? "—"} / ${analysis.awayForm.stats.cornersAgainst?.average.toFixed(1) ?? "—"}`,
    `   • Remates a Puerta (Media): ${analysis.awayForm.stats.shotsOnTargetFor?.average.toFixed(1) ?? "—"}`,
    `   • Posesión Media: ${analysis.awayForm.stats.possession?.average.toFixed(0) ?? "—"}%`,
    "",
    `⚔️ Enfrentamientos Directos (H2H): ${analysis.headToHead.summary.totalMatches} partidos registrados`,
    `   • Balance: Victorias ${homeName}: ${analysis.headToHead.summary.teamAWins} | Empates: ${analysis.headToHead.summary.draws} | Victorias ${awayName}: ${analysis.headToHead.summary.teamBWins}`,
    `   • Media de Goles en H2H: ${analysis.headToHead.summary.avgGoals.toFixed(1)} | Ambos Marcan en H2H: ${analysis.headToHead.summary.bothScoredPct}%`,
    ""
  );

  // Patrones cruzados 100%
  const perfectPatterns = analysis.crossPatterns.filter(
    (p) => p.teamAStat.percentage === 100 && p.teamBStat.percentage === 100
  );
  if (perfectPatterns.length > 0) {
    lines.push(
      "⚡ PATRONES CRUZADOS 100% SINCRONIZADOS",
      "----------------------------------------------------------------------------"
    );
    perfectPatterns.forEach((p) => {
      lines.push(`• [100% Sincronizado] ${p.marketLabel}: ${p.conclusion}`);
    });
    lines.push("");
  }

  // --------------------------------------------------------------------------
  // HISTORIAL COMPLETO DE PARTIDOS DE AMBOS EQUIPOS
  // --------------------------------------------------------------------------
  lines.push(
    "📜 ============================================================================",
    `⚽ HISTORIAL DE LOS ${homeMatches.length} PARTIDOS ANALIZADOS: ${homeName}`,
    "============================================================================"
  );
  homeMatches.forEach((m, idx) => {
    const num = String(idx + 1).padStart(2, " ");
    const resLetter = m.result === "W" ? "VICTORIA (G) ✅" : m.result === "D" ? "EMPATE (E) ⚪" : "DERROTA (P) ❌";
    const venue = m.venue === "local" ? "Casa" : "Fuera";
    const halfScore = m.goalsForFirstHalf !== undefined ? ` (1T: ${m.goalsForFirstHalf}-${m.goalsAgainstFirstHalf ?? 0})` : "";
    const oppTeam = getTeamById(m.opponentId);
    const oppName = oppTeam?.name ?? m.opponentId;
    const cardsStr = `Tarjetas: ${m.yellowCards}A ${m.redCards}R${m.yellowCardsAgainst !== undefined ? ` vs ${m.yellowCardsAgainst}A ${m.redCardsAgainst ?? 0}R` : ""}`;
    lines.push(
      `#${num} | ${m.date} | ${venue.padEnd(5, " ")} | vs ${oppName.padEnd(22, " ")} | Marcador: ${m.goalsFor}-${m.goalsAgainst}${halfScore} | Córners: ${m.cornersFor}-${m.cornersAgainst} | ${cardsStr} | ${resLetter}`
    );
  });

  lines.push(
    "",
    "📜 ============================================================================",
    `⚽ HISTORIAL DE LOS ${awayMatches.length} PARTIDOS ANALIZADOS: ${awayName}`,
    "============================================================================"
  );
  awayMatches.forEach((m, idx) => {
    const num = String(idx + 1).padStart(2, " ");
    const resLetter = m.result === "W" ? "VICTORIA (G) ✅" : m.result === "D" ? "EMPATE (E) ⚪" : "DERROTA (P) ❌";
    const venue = m.venue === "local" ? "Casa" : "Fuera";
    const halfScore = m.goalsForFirstHalf !== undefined ? ` (1T: ${m.goalsForFirstHalf}-${m.goalsAgainstFirstHalf ?? 0})` : "";
    const oppTeam = getTeamById(m.opponentId);
    const oppName = oppTeam?.name ?? m.opponentId;
    const cardsStr = `Tarjetas: ${m.yellowCards}A ${m.redCards}R${m.yellowCardsAgainst !== undefined ? ` vs ${m.yellowCardsAgainst}A ${m.redCardsAgainst ?? 0}R` : ""}`;
    lines.push(
      `#${num} | ${m.date} | ${venue.padEnd(5, " ")} | vs ${oppName.padEnd(22, " ")} | Marcador: ${m.goalsFor}-${m.goalsAgainst}${halfScore} | Córners: ${m.cornersFor}-${m.cornersAgainst} | ${cardsStr} | ${resLetter}`
    );
  });

  // --------------------------------------------------------------------------
  // TODOS LOS MERCADOS EVALUADOS
  // --------------------------------------------------------------------------
  lines.push(
    "",
    `📋 ============================================================================`,
    `🎯 TODOS LOS MERCADOS EVALUADOS (${analysis.markets.length} MERCADOS)`,
    `============================================================================`
  );

  const sortedMarkets = [...analysis.markets].sort((a, b) => {
    const recOrder = { recomendado: 0, evitar: 1, sin_datos_suficientes: 2 };
    const rA = recOrder[a.recommendation] ?? 2;
    const rB = recOrder[b.recommendation] ?? 2;
    return rA - rB || b.confidence - a.confidence || b.statisticalEstimate - a.statisticalEstimate;
  });

  sortedMarkets.forEach((m, idx) => {
    const recBadge = recFootballEmoji(m.recommendation, m.confidence);

    lines.push(
      `#${idx + 1}. ${recBadge} ${m.market.name.toUpperCase()}`,
      `   • Categoría: ${m.market.category.toUpperCase()} | Nivel de Riesgo: ${m.riskLevel.toUpperCase()}`,
      `   • Probabilidad Estimada: ${m.statisticalEstimate}% | Confianza del Modelo: ${m.confidence}% (${m.confidenceLevel.toUpperCase()})`,
      m.odds ? `   • Cuota Oficial: ${m.odds.decimalOdds} (Calificación de Valor: ${m.valueLevel ?? "Sin valor"})` : "",
      m.positivePatterns.length > 0
        ? `   • Argumentos Estadísticos a Favor: ${m.positivePatterns.join("; ")}`
        : "",
      m.contradictions.length > 0
        ? `   • Contradicciones y Riesgos Detectados: ${m.contradictions.join("; ")}`
        : "",
      ""
    );
  });

  lines.push(
    "============================================================================",
    "📌 BetAnalyzer — Información estadística orientativa. Las tendencias históricas no garantizan resultados futuros.",
    "============================================================================"
  );

  return lines.filter((line) => line !== "").join("\n");
}

export function formatFootballMatchToClipboard(match: Match): string {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  if (!home || !away) {
    return `Partido: ${match.homeTeamId} vs ${match.awayTeamId} (${match.date} ${match.time})`;
  }

  const analysisId = buildAnalysisId(home.id, away.id, 15);
  const analysis = resolveAnalysisById(analysisId);
  if (analysis) {
    return formatFootballAnalysisToClipboard(analysis);
  }

  // Si no hay análisis pre-resuelto, construir la ficha con el pool completo de partidos históricos
  const stats = estimateFeaturedStats(home.id, away.id);
  const competition = getCompetitionById(match.competitionId);
  const homePool = getTeamMatchPool(home.id);
  const awayPool = getTeamMatchPool(away.id);

  const lines = [
    "⚽ ============================================================================",
    `📊 BETANALYZER — FICHA Y REPORTE COMPLETO DE PARTIDO DE FÚTBOL`,
    "============================================================================",
    `🏆 Competición: ${competition?.name ?? match.competitionId} · Jornada ${match.matchday}`,
    `⚔️ Encuentro: ${home.name} vs ${away.name}`,
    `📅 Fecha/Hora: ${formatDateLong(match.date)} · ${match.time}`,
    `🏟️ Estadio: ${match.stadium}`,
    `📈 Estado: ${MATCH_STATUS_LABEL[match.status]}`,
    "",
    "🎯 ESTIMACIONES DESTACADAS PREPARTIDO",
    "----------------------------------------------------------------------------",
    `• Equipo Favorecido: ${stats.favoredTeamId === home.id ? home.name : away.name}`,
    `• Probabilidad Estimada: ${stats.probability}%`,
    `• Patrones Estadísticos Detectados: ${stats.strongPatterns}`,
    "",
    `🏠 Local: ${home.name} (Posición: ${home.position} · Forma: ${home.form.join(" ")})`,
    `✈️ Visitante: ${away.name} (Posición: ${away.position} · Forma: ${away.form.join(" ")})`,
    "",
    `📜 HISTORIAL DE LOS ${homePool.length} PARTIDOS: ${home.name}`,
    "----------------------------------------------------------------------------",
  ];

  homePool.forEach((m, idx) => {
    const num = String(idx + 1).padStart(2, " ");
    const resLetter = m.result === "W" ? "VICTORIA (G) ✅" : m.result === "D" ? "EMPATE (E) ⚪" : "DERROTA (P) ❌";
    const venue = m.venue === "local" ? "Casa" : "Fuera";
    const oppTeam = getTeamById(m.opponentId);
    const oppName = oppTeam?.name ?? m.opponentId;
    lines.push(`#${num} | ${m.date} | ${venue.padEnd(5, " ")} | vs ${oppName.padEnd(20, " ")} | ${m.goalsFor}-${m.goalsAgainst} | Córners: ${m.cornersFor}-${m.cornersAgainst} | ${resLetter}`);
  });

  lines.push(
    "",
    `📜 HISTORIAL DE LOS ${awayPool.length} PARTIDOS: ${away.name}`,
    "----------------------------------------------------------------------------"
  );

  awayPool.forEach((m, idx) => {
    const num = String(idx + 1).padStart(2, " ");
    const resLetter = m.result === "W" ? "VICTORIA (G) ✅" : m.result === "D" ? "EMPATE (E) ⚪" : "DERROTA (P) ❌";
    const venue = m.venue === "local" ? "Casa" : "Fuera";
    const oppTeam = getTeamById(m.opponentId);
    const oppName = oppTeam?.name ?? m.opponentId;
    lines.push(`#${num} | ${m.date} | ${venue.padEnd(5, " ")} | vs ${oppName.padEnd(20, " ")} | ${m.goalsFor}-${m.goalsAgainst} | Córners: ${m.cornersFor}-${m.cornersAgainst} | ${resLetter}`);
  });

  lines.push(
    "",
    "============================================================================",
    "📌 BetAnalyzer — Información estadística orientativa. Abre el análisis completo para ver todos los mercados evaluados.",
    "============================================================================"
  );

  return lines.join("\n");
}
