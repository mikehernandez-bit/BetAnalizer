import { AnalysisResult, Match, MarketEvaluation } from "@/types";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { buildAnalysisId, resolveAnalysisById } from "@/services/analysis-service";
import { estimateFeaturedStats, getTodayIso } from "@/services/match-service";
import { COMPETITION_TYPE_LABEL, MATCH_STATUS_LABEL, DATA_QUALITY_LABEL } from "@/lib/labels";
import { formatDateLong, relativeDayLabel } from "@/utils/formatters";
import type {
  TennisAnalysis,
  TennisMarketPrediction,
  TennisPlayerProfile,
  TennisRecordedOutcome,
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

function recEmoji(rec: string): string {
  if (rec === "fuerte") return "🟢 [RECOMENDACIÓN: FUERTE]";
  if (rec === "moderada") return "🟡 [RECOMENDACIÓN: MODERADA]";
  return "⚪ [INFORMATIVO / EVITAR]";
}

// ----------------------------------------------------------------------------
// FÚTBOL: Formateador Completo al Portapapeles
// ----------------------------------------------------------------------------

export function formatFootballAnalysisToClipboard(analysis: AnalysisResult): string {
  const home = getTeamById(analysis.match.homeTeamId);
  const away = getTeamById(analysis.match.awayTeamId);
  const competition = getCompetitionById(analysis.match.competitionId);

  const homeName = home?.name ?? analysis.match.homeTeamId;
  const awayName = away?.name ?? analysis.match.awayTeamId;
  const compName = competition?.name ?? analysis.match.competitionId;

  const lines: string[] = [
    "⚽ ========================================================",
    `📊 BETANALYZER — ANÁLISIS COMPLETO DE FÚTBOL`,
    "========================================================",
    `🏆 Competición: ${compName} (${COMPETITION_TYPE_LABEL[analysis.match.competitionType] || ""}) · Jornada ${analysis.match.matchday}`,
    `⚔️ Encuentro: ${homeName} vs ${awayName}`,
    `📅 Fecha/Hora: ${formatDateLong(analysis.match.date)} · ${analysis.match.time}`,
    `🏟️ Estadio: ${analysis.match.neutralVenue ? `Sede Neutral · ${analysis.match.stadium}` : analysis.match.stadium}`,
    `📈 Estado: ${MATCH_STATUS_LABEL[analysis.match.status]}`,
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
    "--------------------------------------------------------",
    `• Confianza General: ${analysis.overallConfidence}%`,
    `• Calidad de Datos: ${DATA_QUALITY_LABEL[analysis.dataQuality]} (${analysis.matchesAnalyzed} partidos oficiales)`,
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
      `   • Confianza: ${analysis.bestBet.marketEvaluation.confidence}% | Estimación: ${analysis.bestBet.marketEvaluation.statisticalEstimate}%`,
      `   • Nivel: ${analysis.bestBet.marketEvaluation.confidenceLevel.toUpperCase()}`,
      `   • Argumentos: ${analysis.bestBet.reasons.join(" ")}`,
      analysis.bestBet.risks.length > 0
        ? `   • Factores de Riesgo: ${analysis.bestBet.risks.map((r) => `[${r.severity.toUpperCase()}] ${r.description}`).join(" | ")}`
        : "",
      ""
    );
  }

  // Perfil de los equipos
  lines.push(
    "👥 PERFILES Y FORMA ESTADÍSTICA",
    "--------------------------------------------------------",
    `🏠 Local: ${homeName} (Posición: ${home?.position ?? "—"})`,
    `   • Forma Reciente: ${home?.form.join(" ") ?? "—"}`,
    `   • Goles a Favor / En Contra (Media): ${analysis.homeForm.stats.goalsFor?.average.toFixed(1) ?? "—"} / ${analysis.homeForm.stats.goalsAgainst?.average.toFixed(1) ?? "—"}`,
    `   • Córners a Favor / En Contra (Media): ${analysis.homeForm.stats.cornersFor?.average.toFixed(1) ?? "—"} / ${analysis.homeForm.stats.cornersAgainst?.average.toFixed(1) ?? "—"}`,
    `   • Remates a Puerta (Media): ${analysis.homeForm.stats.shotsOnTargetFor?.average.toFixed(1) ?? "—"}`,
    "",
    `✈️ Visitante: ${awayName} (Posición: ${away?.position ?? "—"})`,
    `   • Forma Reciente: ${away?.form.join(" ") ?? "—"}`,
    `   • Goles a Favor / En Contra (Media): ${analysis.awayForm.stats.goalsFor?.average.toFixed(1) ?? "—"} / ${analysis.awayForm.stats.goalsAgainst?.average.toFixed(1) ?? "—"}`,
    `   • Córners a Favor / En Contra (Media): ${analysis.awayForm.stats.cornersFor?.average.toFixed(1) ?? "—"} / ${analysis.awayForm.stats.cornersAgainst?.average.toFixed(1) ?? "—"}`,
    `   • Remates a Puerta (Media): ${analysis.awayForm.stats.shotsOnTargetFor?.average.toFixed(1) ?? "—"}`,
    "",
    `⚔️ Enfrentamientos Directos (H2H):`,
    `   • Total Partidos: ${analysis.headToHead.summary.totalMatches} (Victorias ${homeName}: ${analysis.headToHead.summary.teamAWins}, Empates: ${analysis.headToHead.summary.draws}, Victorias ${awayName}: ${analysis.headToHead.summary.teamBWins})`,
    `   • Media de Goles H2H: ${analysis.headToHead.summary.avgGoals.toFixed(1)} | Ambos Marcan en H2H: ${analysis.headToHead.summary.bothScoredPct}%`,
    ""
  );

  // Patrones cruzados 100%
  const perfectPatterns = analysis.crossPatterns.filter(
    (p) => p.teamAStat.percentage === 100 && p.teamBStat.percentage === 100
  );
  if (perfectPatterns.length > 0) {
    lines.push(
      "⚡ PATRONES CRUZADOS 100% SINCRONIZADOS",
      "--------------------------------------------------------"
    );
    perfectPatterns.forEach((p) => {
      lines.push(`• [100% Sincronizado] ${p.marketLabel}: ${p.conclusion}`);
    });
    lines.push("");
  }

  // Todos los mercados evaluados
  lines.push(
    `📋 TODOS LOS MERCADOS EVALUADOS (${analysis.markets.length} Mercados)`,
    "--------------------------------------------------------"
  );

  // Ordenar mercados: recomendados primero, luego por confianza descendente
  const sortedMarkets = [...analysis.markets].sort((a, b) => {
    const recOrder = { recomendado: 0, evitar: 1, sin_datos_suficientes: 2 };
    const rA = recOrder[a.recommendation] ?? 2;
    const rB = recOrder[b.recommendation] ?? 2;
    return rA - rB || b.confidence - a.confidence || b.statisticalEstimate - a.statisticalEstimate;
  });

  sortedMarkets.forEach((m) => {
    const recLabel = m.recommendation === "recomendado"
      ? (m.confidence >= 80 ? "🟢 [RECOMENDACIÓN: FUERTE]" : "🟡 [RECOMENDACIÓN: RECOMENDADO]")
      : "⚪ [INFORMATIVO / EVITAR]";

    lines.push(
      `${recLabel} ${m.market.name}`,
      `   • Categoría: ${m.market.category.toUpperCase()} | Riesgo: ${m.riskLevel.toUpperCase()}`,
      `   • Probabilidad Estimada: ${m.statisticalEstimate}% | Confianza del Modelo: ${m.confidence}% (${m.confidenceLevel})`,
      m.odds ? `   • Cuota / Valor: ${m.odds.decimalOdds} (Valor: ${m.valueLevel ?? "N/A"})` : "",
      m.positivePatterns.length > 0
        ? `   • Argumentos a favor: ${m.positivePatterns.slice(0, 3).join("; ")}`
        : "",
      m.contradictions.length > 0
        ? `   • Contradicciones/Riesgos: ${m.contradictions.slice(0, 2).join("; ")}`
        : "",
      ""
    );
  });

  lines.push(
    "========================================================",
    "📌 BetAnalyzer — Información estadística orientativa. Las tendencias históricas no garantizan resultados futuros.",
    "========================================================"
  );

  return lines.filter((line) => line !== "").join("\n");
}

