"use client";

import * as React from "react";
import { Star, Share2, ListPlus, Microscope, Check } from "lucide-react";
import { BettingRecommendation, CONFIDENCE_WEIGHTS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ConfidenceGauge } from "@/components/shared/confidence-gauge";
import { ValueIndicator } from "@/components/shared/value-indicator";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { RISK_LEVEL_COLOR, RISK_LEVEL_LABEL } from "@/lib/labels";
import { formatOdds } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { DownloadCardButton } from "@/components/shared/download-card-button";
import { MarketFiveParametersTable } from "@/components/markets/market-five-parameters-table";
import { getTeamMatchPool } from "@/data/team-history";
import { getMatchById } from "@/data/matches";
import { getTeamById } from "@/data/teams";

const BREAKDOWN_LABELS: { key: keyof typeof CONFIDENCE_WEIGHTS; label: string }[] = [
  { key: "recentPerformance", label: "Rendimiento reciente" },
  { key: "rivalVulnerability", label: "Vulnerabilidad del rival" },
  { key: "homeAwayCondition", label: "Condición local/visitante" },
  { key: "headToHead", label: "Enfrentamientos directos" },
  { key: "commonOpponents", label: "Rivales en común" },
  { key: "lastThreeTrend", label: "Tendencia últimos 3" },
  { key: "dataQuality", label: "Calidad de los datos" },
];

interface BestBetCardProps {
  recommendation: BettingRecommendation;
  matchLabel: string;
  analysisId: string;
}

export function BestBetCard({ recommendation, matchLabel, analysisId }: BestBetCardProps) {
  const [evidenceOpen, setEvidenceOpen] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const evaluation = recommendation.marketEvaluation;
  const match = getMatchById(evaluation.matchId);
  const homeTeam = match ? getTeamById(match.homeTeamId) : null;
  const awayTeam = match ? getTeamById(match.awayTeamId) : null;

  async function handleShare() {
    const text = `BetAnalyzer — ${matchLabel}: ${evaluation.market.name} (${evaluation.confidence}% de confianza, orientativo).`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "BetAnalyzer", text });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    }
  }

  return (
    <Card className="glow-green card-download-target relative overflow-hidden border-brand-green/30 bg-gradient-to-br from-elevated to-card">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-brand-green/10 blur-3xl" />
      <CardContent className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-brand-green-bright">
            <Star className="size-4 fill-brand-green-bright" /> Mejor Bet
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px]", RISK_LEVEL_COLOR[evaluation.riskLevel])}>
              Riesgo: {RISK_LEVEL_LABEL[evaluation.riskLevel]}
            </Badge>
            <DownloadCardButton filename={`mejor_bet_${evaluation.market.id}`} />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-md border border-brand-green/30 bg-brand-green/10 px-2.5 py-1 text-xs font-bold text-brand-green-bright shadow-sm">
            <span>⚔️</span>
            <span>{matchLabel}</span>
          </div>
          <p className="text-xl font-bold text-foreground">{evaluation.market.name}</p>
        </div>

        <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[auto_1fr]">
          <ConfidenceGauge score={evaluation.confidence} level={evaluation.confidenceLevel} size={112} />

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Cuota</p>
              <p className="text-lg font-bold text-foreground">{evaluation.odds ? formatOdds(evaluation.odds.decimalOdds) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prob. implícita</p>
              <p className="text-lg font-bold text-foreground">{evaluation.odds ? `${evaluation.odds.impliedProbability.toFixed(2)}%` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estim. BetAnalyzer</p>
              <p className="text-lg font-bold text-brand-green-bright">{evaluation.statisticalEstimate}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor estimado</p>
              {evaluation.valueLevel ? (
                <ValueIndicator level={evaluation.valueLevel} diff={evaluation.valueDifference} />
              ) : (
                <p className="text-lg font-bold text-foreground">—</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Patrones coincidentes</p>
              <p className="text-lg font-bold text-foreground">{recommendation.reasons.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contradicciones</p>
              <p className="text-lg font-bold text-foreground">{evaluation.contradictions.length}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Razones</p>
            <ul className="space-y-1.5 text-sm text-foreground/90">
              {recommendation.reasons.map((reason, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 text-brand-green">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Riesgos</p>
            <ul className="space-y-1.5 text-sm text-foreground/90">
              {recommendation.risks.map((risk) => (
                <li key={risk.id} className="flex gap-2">
                  <span className="mt-0.5 text-brand-yellow">•</span>
                  <span>{risk.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {match && (
          <MarketFiveParametersTable
            marketId={evaluation.market.id}
            homeRecords={getTeamMatchPool(match.homeTeamId)}
            awayRecords={getTeamMatchPool(match.awayTeamId)}
            homeTeamName={homeTeam?.shortName}
            awayTeamName={awayTeam?.shortName}
          />
        )}

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <FavoriteButton
            type="analysis"
            refId={analysisId}
            label={`${matchLabel} — ${evaluation.market.name}`}
            variant="full"
          />
          <FavoriteButton
            type="market"
            refId={evaluation.market.id}
            label={evaluation.market.name}
            meta={matchLabel}
            variant="full"
          />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEvidenceOpen(true)}>
            <Microscope className="size-4" /> Ver evidencia
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
            {shared ? <Check className="size-4 text-brand-green" /> : <Share2 className="size-4" />}
            {shared ? "Copiado" : "Compartir"}
          </Button>
        </div>
      </CardContent>

      <Dialog open={evidenceOpen} onOpenChange={setEvidenceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListPlus className="size-4 text-brand-green" /> Cómo se construyó la puntuación
            </DialogTitle>
            <DialogDescription>
              Ponderación del motor estadístico de BetAnalyzer para {evaluation.market.name.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {BREAKDOWN_LABELS.map(({ key, label }) => (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {label} <span className="text-muted-foreground/60">({Math.round(CONFIDENCE_WEIGHTS[key] * 100)}%)</span>
                  </span>
                  <span className="font-semibold text-foreground">{evaluation.confidenceBreakdown[key]}%</span>
                </div>
                <Progress value={evaluation.confidenceBreakdown[key]} className="h-1.5" />
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">Puntuación final</span>
              <span className="font-bold text-brand-green-bright">{evaluation.confidenceBreakdown.finalScore}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Esta puntuación es una estimación estadística orientativa y no representa una probabilidad real garantizada.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
