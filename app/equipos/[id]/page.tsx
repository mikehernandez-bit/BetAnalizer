import { notFound } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { getTeamById } from "@/data/teams";
import { getMatchesByTeam } from "@/data/matches";
import { getFilteredTeamForm } from "@/services/team-service";
import { getPatternsForTeam, getTeamBestMarkets } from "@/services/pattern-service";
import { TeamProfileHeader } from "@/components/teams/team-profile-header";
import { TeamStatSummary } from "@/components/analysis/team-stat-summary";
import { TeamMatchList } from "@/components/analysis/team-match-list";
import { PatternCard } from "@/components/patterns/pattern-card";
import { MatchCard } from "@/components/matches/match-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "@/components/shared/section-header";

export default async function TeamProfilePage(props: PageProps<"/equipos/[id]">) {
  const { id } = await props.params;
  const team = getTeamById(id);
  if (!team) notFound();

  const form = getFilteredTeamForm(id, 10);
  const homeForm = getFilteredTeamForm(id, 20, { onlyVenue: "local" });
  const awayForm = getFilteredTeamForm(id, 20, { onlyVenue: "visitante" });
  const patterns = getPatternsForTeam(id, 10);
  const bestMarkets = getTeamBestMarkets(id, 10);
  const upcoming = getMatchesByTeam(id)
    .filter((m) => m.status === "scheduled" || m.status === "live")
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <TeamProfileHeader team={team} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <p className="mb-3 text-sm font-semibold text-foreground">Rendimiento como local</p>
          <TeamStatSummary
            stats={homeForm.stats}
            keys={[
              { key: "goalsFor", label: "Goles a favor" },
              { key: "cornersFor", label: "Córners a favor" },
            ]}
          />
        </section>
        <section>
          <p className="mb-3 text-sm font-semibold text-foreground">Rendimiento como visitante</p>
          <TeamStatSummary
            stats={awayForm.stats}
            keys={[
              { key: "goalsAgainst", label: "Goles recibidos" },
              { key: "cornersAgainst", label: "Córners concedidos" },
            ]}
          />
        </section>
      </div>

      <section>
        <SectionHeader title="Mejores mercados" description="Basado en el cumplimiento reciente del equipo" />
        {bestMarkets.length === 0 ? (
          <EmptyState title="Sin mercados destacados" description="La muestra actual no arroja mercados con respaldo suficiente." />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {bestMarkets.map((m) => (
              <Card key={m.marketId}>
                <CardContent className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{m.marketName}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={m.percentage} className="h-2 flex-1" />
                    <span className="text-sm font-bold text-brand-green-bright">{m.percentage}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Patrones recientes" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} records={form.matches} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Últimos partidos" />
        <div className="mt-4">
          <TeamMatchList team={team} records={form.matches} />
        </div>
      </section>

      <section>
        <SectionHeader title="Próximos partidos" />
        {upcoming.length === 0 ? (
          <EmptyState icon={TrendingUp} title="Sin partidos próximos" description="Este equipo no tiene encuentros programados en este momento." className="mt-4" />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
