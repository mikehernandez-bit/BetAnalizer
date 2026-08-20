import Link from "next/link";
import { Sparkles, MapPin, AlertTriangle } from "lucide-react";
import { Match } from "@/types";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { estimateFeaturedStats } from "@/services/match-service";
import { TeamBadge } from "@/components/shared/team-badge";
import { FormIndicator } from "@/components/shared/form-indicator";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COMPETITION_TYPE_LABEL } from "@/lib/labels";
import { pluralize, relativeDayLabel } from "@/utils/formatters";
import { getTodayIso } from "@/services/match-service";
import { checkMatchDataAudit } from "@/utils/data-audit";
import { DownloadCardButton } from "@/components/shared/download-card-button";
import { CopyMatchButton } from "@/components/shared/copy-match-button";
import { formatFootballMatchToClipboard } from "@/lib/clipboard-formatters";

export function MatchCard({ match }: { match: Match }) {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const competition = getCompetitionById(match.competitionId);
  if (!home || !away) return null;

  const stats = estimateFeaturedStats(home.id, away.id);
  const favored = stats.favoredTeamId === home.id ? home : away;
  const audit = checkMatchDataAudit(home.id, away.id, 10);

  return (
    <Card className="card-download-target group relative overflow-hidden p-4 transition-colors hover:border-brand-green/30 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Badge variant="outline" className="border-border text-[10px] font-medium">
            {competition?.shortName ?? "Competición"}
          </Badge>
          {audit.hasIncompleteData && (
            <Badge
              variant="outline"
              className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-[10px] font-medium"
              title={audit.summaryText}
            >
              <AlertTriangle className="size-3" /> Datos parciales
            </Badge>
          )}
          <span>{COMPETITION_TYPE_LABEL[match.competitionType]}</span>
          <span aria-hidden>·</span>
          <span>{relativeDayLabel(match.date, getTodayIso())}</span>
          <span aria-hidden>·</span>
          <span>{match.time}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <CopyMatchButton
            getText={() => formatFootballMatchToClipboard(match)}
            label="Copiar"
            size="sm"
            title="Copiar toda la información y mercados de este partido"
          />
          <DownloadCardButton filename={`partido_${home.id}_vs_${away.id}`} />
          <FavoriteButton type="match" refId={match.id} label={`${home.shortName} vs ${away.shortName}`} meta={competition?.name} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex min-w-0 flex-col items-center gap-2 text-center">
          <TeamBadge team={home} size="lg" />
          <p className="w-full truncate text-sm font-semibold">{home.shortName}</p>
          <FormIndicator results={home.form} />
        </div>

        <div className="flex flex-col items-center gap-1 px-1">
          <span className="text-lg font-bold text-muted-foreground">VS</span>
          <span className="text-[11px] text-muted-foreground">{match.stadium}</span>
        </div>

        <div className="flex min-w-0 flex-col items-center gap-2 text-center">
          <TeamBadge team={away} size="lg" />
          <p className="w-full truncate text-sm font-semibold">{away.shortName}</p>
          <FormIndicator results={away.form} />
        </div>
      </div>

      {audit.hasIncompleteData && (
        <div className="mt-3 flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-3 shrink-0" />
          <span className="truncate">
            Muestras parciales ({audit.missingMetrics.join(", ")}) en {audit.incompleteTeamNames.join(" y ")}
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-3.5" /> Prob. estimada {favored.shortName}
          <span className="font-semibold text-brand-green-bright">{stats.probability}%</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Sparkles className="size-3.5 text-brand-yellow" /> {stats.strongPatterns}{" "}
          {pluralize(stats.strongPatterns, "patrón detectado", "patrones detectados")}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <Button asChild size="sm" className="flex-1 gap-1.5">
          <Link href={`/analisis/${home.id}-vs-${away.id}-10c`}>Abrir análisis</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/partidos/${match.id}`}>Detalle</Link>
        </Button>
      </div>
    </Card>
  );
}
