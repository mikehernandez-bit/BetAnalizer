import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, CalendarDays, Trophy, Wand2 } from "lucide-react";
import { getMatchById } from "@/data/matches";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { getImportedPackage, importedHistories } from "@/data/imported-data";
import { estimateFeaturedStats } from "@/services/match-service";
import { TeamBadge } from "@/components/shared/team-badge";
import { FormIndicator } from "@/components/shared/form-indicator";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MATCH_STATUS_LABEL, COMPETITION_TYPE_LABEL } from "@/lib/labels";
import { formatDateLong } from "@/utils/formatters";
import { TeamHistoryTable } from "@/components/analysis/team-history-table";

export default async function MatchDetailPage(props: PageProps<"/partidos/[id]">) {
  const { id } = await props.params;
  const match = getMatchById(id);
  if (!match) notFound();

  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const competition = getCompetitionById(match.competitionId);
  if (!home || !away) notFound();

  const importedPackage = getImportedPackage(match.id);
  const homeHistory = importedHistories[home.id] ?? [];
  const awayHistory = importedHistories[away.id] ?? [];
  const analysisHref = `/analisis/${home.id}-vs-${away.id}-10c`;
  const stats = match.statistics;
  const quick = match.status !== "finished" ? estimateFeaturedStats(home.id, away.id) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="size-4" />
              {competition?.name} · {COMPETITION_TYPE_LABEL[match.competitionType]} · Jornada {match.matchday}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{MATCH_STATUS_LABEL[match.status]}</Badge>
              <FavoriteButton type="match" refId={match.id} label={`${home.shortName} vs ${away.shortName}`} meta={competition?.name} />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <TeamBadge team={home} size="xl" />
              <p className="font-semibold">{home.name}</p>
              <FormIndicator results={home.form} />
            </div>
            <div className="text-center">
              {stats ? (
                <p className="text-3xl font-bold tabular-nums">
                  {stats.homeGoals} - {stats.awayGoals}
                </p>
              ) : (
                <p className="text-2xl font-bold text-muted-foreground">VS</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{match.time}</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <TeamBadge team={away} size="xl" />
              <p className="font-semibold">{away.name}</p>
              <FormIndicator results={away.form} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" /> {formatDateLong(match.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {match.stadium}
            </span>
          </div>

          {quick && (
            <div className="rounded-lg bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
              Probabilidad estimada de {quick.favoredTeamId === home.id ? home.shortName : away.shortName}:{" "}
              <span className="font-semibold text-brand-green-bright">{quick.probability}%</span> · {quick.strongPatterns} patrones
              estadísticos detectados
            </div>
          )}

          <Button asChild size="lg" className="w-full gap-2">
            <Link href={analysisHref}>
              <Wand2 className="size-4" /> Analizar este partido
            </Link>
          </Button>
        </CardContent>
      </Card>

      {importedPackage && (
        <Card>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Datos investigados del partido</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Cargados el {formatDateLong(importedPackage.researchedAt.slice(0, 10))}. Estos registros alimentan el análisis estadístico.
              </p>
            </div>

            {importedPackage.dataQuality?.warning && (
              <div className="rounded-lg border border-brand-yellow/30 bg-brand-yellow/10 px-3 py-2 text-xs text-muted-foreground">
                {importedPackage.dataQuality.warning}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {[{ team: home, records: homeHistory }, { team: away, records: awayHistory }].map(({ team, records }) => {
                const goals = records.reduce((sum, record) => sum + record.goalsFor, 0);
                const corners = records.reduce((sum, record) => sum + record.cornersFor, 0);
                return (
                  <div key={team.id} className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                    <p className="font-medium">{team.shortName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {records.length} partidos · {goals} goles · {corners} córners a favor
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Últimos partidos de {home.shortName}</p>
                <TeamHistoryTable records={homeHistory} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Últimos partidos de {away.shortName}</p>
                <TeamHistoryTable records={awayHistory} />
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Fuentes consultadas</p>
              <div className="mt-2 space-y-1">
                {importedPackage.sourceUrls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block truncate text-xs text-brand-blue hover:underline">
                    {url}
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <Card>
          <CardContent>
            <p className="mb-4 text-sm font-semibold text-foreground">Estadísticas del partido</p>
            <div className="space-y-3">
              {[
                { label: "Córners", home: stats.homeCorners, away: stats.awayCorners },
                { label: "Remates", home: stats.homeShots, away: stats.awayShots },
                { label: "Tiros al arco", home: stats.homeShotsOnTarget, away: stats.awayShotsOnTarget },
                { label: "Posesión", home: stats.homePossession, away: stats.awayPossession, suffix: "%" },
                { label: "Tarjetas amarillas", home: stats.homeYellowCards, away: stats.awayYellowCards },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                  <span className="text-right font-medium tabular-nums">
                    {row.home}
                    {row.suffix ?? ""}
                  </span>
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="text-left font-medium tabular-nums">
                    {row.away}
                    {row.suffix ?? ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
