"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  FileCheck2,
  Layers,
  Percent,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Target,
  Trash2,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import {
  HistoryRiskTier,
  ThreeDayAuditedMatch,
  ThreeDayAuditSummary,
  scanThreeDayAuditMatches,
  saveRecordedOutcome,
  deleteRecordedOutcome,
  syncRecordedOutcomesFromDisk,
} from "@/lib/bet-records";
import { RecordedMatchOutcome } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { cn } from "@/lib/utils";

type DayFilter = "all" | "yesterday" | "today" | "tomorrow";

const SELECTION_STATUS = {
  acertada: {
    label: "Acertó",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold",
    textClass: "text-emerald-400 font-semibold",
    icon: CheckCircle2,
  },
  fallida: {
    label: "Falló",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400 font-bold",
    textClass: "text-red-400 font-semibold",
    icon: XCircle,
  },
  pendiente: {
    label: "Pendiente",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400 font-medium",
    textClass: "text-blue-400 font-medium",
    icon: Clock,
  },
  sin_datos: {
    label: "Falta dato",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium",
    textClass: "text-amber-400 font-medium",
    icon: Clock,
  },
} as const;

type OutcomeForm = Record<
  | "homeGoals"
  | "awayGoals"
  | "homeGoalsFirstHalf"
  | "awayGoalsFirstHalf"
  | "homeCorners"
  | "awayCorners"
  | "homeYellowCards"
  | "awayYellowCards"
  | "homeRedCards"
  | "awayRedCards",
  string
>;

const EMPTY_OUTCOME: OutcomeForm = {
  homeGoals: "",
  awayGoals: "",
  homeGoalsFirstHalf: "",
  awayGoalsFirstHalf: "",
  homeCorners: "",
  awayCorners: "",
  homeYellowCards: "",
  awayYellowCards: "",
  homeRedCards: "",
  awayRedCards: "",
};

function outcomeToForm(outcome?: RecordedMatchOutcome): OutcomeForm {
  const num = (value: number | undefined) => (value === undefined ? "" : String(value));
  return outcome
    ? {
        homeGoals: num(outcome.homeGoals),
        awayGoals: num(outcome.awayGoals),
        homeGoalsFirstHalf: num(outcome.homeGoalsFirstHalf),
        awayGoalsFirstHalf: num(outcome.awayGoalsFirstHalf),
        homeCorners: num(outcome.homeCorners),
        awayCorners: num(outcome.awayCorners),
        homeYellowCards: num(outcome.homeYellowCards),
        awayYellowCards: num(outcome.awayYellowCards),
        homeRedCards: num(outcome.homeRedCards),
        awayRedCards: num(outcome.awayRedCards),
      }
    : EMPTY_OUTCOME;
}

function toNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