export function formatFootballMatchToClipboard(match: Match): string {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  if (!home || !away) {
    return `Partido: ${match.homeTeamId} vs ${match.awayTeamId} (${match.date} ${match.time})`;
  }

  const analysisId = buildAnalysisId(home.id, away.id, 10);
  const analysis = resolveAnalysisById(analysisId);
  if (analysis) {
    return formatFootballAnalysisToClipboard(analysis);
  }

  // Fallback con estadísticas destacadas si aún no hay análisis completo resuelto
  const stats = estimateFeaturedStats(home.id, away.id);
  const competition = getCompetitionById(match.competitionId);

  const lines = [
    "⚽ ========================================================",
    `📊 BETANALYZER — FICHA DE PARTIDO DE FÚTBOL`,
    "========================================================",
    `🏆 Competición: ${competition?.name ?? match.competitionId} · Jornada ${match.matchday}`,
    `⚔️ Encuentro: ${home.name} vs ${away.name}`,
    `📅 Fecha/Hora: ${formatDateLong(match.date)} · ${match.time}`,
    `🏟️ Estadio: ${match.stadium}`,
    `📈 Estado: ${MATCH_STATUS_LABEL[match.status]}`,
    "",
    "🎯 ESTIMACIONES DESTACADAS PREPARTIDO",
    "--------------------------------------------------------",
    `• Equipo Favorecido: ${stats.favoredTeamId === home.id ? home.name : away.name}`,
    `• Probabilidad Estimada: ${stats.probability}%`,
    `• Patrones Estadísticos Detectados: ${stats.strongPatterns}`,
    "",
    `🏠 Local: ${home.name} (Forma: ${home.form.join(" ")})`,
    `✈️ Visitante: ${away.name} (Forma: ${away.form.join(" ")})`,
    "",
    "📌 BetAnalyzer — Abre el análisis completo para ver los más de 20 mercados auditados.",
  ];

  return lines.join("\n");
}

