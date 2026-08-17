"use client";

import * as React from "react";
import { CheckCircle2, XCircle, HelpCircle, ChevronRight } from "lucide-react";
import { MarketEvaluation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { ValueIndicator } from "@/components/shared/value-indicator";
import { RISK_LEVEL_COLOR, RISK_LEVEL_LABEL, DATA_QUALITY_LABEL } from "@/lib/labels";
import { formatOdds } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { MarketEvidenceDialog } from "@/components/markets/market-evidence-dialog";
import { DownloadCardButton } from "@/components/shared/download-card-button";
import { MarketFiveParametersTable } from "@/components/markets/market-five-parameters-table";
import { getTeamMatchPool } from "@/data/team-history";
import { getMatchById } from "@/data/matches";
import { getTeamById } from "@/data/teams";

const RECOMMENDATION_META = {
  recomendado: { label: "Recomendado", icon: CheckCircle2, className: "text-brand-green-bright" },
  evitar: { label: "Evitar", icon: XCircle, className: "text-brand-red" },
  sin_datos_suficientes: { label: "Datos insuficientes", icon: HelpCircle, className: "text-muted-foreground" },
} as const;

export function MarketCard({ evaluation, matchLabel }: { evaluation: MarketEvaluation; matchLabel?: string }) {
  const rec = RECOMMENDATION_META[evaluation.recommendation];
  const RecIcon = rec.icon;
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const match = getMatchById(evaluation.matchId);
  const homeTeam = match ? getTeamById(match.homeTeamId) : null;
  const awayTeam = match ? getTeamById(match.awayTeamId) : null;

  return (
    <>
    <Card
      className="card-download-target flex cursor-pointer flex-col transition-all duration-200 hover:-translate-y-0.5 hover:ring-brand-green/35 focus-visible:ring-2 focus-visible:ring-brand-green"
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle del calculo para ${evaluation.market.name}`}
      onClick={() => setDetailsOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setDetailsOpen(true);
        }
      }}
    >
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            {matchLabel && (
              <div className="inline-flex items-center gap-1 rounded-md border border-brand-green/30 bg-brand-green/10 px-2 py-0.5 text-[11px] font-bold text-brand-green-bright shadow-sm">
                <span>⚔️</span>
                <span>{matchLabel}</span>
              </div>
            )}
            <p className="text-sm font-semibold text-foreground">{evaluation.market.name}</p>
            <p className="text-xs text-muted-foreground">{evaluation.market.description}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={cn("flex shrink-0 items-center gap-1 text-xs font-medium", rec.className)}>
              <RecIcon className="size-3.5" /> {rec.label}
            </span>
            <DownloadCardButton filename={`bet_${evaluation.market.id}`} />
          </div>
        </div>

        <div className="adaptive-stat-grid grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-xs sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Confianza</p>
            <p className="text-sm font-bold text-foreground">{evaluation.confidence}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cuota</p>
            <p className="text-sm font-bold text-foreground">{evaluation.odds ? formatOdds(evaluation.odds.decimalOdds) : "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Prob. implícita</p>
            <p className="text-sm font-bold text-foreground">{evaluation.odds ? `${evaluation.odds.impliedProbability.toFixed(1)}%` : "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estim. BetAnalyzer</p>
            <p className="text-sm font-bold text-brand-green-bright">{evaluation.statisticalEstimate}%</p>
          </div>
        </div>

        {evaluation.probabilitySignals && evaluation.probabilitySignals.length > 0 && (
          <section className="rounded-lg border border-border/70 bg-background/30 p-2.5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Desglose del cruce</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {evaluation.probabilitySignals.slice(0, 4).map((signal) => (
                <div key={`${signal.label}-${signal.value}`} className="rounded-md bg-muted/45 px-2 py-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] leading-tight text-muted-foreground">{signal.label}</span>
                    <span className="shrink-0 text-xs font-bold text-brand-green-bright">{signal.value}</span>
                  </div>
                  {signal.detail && <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground/80">{signal.detail}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {match && (
          <MarketFiveParametersTable
            marketId={evaluation.market.id}
            homeRecords={getTeamMatchPool(match.homeTeamId)}
            awayRecords={getTeamMatchPool(match.awayTeamId)}
            homeTeamName={homeTeam?.shortName}
            awayTeamName={awayTeam?.shortName}
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <ConfidenceBadge level={evaluation.confidenceLevel} size="sm" />
          <Badge variant="outline" className={cn("text-[10px]", RISK_LEVEL_COLOR[evaluation.riskLevel])}>
            {RISK_LEVEL_LABEL[evaluation.riskLevel]}
          </Badge>
          {evaluation.valueLevel && <ValueIndicator level={evaluation.valueLevel} diff={evaluation.valueDifference} />}
        </div>

        {evaluation.positivePatterns.length > 0 && (
          <ul className="space-y-1 text-[11px] text-muted-foreground">
            {evaluation.positivePatterns.slice(0, 2).map((p, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-brand-green">✓</span> {p}
              </li>
            ))}
          </ul>
        )}
        {evaluation.contradictions.length > 0 && (
          <ul className="space-y-1 text-[11px] text-brand-red">
            {evaluation.contradictions.map((c, i) => (
              <li key={i} className="flex gap-1.5">
                <span>⚠</span> {c}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
          <span>{DATA_QUALITY_LABEL[evaluation.dataQuality]}</span>
          <span className="hidden sm:inline">{evaluation.sampleSize} partidos</span>
          <span className="inline-flex items-center gap-0.5 font-medium text-brand-green-bright">Ver cálculo <ChevronRight className="size-3" /></span>
        </div>
      </CardContent>
    </Card>
    <MarketEvidenceDialog evaluation={evaluation} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  );
}