export function BetRecordsDashboard() {
  const [summary, setSummary] = React.useState<ThreeDayAuditSummary | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [dayFilter, setDayFilter] = React.useState<DayFilter>("today");
  const [riskTier, setRiskTier] = React.useState<HistoryRiskTier>("balanced");
  const [activeMatch, setActiveMatch] = React.useState<ThreeDayAuditedMatch | null>(null);
  const [form, setForm] = React.useState<OutcomeForm>(EMPTY_OUTCOME);
  const [formError, setFormError] = React.useState("");

  const refreshAudit = React.useCallback((tier: HistoryRiskTier = riskTier) => {
    const fresh = scanThreeDayAuditMatches(undefined, tier);
    setSummary(fresh);
  }, [riskTier]);

  const handleRiskTierChange = (tier: HistoryRiskTier) => {
    setRiskTier(tier);
    refreshAudit(tier);
  };

  React.useEffect(() => {
    let cancelled = false;
    async function init() {
      await syncRecordedOutcomesFromDisk();
      if (!cancelled) {
        refreshAudit(riskTier);
        setMounted(true);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [refreshAudit, riskTier]);

  const openSettlement = (match: ThreeDayAuditedMatch) => {
    setActiveMatch(match);
    setForm(outcomeToForm(match.outcome));
    setFormError("");
  };

  const handleSaveOutcome = () => {
    if (!activeMatch) return;
    const homeGoals = toNumber(form.homeGoals);
    const awayGoals = toNumber(form.awayGoals);
    if (homeGoals === undefined || awayGoals === undefined) {
      setFormError("El marcador final de ambos equipos (FT) es obligatorio.");
      return;
    }

    const has1T = form.homeGoalsFirstHalf.trim() !== "" || form.awayGoalsFirstHalf.trim() !== "";
    const hasCorners = form.homeCorners.trim() !== "" || form.awayCorners.trim() !== "";
    const hasYellows = form.homeYellowCards.trim() !== "" || form.awayYellowCards.trim() !== "";
    const hasReds = form.homeRedCards.trim() !== "" || form.awayRedCards.trim() !== "";

    const outcome: RecordedMatchOutcome = {
      homeGoals,
      awayGoals,
      homeGoalsFirstHalf: has1T ? (toNumber(form.homeGoalsFirstHalf) ?? 0) : undefined,
      awayGoalsFirstHalf: has1T ? (toNumber(form.awayGoalsFirstHalf) ?? 0) : undefined,
      homeCorners: hasCorners ? (toNumber(form.homeCorners) ?? 0) : undefined,
      awayCorners: hasCorners ? (toNumber(form.awayCorners) ?? 0) : undefined,
      homeYellowCards: hasYellows ? (toNumber(form.homeYellowCards) ?? 0) : undefined,
      awayYellowCards: hasYellows ? (toNumber(form.awayYellowCards) ?? 0) : undefined,
      homeRedCards: hasReds ? (toNumber(form.homeRedCards) ?? 0) : undefined,
      awayRedCards: hasReds ? (toNumber(form.awayRedCards) ?? 0) : undefined,
      recordedAt: new Date().toISOString(),
    };

    saveRecordedOutcome(activeMatch.matchId, outcome);
    refreshAudit(riskTier);
    setActiveMatch(null);
  };

  const handleResetOutcome = (matchId: string) => {
    deleteRecordedOutcome(matchId);
    refreshAudit(riskTier);
  };

  if (!mounted || !summary) {
    return <div className="min-h-64 flex items-center justify-center text-muted-foreground text-sm">Cargando auditoría automática...</div>;
  }

  const filteredMatches = summary.matches.filter((m) => {
    if (dayFilter !== "all" && m.dayRelative !== dayFilter) return false;
    const hasQualifyingBets = m.qualifyingBets && m.qualifyingBets.length > 0;
    const hasActiveWinner = m.winnerPrediction && !m.winnerPrediction.noBet;
    return hasQualifyingBets || hasActiveWinner;
  });

  const allFilteredBets = filteredMatches.flatMap((m) => m.qualifyingBets);
  const tabHits = allFilteredBets.filter((b) => b.status === "acertada").length;
  const tabFailures = allFilteredBets.filter((b) => b.status === "fallida").length;
  const tabAudited = tabHits + tabFailures;
  const tabAccuracy = tabAudited > 0 ? Math.round((tabHits / tabAudited) * 100) : null;

  const thresholdLabel = riskTier === "ultra" ? "≥85%" : riskTier === "balanced" ? "≥80%" : "≥75%";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-950 p-5 sm:p-6 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[11px] font-bold uppercase tracking-wider">
                Auditoría Automática Continua
              </Badge>
              <span className="text-xs text-slate-400">Ventana: Ayer · Hoy · Mañana</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Historial y aprendizaje del modelo</h1>
            <p className="max-w-3xl text-xs sm:text-sm text-slate-300">
              Guarda el pronóstico antes del inicio y lo compara con el resultado real. Solo esas fotos prepartido alimentan la precisión y la calibración; un resultado cargado sin foto previa nunca se convierte retroactivamente en un acierto.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refreshAudit(riskTier)} className="text-xs gap-1.5 border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-400" /> Re-escanear
            </Button>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5">
              <Link href="/ticket">
                <Zap className="h-3.5 w-3.5" /> Ir al Generador
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Risk Profile / Safety Filter Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-200">Perfil de Seguridad y Calificación de Bets</p>
            <p className="text-[11px] text-slate-400">
              {riskTier === "ultra"
                ? "Ultra Seguro (≥85% Prob & Conf): solo líneas amplias de máxima solidez (+0.5 goles, -3.5/-4.5 goles, Hándicaps +1.5/+2.5, tarjetas)."
                : riskTier === "balanced"
                ? "Balanceado (≥80% Prob & Conf): con exclusión automática de Under 1.5/2.5 de equipo para prevenir sorpresas."
                : "Amplio (≥75% Prob & Conf): muestra el abanico completo de oportunidades del modelo."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant={riskTier === "ultra" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRiskTierChange("ultra")}
            className={cn(
              "text-xs font-bold gap-1.5 h-8",
              riskTier === "ultra"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                : "border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800"
            )}
          >
            🛡️ Ultra Seguro (≥85%)
          </Button>
          <Button
            variant={riskTier === "balanced" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRiskTierChange("balanced")}
            className={cn(
              "text-xs font-bold gap-1.5 h-8",
              riskTier === "balanced"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                : "border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800"
            )}
          >
            ⚖️ Balanceado (≥80%)
          </Button>
          <Button
            variant={riskTier === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRiskTierChange("all")}
            className={cn(
              "text-xs font-bold gap-1.5 h-8",
              riskTier === "all"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                : "border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800"
            )}
          >
            📋 Amplio (≥75%)
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="adaptive-stat-grid grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        <StatCard icon={Layers} label="Partidos en Ventana" value={String(filteredMatches.length)} />
        <StatCard icon={Target} label={`Bets ${thresholdLabel} Calificadas`} value={String(allFilteredBets.length)} />
        <StatCard icon={CheckCircle2} label="Bets Acertadas" value={String(tabHits)} accent="green" />
        <StatCard icon={XCircle} label="Bets Fallidas" value={String(tabFailures)} accent="red" />
        <StatCard
          icon={Percent}
          label="Tasa Acierto Modelo"
          value={tabAccuracy !== null ? `${tabAccuracy}%` : "Por jugar"}
          accent={tabAccuracy !== null ? (tabAccuracy >= 75 ? "green" : "yellow") : undefined}
        />
        <StatCard
          icon={Trophy}
          label="Acierto ganador 1X2"
          value={summary.stats.winnerAccuracyRate !== null ? `${summary.stats.winnerAccuracyRate}%` : "Sin muestra"}
          accent={summary.stats.winnerAccuracyRate !== null && summary.stats.winnerAccuracyRate >= 50 ? "green" : "yellow"}
        />
        <StatCard
          icon={Database}
          label="Muestra de aprendizaje"
          value={String(summary.stats.calibrationSampleSize)}
          accent={summary.stats.calibrationSampleSize >= 5 ? "green" : "yellow"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard icon={Layers} label="Partidos históricos auditados" value={String(summary.stats.lifetimeMatches)} />
        <StatCard icon={Target} label={`Bets históricas ${thresholdLabel}`} value={String(summary.stats.lifetimeAuditedBets)} />
        <StatCard icon={CheckCircle2} label="Aciertos históricos" value={String(summary.stats.lifetimeHits)} accent="green" />
        <StatCard icon={XCircle} label="Fallos históricos" value={String(summary.stats.lifetimeFailures)} accent="red" />
        <StatCard
          icon={Percent}
          label={`Precisión histórica ${thresholdLabel}`}
          value={summary.stats.lifetimeAccuracyRate !== null ? `${summary.stats.lifetimeAccuracyRate}%` : "Sin muestra"}
          accent={summary.stats.lifetimeAccuracyRate !== null && summary.stats.lifetimeAccuracyRate >= 70 ? "green" : "yellow"}
        />
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3 text-xs text-slate-300">
        <strong className="text-cyan-300">Calibración:</strong>{" "}
        {summary.stats.calibrationSampleSize >= 5
          ? `${summary.stats.calibrationSampleSize} pronósticos válidos · Brier ${summary.stats.calibrationBrierScore?.toFixed(3)}. La corrección aprendida ya se aplica a predicciones nuevas.`
          : `${summary.stats.calibrationSampleSize}/5 pronósticos válidos. El modelo base sigue activo hasta reunir una muestra mínima segura.`}
        {summary.stats.reliableMarkets > 0 && (
          <span className="ml-1 text-cyan-200">
            {summary.stats.reliableMarkets} mercado(s) ya cuentan con control de fiabilidad; los que bajan de 70% quedan bloqueados.
          </span>
        )}
        {summary.stats.missingPreMatchPredictions > 0 && (
          <span className="ml-1 text-amber-300">
            {summary.stats.missingPreMatchPredictions} resultado(s) no entran en la precisión por faltar una foto prepartido.
          </span>
        )}
      </div>

      {/* Day Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={dayFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setDayFilter("all")}
            className={cn("text-xs font-bold", dayFilter === "all" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-slate-800 bg-slate-900/60 text-slate-300")}
          >
            Todos ({summary.matches.length} partidos)
          </Button>
          <Button
            variant={dayFilter === "yesterday" ? "default" : "outline"}
            size="sm"
            onClick={() => setDayFilter("yesterday")}
            className={cn("text-xs font-bold", dayFilter === "yesterday" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-slate-800 bg-slate-900/60 text-slate-300")}
          >
            Ayer ({summary.dates.yesterday})
          </Button>
          <Button
            variant={dayFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setDayFilter("today")}
            className={cn("text-xs font-bold", dayFilter === "today" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-slate-800 bg-slate-900/60 text-slate-300")}
          >
            Hoy ({summary.dates.today})
          </Button>
          <Button
            variant={dayFilter === "tomorrow" ? "default" : "outline"}
            size="sm"
            onClick={() => setDayFilter("tomorrow")}
            className={cn("text-xs font-bold", dayFilter === "tomorrow" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-slate-800 bg-slate-900/60 text-slate-300")}
          >
            Mañana ({summary.dates.tomorrow})
          </Button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
          <span>Mostrando <strong>{filteredMatches.length}</strong> partidos con <strong>{allFilteredBets.length}</strong> apuestas calificadas</span>
        </div>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={`No hay partidos con bets ${thresholdLabel} en este filtro`}
          description={`Los partidos de este día no superaron el umbral estricto de ${thresholdLabel} en Probabilidad y Confianza en el catálogo de mercados.`}
        />
      ) : (
        <div className="space-y-6">
          {filteredMatches.map((match, matchIdx) => {
            const hasOutcome = Boolean(match.outcome);
            const winner = match.winnerPrediction;

            return (
              <Card
                key={match.matchId}
                className="overflow-hidden border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur transition-all hover:border-emerald-500/40"
              >
                {/* Match Header */}
                <CardHeader className="gap-3 border-b border-slate-800/80 bg-slate-950/60 pb-3 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                      {matchIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                          {match.competition}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {match.date} · {match.time}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase font-bold",
                            match.dayRelative === "yesterday"
                              ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                              : match.dayRelative === "today"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                          )}
                        >
                          {match.dayRelative === "yesterday" ? "Ayer" : match.dayRelative === "today" ? "Hoy" : "Mañana"}
                        </Badge>
                      </div>
                      <CardTitle className="mt-0.5 text-base font-extrabold text-white flex items-center gap-2">
                        {match.homeTeam.name} <span className="text-slate-500 font-normal text-xs">vs</span> {match.awayTeam.name}
                      </CardTitle>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {hasOutcome ? (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs">
                        <span className="font-mono font-black text-emerald-300 text-sm">
                          {match.outcome?.homeGoals} - {match.outcome?.awayGoals}
                        </span>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">(Final)</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="border-slate-700 bg-slate-800/60 text-slate-300 text-xs">
                        Por disputar
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 p-4">
                  {/* Model 1X2 Prediction Bar */}
                  {winner && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/25 bg-cyan-950/20 px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-cyan-400" />
                        <span className="font-extrabold text-cyan-200">
                          Pronóstico 1X2 Modelo: {winner.noBet ? winner.label : `${winner.label} (${winner.probability}%)`}
                        </span>
                        <Badge variant="outline" className="border-cyan-500/30 text-[9px] text-cyan-300">
                          {match.predictionStatus === "locked"
                            ? "Foto prepartido"
                            : match.predictionStatus === "reconstructed"
                              ? "Pronóstico reconstruido"
                              : "Proyección actual"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                        <span>1: {winner.homeWinProbability}%</span>
                        <span className="text-slate-600">·</span>
                        <span>X: {winner.drawProbability}%</span>
                        <span className="text-slate-600">·</span>
                        <span>2: {winner.awayWinProbability}%</span>
                        {winner.noBet ? (
                          <Badge className="ml-2 text-[10px] font-bold border-amber-500/40 bg-amber-500/20 text-amber-300">
                            No apostar 1X2
                          </Badge>
                        ) : winner.correct !== undefined ? (
                          <Badge
                            className={cn(
                              "ml-2 text-[10px] font-bold",
                              winner.correct
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : "bg-red-500/20 text-red-300 border-red-500/40"
                            )}
                          >
                            {winner.correct ? "Acertó 1X2" : "Falló 1X2"}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {match.predictionStatus === "reconstructed" && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                      Resultado manual liquidado con una predicción reconstruida desde el historial del modelo. Los mercados acertados se muestran en verde y los fallidos en rojo.
                    </div>
                  )}

                  {match.predictionStatus === "missing" && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      Este resultado no tenía una predicción guardada antes del inicio. Se muestra como antecedente, pero queda excluido de aciertos, fallos y aprendizaje.
                    </div>
                  )}

                  {/* Qualifying Bets Grid */}
                  {match.qualifyingBets.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                        <p className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-amber-400" /> Bets Calificadas ({thresholdLabel} Confianza y Probabilidad):
                        </p>
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Ordenadas por mayor probabilidad (↓)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {match.qualifyingBets.map((bet) => {
                          const statusConfig = SELECTION_STATUS[bet.status];
                          const Icon = statusConfig.icon;

                          return (
                            <div
                              key={bet.id}
                              className={cn(
                                "rounded-xl border p-3 transition-all",
                                bet.status === "acertada"
                                  ? "border-emerald-500/40 bg-emerald-950/15"
                                  : bet.status === "fallida"
                                  ? "border-red-500/40 bg-red-950/15"
                                  : "border-slate-800 bg-slate-950/50"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-extrabold text-white leading-snug">
                                  {bet.marketName}
                                </span>
                                <Badge className={cn("text-[10px] shrink-0", statusConfig.badgeClass)}>
                                  <Icon className="h-3 w-3 mr-1" /> {statusConfig.label}
                                </Badge>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                                <span>
                                  Prob: <strong className="text-amber-400">{bet.probability}%</strong>
                                </span>
                                <span>
                                  Conf: <strong className="text-cyan-400">{bet.confidence}%</strong>
                                </span>
                              </div>

                              {bet.settlementNote && (
                                <p className="mt-1.5 text-[10px] text-emerald-300/90 font-mono bg-slate-950/60 rounded px-1.5 py-0.5">
                                  Resultado: {bet.settlementNote}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Match Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-xs">
                    <span className="text-slate-400">
                      {hasOutcome
                        ? `Marcador registrado (${match.hits} acertadas, ${match.failures} fallidas de ${match.totalBets})`
                        : `Pendiente de disputa (${match.totalBets} apuestas ${thresholdLabel} listas para auditar)`}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasOutcome && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResetOutcome(match.matchId)}
                          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1"
                          title="Restablecer a pendiente"
                        >
                          <Trash2 className="h-3 w-3" /> Restablecer
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openSettlement(match)}
                        className="text-xs gap-1.5 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                      >
                        <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                        {hasOutcome ? "Editar Resultado" : "Registrar Resultado"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Outcome Recording Dialog */}
      <Dialog open={Boolean(activeMatch)} onOpenChange={(open) => !open && setActiveMatch(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl border-slate-800 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-emerald-400" /> Registrar Resultado Oficial
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Ingresa el marcador oficial para {activeMatch?.homeTeam.name} vs {activeMatch?.awayTeam.name}. Se auditarán automáticamente todas las apuestas ≥80% del encuentro.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <OutcomeFields
              title="Resultado Final (FT)"
              required
              fields={[
                ["homeGoals", `Goles ${activeMatch?.homeTeam.shortName ?? "Local"}`],
                ["awayGoals", `Goles ${activeMatch?.awayTeam.shortName ?? "Visitante"}`],
              ]}
              form={form}
              setForm={setForm}
            />

            <OutcomeFields
              title="Primer Tiempo (1T - Opcional)"
              fields={[
                ["homeGoalsFirstHalf", `Goles 1T ${activeMatch?.homeTeam.shortName ?? "Local"}`],
                ["awayGoalsFirstHalf", `Goles 1T ${activeMatch?.awayTeam.shortName ?? "Visitante"}`],
              ]}
              form={form}
              setForm={setForm}
            />

            <OutcomeFields
              title="Córners Totales (Opcional)"
              fields={[
                ["homeCorners", `Córners ${activeMatch?.homeTeam.shortName ?? "Local"}`],
                ["awayCorners", `Córners ${activeMatch?.awayTeam.shortName ?? "Visitante"}`],
              ]}
              form={form}
              setForm={setForm}
            />

            <OutcomeFields
              title="Tarjetas Amarillas (Opcional)"
              fields={[
                ["homeYellowCards", `Amarillas ${activeMatch?.homeTeam.shortName ?? "Local"}`],
                ["awayYellowCards", `Amarillas ${activeMatch?.awayTeam.shortName ?? "Visitante"}`],
              ]}
              form={form}
              setForm={setForm}
            />

            <OutcomeFields
              title="Tarjetas Rojas (Opcional)"
              fields={[
                ["homeRedCards", `Rojas ${activeMatch?.homeTeam.shortName ?? "Local"}`],
                ["awayRedCards", `Rojas ${activeMatch?.awayTeam.shortName ?? "Visitante"}`],
              ]}
              form={form}
              setForm={setForm}
            />

            {formError && <p className="text-xs font-semibold text-red-400">{formError}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setActiveMatch(null)} className="border-slate-800 bg-slate-900 text-white">
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSaveOutcome} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5">
              <FileCheck2 className="h-4 w-4" /> Guardar y Auditar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OutcomeFields({
  title,
  fields,
  form,
  setForm,
  required = false,
}: {
  title: string;
  fields: [keyof OutcomeForm, string][];
  form: OutcomeForm;
  setForm: React.Dispatch<React.SetStateAction<OutcomeForm>>;
  required?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-2">
      <p className="text-xs font-bold text-slate-200">
        {title}
        {required && <span className="ml-1 text-red-400">*</span>}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {fields.map(([key, label]) => (
          <label key={key} className="text-[11px] font-medium text-slate-400 block space-y-1">
            <span>{label}</span>
            <Input
              type="number"
              min="0"
              step="1"
              required={required}
              value={form[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              className="h-8 border-slate-800 bg-slate-950 text-white font-mono text-sm"
              placeholder="0"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
