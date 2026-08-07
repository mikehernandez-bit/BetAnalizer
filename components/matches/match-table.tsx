import Link from "next/link";
import { Match } from "@/types";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { TeamBadge } from "@/components/shared/team-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MATCH_STATUS_LABEL, COMPETITION_TYPE_LABEL } from "@/lib/labels";
import { formatDateShort } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<Match["status"], string> = {
  scheduled: "border-brand-blue/25 bg-brand-blue/10 text-brand-blue",
  live: "border-brand-green/30 bg-brand-green/10 text-brand-green-bright",
  finished: "border-border bg-muted text-muted-foreground",
  postponed: "border-brand-yellow/25 bg-brand-yellow/10 text-brand-yellow",
};

export function MatchTable({ matches }: { matches: Match[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Competición</TableHead>
              <TableHead>Partido</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const home = getTeamById(match.homeTeamId);
              const away = getTeamById(match.awayTeamId);
              const competition = getCompetitionById(match.competitionId);
              if (!home || !away) return null;
              return (
                <TableRow key={match.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateShort(match.date)} · {match.time}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {competition?.shortName} · {COMPETITION_TYPE_LABEL[match.competitionType]}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TeamBadge team={home} size="xs" />
                      <span className="font-medium">{home.shortName}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="font-medium">{away.shortName}</span>
                      <TeamBadge team={away} size="xs" />
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {match.statistics ? `${match.statistics.homeGoals} - ${match.statistics.awayGoals}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", STATUS_BADGE[match.status])}>
                      {MATCH_STATUS_LABEL[match.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/partidos/${match.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {matches.map((match) => {
          const home = getTeamById(match.homeTeamId);
          const away = getTeamById(match.awayTeamId);
          const competition = getCompetitionById(match.competitionId);
          if (!home || !away) return null;
          return (
            <Link
              key={match.id}
              href={`/partidos/${match.id}`}
              className="block rounded-xl border border-border bg-card p-4 active:border-brand-green/30"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {competition?.shortName} · {formatDateShort(match.date)} · {match.time}
                </span>
                <Badge variant="outline" className={cn("text-[10px]", STATUS_BADGE[match.status])}>
                  {MATCH_STATUS_LABEL[match.status]}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TeamBadge team={home} size="sm" />
                  <span className="text-sm font-medium">{home.shortName}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                  {match.statistics ? `${match.statistics.homeGoals} - ${match.statistics.awayGoals}` : "vs"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{away.shortName}</span>
                  <TeamBadge team={away} size="sm" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