// ----------------------------------------------------------------------------
// TENIS: Formateador Completo al Portapapeles
// ----------------------------------------------------------------------------

export function formatTennisStoredEventToClipboard(
  event: TennisStoredEvent,
  outcome?: TennisRecordedOutcome,
  providedAnalysis?: TennisAnalysis
): string {
  const analysis = providedAnalysis ?? analyzeTennisMatch(event.input);
  const p1 = analysis.profiles.player1;
  const p2 = analysis.profiles.player2;

  const lines: string[] = [
    "🎾 ========================================================",
    `📊 BETANALYZER — ANÁLISIS COMPLETO DE TENIS`,
    "========================================================",
    `🏆 Torneo: ${event.input.tournament}${event.input.round ? ` · ${event.input.round}` : ""}`,
    `⚔️ Encuentro: ${event.input.player1.name} vs ${event.input.player2.name}`,
    `📅 Fecha/Hora: ${event.input.date}${event.input.time ? ` · ${event.input.time}` : ""}`,
    `🏟️ Superficie: ${surfaceLabel(event.input.surface).toUpperCase()} · Formato: Al mejor de ${event.input.bestOf} sets`,
    `📈 Estado: ${outcome ? "Finalizado (Oficial)" : event.status === "completed" ? "Finalizado" : "Programado"}`,
  ];

  if (outcome) {
    const hit = outcome.winner === analysis.projectedWinner;
    lines.push(
      `🏁 Resultado Final Oficial: ${outcome.winner} (${outcome.score})`,
      `   • Ganador Proyectado: ${analysis.projectedWinner} [${hit ? "ACERTADO ✅" : "FALLADO ❌"}]`
    );
  }

  lines.push(
    "",
    "🎯 PRONÓSTICO PRINCIPAL Y PROYECCIÓN",
    "--------------------------------------------------------",
    `• Ganador Proyectado: ${analysis.projectedWinner}`,
    `• Probabilidad de Victoria: ${analysis.projectedWinnerProbability}%`,
    `• Marcador Proyectado: ${analysis.projectedScore}`,
    `• Confianza de la Muestra: ${analysis.markets[0]?.confidence ?? 75}% (${p1.matchesUsed + p2.matchesUsed} partidos procesados)`,
    analysis.warnings.length > 0 ? `• Advertencias: ${analysis.warnings.join(" | ")}` : "",
    ""
  );

  lines.push(
    "👥 PERFILES DE LOS JUGADORES (Últimos 20 partidos)",
    "--------------------------------------------------------",
    `🎾 Jugador 1: ${event.input.player1.name}${event.input.player1.ranking ? ` (Ranking ATP: ${event.input.player1.ranking})` : ""}`,
    `   • Victorias Globales: ${p1.winRate}% (${p1.matchesUsed} finalizados)`,
    `   • Victorias en ${surfaceLabel(event.input.surface)}: ${p1.surfaceWinRate}% (${p1.surfaceMatches} partidos)`,
    `   • Forma Ponderada (20): ${p1.weightedWinRate}% | Sets Ganados: ${p1.setWinRate}%`,
    `   • Primer Set Ganado: ${p1.firstSetWinRate}% | Segundo Set Ganado: ${p1.secondSetWinRate}%`,
    `   • Juegos Promedio (Ganados / Perdidos): ${p1.averageGamesWon.toFixed(1)} / ${p1.averageGamesLost.toFixed(1)} (Total: ${p1.averageTotalGames.toFixed(1)})`,
    `   • Tasa de Set Decisivo (3er/5to set): ${p1.decidingSetRate}%`,
    "",
    `🎾 Jugador 2: ${event.input.player2.name}${event.input.player2.ranking ? ` (Ranking ATP: ${event.input.player2.ranking})` : ""}`,
    `   • Victorias Globales: ${p2.winRate}% (${p2.matchesUsed} finalizados)`,
    `   • Victorias en ${surfaceLabel(event.input.surface)}: ${p2.surfaceWinRate}% (${p2.surfaceMatches} partidos)`,
    `   • Forma Ponderada (20): ${p2.weightedWinRate}% | Sets Ganados: ${p2.setWinRate}%`,
    `   • Primer Set Ganado: ${p2.firstSetWinRate}% | Segundo Set Ganado: ${p2.secondSetWinRate}%`,
    `   • Juegos Promedio (Ganados / Perdidos): ${p2.averageGamesWon.toFixed(1)} / ${p2.averageGamesLost.toFixed(1)} (Total: ${p2.averageTotalGames.toFixed(1)})`,
    `   • Tasa de Set Decisivo (3er/5to set): ${p2.decidingSetRate}%`,
    "",
    `⚔️ Historial Directo (H2H) y Rivales en Común:`,
    `   • H2H Prepartido: ${analysis.headToHead.player1Wins} - ${analysis.headToHead.player2Wins} (${analysis.headToHead.matches} encuentro(s))`,
    analysis.commonOpponents.length > 0
      ? `   • Rivales Comunes: ${analysis.commonOpponents.length} rivales (Ventaja: ${analysis.commonOpponentAdvantage > 0 ? event.input.player1.name : event.input.player2.name} +${Math.abs(analysis.commonOpponentAdvantage)} pts)`
      : `   • Rivales Comunes: Sin enfrentamientos comparables previos.`,
    ""
  );

  // Auditoría si está disponible
  if (outcome) {
    const audits = auditTennisMarkets(analysis, outcome);
    const hits = audits.filter((a) => a.status === "hit").length;
    const misses = audits.filter((a) => a.status === "miss").length;
    lines.push(
      "🏁 AUDITORÍA DEL RESULTADO OFICIAL EN LOS 17 MERCADOS",
      "--------------------------------------------------------",
      `• Total Mercados Auditados: ${audits.length}`,
      `• Aciertos Totales: ${hits} ✅ | Fallos: ${misses} ❌ (${Math.round((hits / audits.length) * 100)}% acierto)`,
      ""
    );
  }

  // Todos los 17 mercados de tenis
  lines.push(
    `📋 TODOS LOS MERCADOS EVALUADOS (${analysis.markets.length} Mercados)`,
    "--------------------------------------------------------"
  );

  const sortedTennisMarkets = [...analysis.markets].sort((a, b) => {
    const recOrder = { fuerte: 0, moderada: 1, evitar: 2 };
    const rA = recOrder[a.recommendation] ?? 2;
    const rB = recOrder[b.recommendation] ?? 2;
    return rA - rB || b.probability - a.probability || b.confidence - a.confidence;
  });

  sortedTennisMarkets.forEach((m) => {
    lines.push(
      `${recEmoji(m.recommendation)} ${m.market}`,
      `   • Selección: ${m.selection}`,
      `   • Probabilidad: ${m.probability}% | Confianza: ${m.confidence}%`,
      m.evidence.length > 0 ? `   • Evidencia: ${m.evidence.join(" ")}` : "",
      ""
    );
  });

  lines.push(
    "========================================================",
    "📌 BetAnalyzer — Información estadística orientativa para tenis profesional.",
    "========================================================"
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
