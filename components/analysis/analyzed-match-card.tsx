import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarDays, Database } from "lucide-react";
import { Match } from "@/types";
import { getCompetitionById } from "@/data/competitions";
import { getTeamById } from "@/data/teams";
import { buildAnalysisId, resolveAnalysisById } from "@/services/analysis-service";
import { getTodayIso } from "@/services/match-service";
import { TeamBadge } from "@/components/shared/team-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { relativeDayLabel } from "@/utils/formatters";
import { checkMatchDataAudit } from "@/utils/data-audit";
import { DownloadCardButton } from "@/components/shared/download-card-button";

export function AnalyzedMatchCard({ match }: { match: Match }) {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const competition = getCompetitionById(match.competitionId);
  if (!home || !away) return null;

  const analysisId = buildAnalysisId(home.id, away.id, 10);
  const analysis = resolveAnalysisById(analysisId);
  const perfectCrosses =
    analysis?.crossPatterns.filter((pattern) => pattern.teamAStat.percentage === 100 && pattern.teamBStat.percentage === 100).length ?? 0;

  const audit = checkMatchDataAudit(home.id, away.id, 10);

  return (
    <Link href={`/analisis/${analysisId}`} className="group">
      <Card className="card-download-target h-full transition-colors group-hover:border-brand-green/35">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="truncate">{competition?.shortName ?? match.competitionId}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {audit.hasIncompleteData ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-[10px] font-medium shrink-0"
                  title={audit.summaryText}
                >
                  <AlertTriangle className="size-3" /> Datos parciales
                </Badge>
              ) : (
                <Badge variant="outline" className="shrink-0">Cargado</Badge>
              )}
              <DownloadCardButton filename={`analisis_${home.id}_vs_${away.id}`} />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <TeamBadge team={home} size="sm" />
            <span className="text-xs text-muted-foreground">VS</span>
            <TeamBadge team={away} size="sm" />
          </div>
          <p className="text-center text-sm font-semibold text-foreground">
            {home.shortName} vs {away.shortName}
          </p>

          {audit.hasIncompleteData && (
            <div className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span className="truncate">
                Muestras parciales ({audit.missingMetrics.join(", ")}) en {audit.incompleteTeamNames.join(" y ")}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 border-y border-border py-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="size-3.5" /> {relativeDayLabel(match.date, getTodayIso())} · {match.time}
            </span>
            <span className="flex items-center justify-end gap-1.5 font-semibold text-brand-green-bright">
              <Database className="size-3.5" /> {perfectCrosses} cruces 100%
            </span>
          </div>

          <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-foreground">
            Abrir análisis <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
