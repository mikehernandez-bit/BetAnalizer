import { HeadToHead, Team } from "@/types";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateShort } from "@/utils/formatters";
import { Percent, Goal, CircleDot, Trophy, History } from "lucide-react";
import { cn } from "@/lib/utils";

function buildDirectPatterns(h2h: HeadToHead, teamA: Team, teamB: Team): string[] {
  const patterns: string[] = [];
  const total = h2h.matches.length;
  if (total === 0) return patterns;

  const over15 = h2h.matches.filter((m) => m.homeGoals + m.awayGoals > 1.5).length;
  patterns.push(`Hubo más de 1.5 goles en ${over15} de ${total} partidos.`);

  let teamACorners = 0;
  let bothScored = 0;
  h2h.matches.forEach((m) => {
    const aCorners = m.homeTeamId === teamA.id ? m.homeCorners : m.awayCorners;
    const bCorners = m.homeTeamId === teamA.id ? m.awayCorners : m.homeCorners;
    if (aCorners > bCorners) teamACorners += 1;
    if (m.homeGoals > 0 && m.awayGoals > 0) bothScored += 1;
  });
  patterns.push(`${teamA.shortName} consiguió más córners en ${teamACorners} de ${total} partidos.`);
  patterns.push(`Ambos equipos marcaron en ${bothScored} de ${total} encuentros.`);

  const recent = h2h.matches.slice(0, Math.min(4, total));
  const teamBNoWinStreak = recent.every((m) => {
    const bGoals = m.homeTeamId === teamB.id ? m.homeGoals : m.awayGoals;
    const aGoals = m.homeTeamId === teamB.id ? m.awayGoals : m.homeGoals;
    return bGoals <= aGoals;
  });
  if (teamBNoWinStreak && recent.length >= 3) {
    patterns.push(`${teamB.shortName} no ganó los últimos ${recent.length} enfrentamientos directos.`);
  }

  return patterns;
}

export function H2HTab({ headToHead, teamA, teamB }: { headToHead: HeadToHead; teamA: Team; teamB: Team }) {
  if (headToHead.matches.length === 0) {
    return <EmptyState icon={History} title="Sin enfrentamientos directos registrados" description="No hay historial disponible entre estos dos equipos." />;
  }

  const patterns = buildDirectPatterns(headToHead, teamA, teamB);
  const dominant = headToHead.summary.dominantTeamId ? getTeamById(headToHead.summary.dominantTeamId) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Goal} label="Prom. goles" value={headToHead.summary.avgGoals.toFixed(1)} />
        <StatCard icon={CircleDot} label="Prom. córners" value={headToHead.summary.avgCorners.toFixed(1)} />
        <StatCard icon={Percent} label="Ambos marcan" value={`${headToHead.summary.bothScoredPct}%`} />
        <StatCard icon={Percent} label="Más de 2.5 goles" value={`${headToHead.summary.over25Pct}%`} accent="green" />
        <StatCard icon={Trophy} label="Más victorias" value={dominant?.shortName ?? "Parejo"} accent="yellow" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Competición</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Visitante</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead className="text-center">Córners</TableHead>
              <TableHead className="text-center">Tiros al arco</TableHead>
              <TableHead className="text-center">Tarjetas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headToHead.matches.map((m, i) => {
              const homeTeam = getTeamById(m.homeTeamId);
              const awayTeam = getTeamById(m.awayTeamId);
              const competition = getCompetitionById(m.competitionId);
              return (
                <TableRow key={m.matchId} className={cn(i === 0 && "bg-brand-green/5")}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(m.date)}</TableCell>
                  <TableCell className="text-muted-foreground">{competition?.shortName}</TableCell>
                  <TableCell className="font-medium">{homeTeam?.shortName}</TableCell>
                  <TableCell className="font-medium">{awayTeam?.shortName}</TableCell>
                  <TableCell className="font-semibold tabular-nums">
                    {m.homeGoals} - {m.awayGoals}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {m.homeCorners}-{m.awayCorners}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {m.homeShotsOnTarget}-{m.awayShotsOnTarget}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{m.cards}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardContent>
          <p className="mb-3 text-sm font-semibold text-foreground">Patrones directos</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {patterns.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-green">•</span> {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
