"use client";

import * as React from "react";
import Link from "next/link";
import {
  generateBetTicket,
  GeneratedTicket,
  GeneratedTicketSelection,
  SkippedMatch,
  TicketMatchResultSummary,
} from "@/services/ticket-generator-service";
import { getUpcomingMatches } from "@/data/matches";
import { teams } from "@/data/teams";
import { Team, TicketTier } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Flame, Shield, Sliders, Copy, Check, RefreshCw, Trophy, Target, Award, ArrowRight, Layers, Filter, ShieldCheck, AlertTriangle, Info, Clock, Database, Plus, Minus, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketFiveParametersTable } from "@/components/markets/market-five-parameters-table";
import { getTeamMatchPool } from "@/data/team-history";
import { createTrackedTicket, saveTrackedTicket } from "@/lib/bet-records";

interface MatchGroup {
  matchId: string;
  matchLabel: string;
  competitionName: string;
  matchDate: string;
  matchTime: string;
  homeTeam: Team;
  awayTeam: Team;
  selections: GeneratedTicketSelection[];
  resultSummary?: TicketMatchResultSummary;
}

function ResultProbability({
  label,
  teamName,
  probability,
  isLeading,
  variant = "winner",
}: {
  label: string;
  teamName: string;
  probability: number;
  isLeading: boolean;
  variant?: "winner" | "double-chance";
}) {
  const leadingStyle = variant === "winner"
    ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_22px_rgba(16,185,129,0.10)]"
    : "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_22px_rgba(34,211,238,0.09)]";

  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1 transition-colors",
        isLeading ? leadingStyle : "border-slate-800 bg-slate-950/55"
      )}
      title={`${teamName}: ${probability}%`}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <span className={cn("text-sm font-black tabular-nums", isLeading ? (variant === "winner" ? "text-emerald-300" : "text-cyan-300") : "text-white")}>
        {probability}%
      </span>
      {isLeading && <Trophy className={cn("h-3 w-3 shrink-0", variant === "winner" ? "text-emerald-400" : "text-cyan-400")} />}
    </div>
  );
}

