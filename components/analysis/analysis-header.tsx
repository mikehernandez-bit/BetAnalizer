"use client";

import { MapPin, CalendarDays, Trophy, Database, Clock3 } from "lucide-react";
import { AnalysisResult } from "@/types";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { TeamBadge } from "@/components/shared/team-badge";
import { FormIndicator } from "@/components/shared/form-indicator";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { ExportButton } from "@/components/shared/export-button";
import { CopyMatchButton } from "@/components/shared/copy-match-button";
import { formatFootballAnalysisToClipboard } from "@/lib/clipboard-formatters";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATCH_STATUS_LABEL, COMPETITION_TYPE_LABEL, DATA_QUALITY_LABEL } from "@/lib/labels";
import { formatDateLong } from "@/utils/formatters";

function buildExportSummary(analysis: AnalysisResult, homeName: string, awayName: string): string {
  const lines = [
    `BetAnalyzer — ${homeName} vs ${awayName}`,
    `Generado: ${new Date(analysis.generatedAt).toLocaleString("es-ES")}`,
    `Confianza general: ${analysis.overallConfidence}% · Calidad de datos: ${analysis.dataQuality}`,
    `Partidos analizados: ${analysis.matchesAnalyzed}`,
    "",
    analysis.quickRead,
    "",
    analysis.bestBet
      ? `Mejor Bet: ${analysis.bestBet.marketEvaluation.market.name} (${analysis.bestBet.marketEvaluation.confidence}% confianza)`
      : "No existe una apuesta suficientemente respaldada por los datos disponibles.",
    "",
    "BetAnalyzer ofrece análisis estadísticos con fines informativos. Las tendencias históricas no garantizan resultados futuros.",
  ];
  return lines.join("\n");
}

export function AnalysisHeader({ analysis }: { analysis: AnalysisResult }) {
  const home = getTeamById(analysis.match.homeTeamId);
  const away = getTeamById(analysis.match.awayTeamId);
  const competition = getCompetitionById(analysis.match.competitionId);
  if (!home || !away) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Trophy className="size-4" /> {competition?.name} · {COMPETITION_TYPE_LABEL[analysis.match.competitionType]} · Jornada{" "}
              {analysis.match.matchday}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {formatDateLong(analysis.match.date)} · {analysis.match.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {analysis.match.neutralVenue ? `Sede neutral · ${analysis.match.stadium}` : analysis.match.stadium}
            </span>
          </div>
          <Badge variant="outline">{MATCH_STATUS_LABEL[analysis.match.status]}</Badge>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <TeamBadge team={home} size="xl" />
            <p className="font-semibold">{home.name}</p>
            <p className="text-xs text-muted-foreground">Posición {home.position}</p>
            <FormIndicator results={home.form} />
          </div>
          <span className="text-xl font-bold text-muted-foreground">VS</span>
          <div className="flex flex-col items-center gap-2 text-center">
            <TeamBadge team={away} size="xl" />
            <p className="font-semibold">{away.name}</p>
            <p className="text-xs text-muted-foreground">Posición {away.position}</p>
            <FormIndicator results={away.form} />
          </div>
        </div>

        <div className="adaptive-stat-grid grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Confianza general</p>
            <div className="mt-1 flex justify-center">
              <ConfidenceBadge
                level={analysis.overallConfidence >= 80 ? "muy_alta" : analysis.overallConfidence >= 70 ? "alta" : analysis.overallConfidence >= 60 ? "moderada" : analysis.overallConfidence >= 50 ? "baja" : "evitar"}
                score={analysis.overallConfidence}
                size="sm"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Calidad de datos</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold">
              <Database className="size-3.5" /> {DATA_QUALITY_LABEL[analysis.dataQuality]}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Partidos analizados</p>
            <p className="mt-1 text-sm font-semibold">{analysis.matchesAnalyzed}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">Última actualización</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold">
              <Clock3 className="size-3.5" />{" "}
              {new Date(analysis.lastUpdated).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <CopyMatchButton
            getText={() => formatFootballAnalysisToClipboard(analysis)}
            label="Copiar info y mercados"
            successLabel="¡Información copiada!"
            variant="default"
          />
          <FavoriteButton type="analysis" refId={analysis.id} label={`${home.shortName} vs ${away.shortName}`} meta={competition?.name} variant="full" />
          <ExportButton
            filename={`betanalyzer-${home.code}-vs-${away.code}.txt`}
            getContent={() => buildExportSummary(analysis, home.name, away.name)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