function MatchResultPrediction({ summary }: { summary: TicketMatchResultSummary }) {
  const winnerOptions = [
    { label: "1", teamName: summary.homeTeam.shortName, probability: summary.homeWin.statisticalEstimate },
    { label: "X", teamName: "Empate", probability: summary.draw.statisticalEstimate },
    { label: "2", teamName: summary.awayTeam.shortName, probability: summary.awayWin.statisticalEstimate },
  ];
  const doubleChanceOptions = [
    { label: "1X", teamName: `${summary.homeTeam.shortName} o empate`, probability: summary.doubleChanceHome.statisticalEstimate },
    { label: "X2", teamName: `${summary.awayTeam.shortName} o empate`, probability: summary.doubleChanceAway.statisticalEstimate },
  ];
  const winnerLeader = Math.max(...winnerOptions.map((option) => option.probability));
  const doubleChanceLeader = Math.max(...doubleChanceOptions.map((option) => option.probability));

  return (
    <section className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-800/80 bg-slate-950/65 px-4 py-2.5">
      <div className="flex items-center gap-1.5 text-emerald-300">
        <Target className="h-3.5 w-3.5" />
        <h4 className="text-xs font-extrabold tracking-tight">Resultado previsto</h4>
      </div>

      <div className="flex items-center gap-1.5" aria-label="Pronóstico 1X2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">1X2</span>
        <div className="flex items-center gap-1">
          {winnerOptions.map((option) => (
            <ResultProbability key={option.label} {...option} isLeading={option.probability === winnerLeader} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5" aria-label="Pronóstico doble oportunidad">
        <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Doble</span>
        <div className="flex items-center gap-1">
          {doubleChanceOptions.map((option) => (
            <ResultProbability key={option.label} {...option} isLeading={option.probability === doubleChanceLeader} variant="double-chance" />
          ))}
        </div>
      </div>

      <span
        className="hidden text-[10px] text-slate-500 sm:inline"
        title={summary.evidenceLabels.join(" · ")}
      >
        {summary.evidenceLabels.length} fuentes
      </span>
    </section>
  );
}

export function TicketGenerator() {
  const [preset, setPreset] = React.useState<"80" | "90" | "70" | "custom">("80");
  const [minConfidence, setMinConfidence] = React.useState(80);
  const [minProbability, setMinProbability] = React.useState(80);
  const [maxPerMatch, setMaxPerMatch] = React.useState<number>(Infinity);
  const [selectedMatchId, setSelectedMatchId] = React.useState<string>("all");
  const [ticket, setTicket] = React.useState<GeneratedTicket | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [collapsedMap, setCollapsedMap] = React.useState<Record<string, boolean>>({});
  const [ticketSaved, setTicketSaved] = React.useState(false);

  const toggleCollapse = React.useCallback((matchId: string) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  }, []);

  const expandAll = React.useCallback(() => {
    setCollapsedMap({});
  }, []);

  // STRICTLY list ONLY active upcoming matches
  const availableMatches = React.useMemo(() => {
    return getUpcomingMatches().map((m) => {
      const home = teams.find((t) => t.id === m.homeTeamId);
      const away = teams.find((t) => t.id === m.awayTeamId);
      return {
        id: m.id,
        label: `${home?.shortName ?? m.homeTeamId} vs ${away?.shortName ?? m.awayTeamId}`,
        date: m.date,
        time: m.time,
      };
    });
  }, []);

  const handleGenerate = React.useCallback(
    (conf: number, prob: number, perMatch = maxPerMatch, matchIdFilter = selectedMatchId) => {
      setLoading(true);
      setTimeout(() => {
        const generated = generateBetTicket({
          minConfidence: conf,
          minProbability: prob,
          maxPerMatch: Infinity,
          matchId: matchIdFilter !== "all" ? matchIdFilter : undefined,
          maxSelections: Infinity,
        });
        setTicket(generated);
        setTicketSaved(false);
        setLoading(false);
      }, 150);
    },
    [maxPerMatch, selectedMatchId]
  );

  React.useEffect(() => {
    handleGenerate(minConfidence, minProbability, maxPerMatch, selectedMatchId);
  }, []);

  const selectPreset = (type: "80" | "90" | "70" | "custom") => {
    setPreset(type);
    let c = minConfidence;
    let p = minProbability;
    if (type === "80") {
      c = 80;
      p = 80;
    } else if (type === "90") {
      c = 90;
      p = 90;
    } else if (type === "70") {
      c = 70;
      p = 70;
    }
    setMinConfidence(c);
    setMinProbability(p);
    handleGenerate(c, p, maxPerMatch, selectedMatchId);
  };



  const handleMatchChange = (val: string) => {
    setSelectedMatchId(val);
    handleGenerate(minConfidence, minProbability, maxPerMatch, val);
  };

  const isTrackableTicket =
    ticket !== null &&
    preset !== "custom" &&
    ticket.minConfidence === Number(preset) &&
    ticket.minProbability === Number(preset) &&
    ticket.totalSelections > 0;

  const saveTicketForAudit = () => {
    if (!ticket || !isTrackableTicket) return;
    saveTrackedTicket(createTrackedTicket(ticket, Number(preset) as TicketTier));
    setTicketSaved(true);
  };

  // Group selections by match for Bet Builder style view, ordered chronologically (earliest match first)
  const groupedSelections = React.useMemo<MatchGroup[]>(() => {
    if (!ticket || !ticket.selections) return [];

    const map = new Map<string, MatchGroup>();

    for (const sel of ticket.selections) {
      if (!map.has(sel.matchId)) {
        map.set(sel.matchId, {
          matchId: sel.matchId,
          matchLabel: sel.matchLabel,
          competitionName: sel.competitionName,
          matchDate: sel.matchDate,
          matchTime: sel.matchTime,
          homeTeam: sel.homeTeam,
          awayTeam: sel.awayTeam,
          selections: [],
          resultSummary: ticket.resultSummaries.find((summary) => summary.matchId === sel.matchId),
        });
      }
      const group = map.get(sel.matchId)!;
      group.selections.push(sel);
    }

    const groups = Array.from(map.values());

    // Sort match groups chronologically: earliest start time first (de menor a mayor hora)
    groups.sort((a, b) => {
      const dateTimeA = `${a.matchDate} ${a.matchTime}`;
      const dateTimeB = `${b.matchDate} ${b.matchTime}`;
      return dateTimeA.localeCompare(dateTimeB);
    });

    // Within each match group, sort selections by (confidence * probability) descending
    for (const group of groups) {
      group.selections.sort((a, b) => b.confidence * b.probability - a.confidence * a.probability);
    }

    return groups;
  }, [ticket]);

  const collapseAll = React.useCallback(() => {
    if (!groupedSelections) return;
    const all: Record<string, boolean> = {};
    groupedSelections.forEach((g) => {
      all[g.matchId] = true;
    });
    setCollapsedMap(all);
  }, [groupedSelections]);

  const copyToClipboard = () => {
    if (!ticket || groupedSelections.length === 0) return;

    const lines = [
      `🎯 TICKET DE APUESTAS BETANALYZER (AGRUPADO POR ENCUENTRO)`,
      `⚙️ Filtros: ≥${ticket.minConfidence}% Confianza | ≥${ticket.minProbability}% Probabilidad`,
      `⭐ Confianza Promedio: ${ticket.averageConfidence}% | Probabilidad: ${ticket.averageProbability}%`,
      `-----------------------------------------`,
    ];

    groupedSelections.forEach((group, gIdx) => {
      lines.push(`⚽ PARTIDO ${gIdx + 1}: ${group.matchLabel} (${group.matchTime})`);
      if (group.resultSummary) {
        const { homeWin, draw, awayWin, doubleChanceHome, doubleChanceAway } = group.resultSummary;
        lines.push(`   📊 Resultado previsto: 1 ${homeWin.statisticalEstimate}% | X ${draw.statisticalEstimate}% | 2 ${awayWin.statisticalEstimate}%`);
        lines.push(`   🛡️ Doble oportunidad: 1X ${doubleChanceHome.statisticalEstimate}% | X2 ${doubleChanceAway.statisticalEstimate}%`);
      }
      if (group.selections.length > 1) {
        lines.push(`   🔥 Bet Builder (${group.selections.length} selecciones)`);
      }
      group.selections.forEach((s) => {
        lines.push(`   👉 Mercado: ${s.marketEval.market.name} [Confianza: ${s.confidence.toFixed(1)}% | Probabilidad: ${s.probability.toFixed(1)}%]`);
      });
      lines.push(`-----------------------------------------`);
    });

    lines.push(`Generado por BetAnalyzer AI 🚀`);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-emerald-900/40 p-6 sm:p-8 border border-emerald-500/20 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Zap className="h-3.5 w-3.5" /> Generador Inteligente de Apuestas
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Generador de Tickets por <span className="text-emerald-400">Confianza</span> &amp; <span className="text-cyan-400">Probabilidad</span>
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Escanea únicamente los partidos activos del día y agrupa automáticamente las mejores apuestas por encuentro.
          </p>
        </div>
      </div>

      {/* Mode Controls Bar */}
      <Card className="p-4 border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
        {/* Match Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300 shrink-0">Partido Activo:</span>
          <Select value={selectedMatchId} onValueChange={handleMatchChange}>
            <SelectTrigger className="w-full sm:w-[280px] text-xs bg-slate-950 border-slate-800 text-white">
              <SelectValue placeholder="Todos los partidos del día" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">🌐 Todos los partidos activos del día</SelectItem>
              {availableMatches.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  ⚽ {m.label} ({m.time})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mode Toggle removed: always show all qualifying bets */}
      </Card>

      {/* Preset Selector Buttons */}
      <div className="ticket-preset-grid grid grid-cols-1 gap-3 min-[720px]:grid-cols-2 lg:grid-cols-4">
        <Button
          variant="outline"
          onClick={() => selectPreset("90")}
          className={cn(
            "h-auto min-w-0 !whitespace-normal px-4 py-4 sm:px-5 flex flex-col items-start gap-1.5 transition-all text-left border-slate-800 bg-slate-900/60 hover:border-amber-500/50 hover:bg-amber-950/20",
            preset === "90" && "border-amber-500 bg-amber-950/40 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
          )}
        >
          <div className="flex w-full items-start justify-between gap-2">
            <span className="min-w-0 text-pretty font-bold text-white flex items-center gap-1.5 text-sm">
              <Flame className="h-4 w-4 text-amber-400" /> Ticket Elite (≥90%)
            </span>
            <Badge className="shrink-0 bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">Top Tier</Badge>
          </div>
          <p className="text-xs text-slate-400">Mayor o igual a 90% en ambos filtros de precisión.</p>
        </Button>

        <Button
          variant="outline"
          onClick={() => selectPreset("80")}
          className={cn(
            "h-auto min-w-0 !whitespace-normal px-4 py-4 sm:px-5 flex flex-col items-start gap-1.5 transition-all text-left border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-emerald-950/20",
            preset === "80" && "border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
          )}
        >
          <div className="flex w-full items-start justify-between gap-2">
            <span className="min-w-0 text-pretty font-bold text-white flex items-center gap-1.5 text-sm">
              <Zap className="h-4 w-4 text-emerald-400" /> Ticket ≥80% / ≥80%
            </span>
            <Badge className="shrink-0 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">Recomendado</Badge>
          </div>
          <p className="text-xs text-slate-400">Mayor o igual a 80% de Confianza y Probabilidad.</p>
        </Button>

        <Button
          variant="outline"
          onClick={() => selectPreset("70")}
          className={cn(
            "h-auto min-w-0 !whitespace-normal px-4 py-4 sm:px-5 flex flex-col items-start gap-1.5 transition-all text-left border-slate-800 bg-slate-900/60 hover:border-blue-500/50 hover:bg-blue-950/20",
            preset === "70" && "border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
          )}
        >
          <div className="flex w-full items-start justify-between gap-2">
            <span className="min-w-0 text-pretty font-bold text-white flex items-center gap-1.5 text-sm">
              <Shield className="h-4 w-4 text-blue-400" /> Ticket Amplio (≥70%)
            </span>
            <Badge className="shrink-0 bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">Más Opciones</Badge>
          </div>
          <p className="text-xs text-slate-400">Mayor o igual a 70% en ambos filtros.</p>
        </Button>

        <Button
          variant="outline"
          onClick={() => selectPreset("custom")}
          className={cn(
            "h-auto min-w-0 !whitespace-normal px-4 py-4 sm:px-5 flex flex-col items-start gap-1.5 transition-all text-left border-slate-800 bg-slate-900/60 hover:border-purple-500/50 hover:bg-purple-950/20",
            preset === "custom" && "border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500"
          )}
        >
          <div className="flex w-full items-start justify-between gap-2">
            <span className="min-w-0 text-pretty font-bold text-white flex items-center gap-1.5 text-sm">
              <Sliders className="h-4 w-4 text-purple-400" /> Personalizado
            </span>
            <Badge className="shrink-0 bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">Libre</Badge>
          </div>
          <p className="text-xs text-slate-400">Ajusta los sliders de confianza y probabilidad manualmente.</p>
        </Button>
      </div>

      {/* Custom Sliders Panel (if preset === custom) */}
      {preset === "custom" && (
        <Card className="p-5 border-slate-800 bg-slate-900/80 backdrop-blur space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4" /> Mínimo % Confianza (≥):
                </span>
                <span className="font-mono text-base text-white">{minConfidence}%</span>
              </div>
              <Slider
                value={[minConfidence]}
                min={50}
                max={95}
                step={5}
                onValueChange={(val) => {
                  setPreset("custom");
                  setMinConfidence(val[0]);
                  handleGenerate(val[0], minProbability, maxPerMatch, selectedMatchId);
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <Target className="h-4 w-4" /> Mínimo % Probabilidad (≥):
                </span>
                <span className="font-mono text-base text-white">{minProbability}%</span>
              </div>
              <Slider
                value={[minProbability]}
                min={50}
                max={95}
                step={5}
                onValueChange={(val) => {
                  setPreset("custom");
                  setMinProbability(val[0]);
                  handleGenerate(minConfidence, val[0], maxPerMatch, selectedMatchId);
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Ticket Output Card */}
      {ticket && (
        <div className="space-y-6">
          {/* Summary Header (Clean 3 Cards without odds) */}
          <div className="ticket-summary-grid grid grid-cols-1 gap-3 min-[680px]:grid-cols-3">
            <Card className="p-4 border-slate-800 bg-slate-900/90 text-center space-y-1">
              <p className="text-xs font-medium text-slate-400">Encuentros / Apuestas</p>
              <p className="text-2xl font-black text-white font-mono">
                {groupedSelections.length} <span className="text-xs text-slate-400 font-normal">({ticket.totalSelections} selecciones)</span>
              </p>
            </Card>
            <Card className="p-4 border-slate-800 bg-slate-900/90 text-center space-y-1">
              <p className="text-xs font-medium text-slate-400">Confianza Promedio</p>
              <p className="text-2xl font-black text-cyan-400 font-mono">{ticket.averageConfidence}%</p>
            </Card>
            <Card className="p-4 border-slate-800 bg-slate-900/90 text-center space-y-1">
              <p className="text-xs font-medium text-slate-400">Probabilidad Promedio</p>
              <p className="text-2xl font-black text-amber-400 font-mono">{ticket.averageProbability}%</p>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4">
            <div className="min-w-0 flex items-center gap-2 text-xs text-slate-300">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span>
                Filtros activos: <strong>≥{ticket.minConfidence}% Confianza</strong> &amp; <strong>≥{ticket.minProbability}% Probabilidad</strong>
              </span>
            </div>
            <div className="ticket-actions flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="text-xs gap-1 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                title="Desplegar todas las apuestas (+)"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400 font-bold" /> <span className="ticket-action-label">Desplegar todo </span>(+)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="text-xs gap-1 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                title="Retraer todas las apuestas (-)"
              >
                <Minus className="h-3.5 w-3.5 text-amber-400 font-bold" /> <span className="ticket-action-label">Retraer todo </span>(-)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate(minConfidence, minProbability, maxPerMatch, selectedMatchId)}
                disabled={loading}
                className="text-xs gap-1.5 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> <span className="ticket-action-label">Regenerar</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={saveTicketForAudit}
                disabled={!isTrackableTicket || ticketSaved}
                className="text-xs gap-1.5 border-cyan-500/35 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-900/40"
                title={isTrackableTicket ? "Guardar ticket para auditoría posterior" : "Solo se guardan tickets de 70%, 80% o 90%"}
              >
                <BookmarkCheck className="h-3.5 w-3.5" />
                <span className="ticket-action-label">{ticketSaved ? `Ticket ≥${preset}% guardado` : isTrackableTicket ? `Guardar ticket ≥${preset}%` : "Guardar: elige 70/80/90"}</span>
                <span className="ticket-action-short-label">Guardar</span>
              </Button>
              <Button
                size="sm"
                onClick={copyToClipboard}
                disabled={groupedSelections.length === 0}
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-200" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="ticket-action-label">{copied ? "¡Copiado al Portapapeles!" : "Copiar Apuesta Ticket"}</span>
                <span className="ticket-action-short-label">{copied ? "Copiado" : "Copiar"}</span>
              </Button>
            </div>
          </div>

          {/* Grouped Match Selections List (Bet Builder Style) */}
          {groupedSelections.length === 0 ? (
            <Card className="p-8 border-slate-800 bg-slate-900/60 text-center space-y-3">
              <Target className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No se encontraron selecciones activas con estos filtros</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Prueba seleccionando el botón <strong>Ticket ≥80%</strong> o cambiando al modo <strong>"Bet Builder / Múltiples por partido"</strong>.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {groupedSelections.map((group, groupIdx) => {
                const isMatchCollapsed = !!collapsedMap[group.matchId];

                return (
                  <Card
                    key={group.matchId}
                    className="overflow-hidden border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur transition-all hover:border-emerald-500/40"
                  >
                    {/* Match Group Header */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
                          {groupIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                              {group.competitionName}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {group.matchDate} · {group.matchTime}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                            {group.matchLabel}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {group.selections.length > 1 && (
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 gap-1.5 text-xs font-mono py-1 px-2.5">
                            <Layers className="h-3.5 w-3.5 text-cyan-400" /> Bet Builder ({group.selections.length} selecciones)
                          </Badge>
                        )}
                        <Link
                          href={`/partidos/${group.matchId}`}
                          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors border border-slate-800 hover:border-emerald-500/40 bg-slate-950 px-3 py-1.5 rounded-lg"
                        >
                          Ver Partido <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        {/* Toggle Collapse/Expand Button (+ / -) */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCollapse(group.matchId)}
                          className={cn(
                            "text-xs font-bold gap-1.5 transition-all px-3 py-1.5 rounded-lg border",
                            isMatchCollapsed
                              ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50"
                              : "border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50"
                          )}
                          title={isMatchCollapsed ? "Desplegar apuestas (+)" : "Retraer apuestas (-)"}
                        >
                          {isMatchCollapsed ? (
                            <>
                              <Plus className="h-4 w-4 text-emerald-400 font-extrabold" /> Desplegar (+)
                            </>
                          ) : (
                            <>
                              <Minus className="h-4 w-4 text-amber-400 font-extrabold" /> Retraer (-)
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {group.resultSummary && <MatchResultPrediction summary={group.resultSummary} />}

                    {/* Selected Markets for this Match */}
                    {isMatchCollapsed ? (
                      <div
                        onClick={() => toggleCollapse(group.matchId)}
                        className="p-3 bg-slate-950/60 text-center cursor-pointer hover:bg-slate-900/80 transition-colors flex items-center justify-center gap-2 text-xs text-slate-400 border-t border-slate-800/40"
                      >
                        <Plus className="h-3.5 w-3.5 text-emerald-400 font-bold" />
                        <span>
                          <strong>{group.selections.length} apuesta{group.selections.length > 1 ? "s" : ""} retraída{group.selections.length > 1 ? "s" : ""}</strong> (haz clic para desplegar +)
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 p-2">
                          {group.selections.map((sel, selIdx) => {
                          const category = sel.marketEval.market.category;
                          const side = sel.marketEval.market.side;

                          const sideLabel =
                            side === "local"
                              ? `🏠 ${sel.homeTeam.shortName}`
                              : side === "visitante"
                              ? `✈️ ${sel.awayTeam.shortName}`
                              : side === "ambos"
                              ? `🤝 Ambos equipos`
                              : `⚽ Partido total`;

                          const isCards = category === "tarjetas";
                          const isGoals = category === "goles" || category === "primera_parte" || category === "segunda_parte";
                          const isCorners = category === "corners";
                          const isShots = category === "tiros_arco" || category === "remates";

                          return (
                            <div
                              key={`${sel.matchId}-${sel.marketEval.id}-${selIdx}`}
                              className={cn(
                                "space-y-1.5 rounded-md border p-2 transition-all backdrop-blur-sm",
                                isCards && "border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50",
                                isGoals && "border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50",
                                isCorners && "border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-500/50",
                                !isCards && !isGoals && !isCorners && "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                              )}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="min-w-0 flex items-center gap-1">
                                  <span className="text-xs">
                                    {isCards ? "🟨" : isCorners ? "🚩" : isShots ? "🎯" : "⚽"}
                                  </span>
                                  <h4 className="min-w-0 text-[11px] font-bold text-white">
                                    {sel.marketEval.market.name}
                                  </h4>
                                </div>

                                <Badge variant="outline" className="border-slate-700 bg-slate-900/80 text-[9px] font-semibold text-slate-300">
                                  {sideLabel}
                                </Badge>
                              </div>

                              <p className="text-[10px] leading-snug text-slate-400">
                                {sel.marketEval.market.description}
                              </p>

                              {/* Tabla de 5 Parámetros con Porcentajes Grandes y Resaltados */}
                              <MarketFiveParametersTable
                                marketId={sel.marketEval.market.id}
                                homeRecords={getTeamMatchPool(sel.homeTeam.id)}
                                awayRecords={getTeamMatchPool(sel.awayTeam.id)}
                                homeTeamName={sel.homeTeam.shortName}
                                awayTeamName={sel.awayTeam.shortName}
                                className="ticket-market-evidence mt-1"
                                compact
                              />

                              <div className="flex flex-wrap items-center justify-between gap-1 border-t border-slate-800/50 pt-0.5">
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0 text-[10px] font-mono text-emerald-300">
                                    ⭐ {Number.isInteger(sel.confidence) ? sel.confidence : sel.confidence.toFixed(1)}% Confianza
                                  </Badge>
                                  <Badge variant="outline" className="border-cyan-500/40 bg-cyan-500/10 px-1.5 py-0 text-[10px] font-mono text-cyan-300">
                                    🎯 {Number.isInteger(sel.probability) ? sel.probability : sel.probability.toFixed(1)}% Probabilidad
                                  </Badge>
                                </div>

                                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                                  {category.replace(/_/g, " ")}
                                </span>
                              </div>
                            </div>
                          );
                          })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Panel de Partidos Omitidos */}
          {ticket.skippedMatches && ticket.skippedMatches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-300">
                  {ticket.skippedMatches.length} partido{ticket.skippedMatches.length > 1 ? "s" : ""} no generaron selecciones
                </span>
              </div>
              <Card className="border-amber-500/20 bg-amber-950/10 divide-y divide-amber-900/30 overflow-hidden">
                {ticket.skippedMatches.map((skipped) => (
                  <div key={skipped.matchId} className="px-4 py-3 flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {skipped.reason === "no_history" && <Database className="h-4 w-4 text-orange-400" />}
                      {skipped.reason === "no_team_data" && <AlertTriangle className="h-4 w-4 text-red-400" />}
                      {skipped.reason === "below_threshold" && <Target className="h-4 w-4 text-slate-400" />}
                      {skipped.reason === "expired" && <Clock className="h-4 w-4 text-slate-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">
                        [{skipped.matchTime}] {skipped.matchLabel}
                      </p>
                      <p className="text-[11px] text-amber-300/70 mt-0.5 leading-snug">{skipped.detail}</p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
