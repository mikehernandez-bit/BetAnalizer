import { CommonOpponentsAnalysis, Team } from "@/types";
import { getTeamById } from "@/data/teams";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateShort } from "@/utils/formatters";
import { RESULT_LETTER_LABEL } from "@/lib/labels";
import { Users2, TrendingUp, Layers, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

const RELEVANCE_LABEL = { alta: "Alta", media: "Media", baja: "Baja" };

export function CommonOpponentsTab({ data, teamA, teamB }: { data: CommonOpponentsAnalysis; teamA: Team; teamB: Team }) {
  if (data.opponents.length === 0) {
    return <EmptyState icon={Users2} title="Sin rivales en común" description="No se encontraron rivales compartidos recientes entre ambos equipos." />;
  }

  const better = data.summary.betterTeamId ? getTeamById(data.summary.betterTeamId) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={TrendingUp} label="Mejor rendimiento" value={better?.shortName ?? "Parejo"} accent="green" />
        <StatCard icon={Gauge} label="Diferencia promedio" value={data.summary.avgDifference.toFixed(1)} />
        <StatCard icon={Layers} label="Coincidencias" value={String(data.summary.matchesCount)} />
        <StatCard icon={Users2} label="Relevancia" value={RELEVANCE_LABEL[data.summary.relevance]} accent="yellow" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.opponents.map((opponent) => {
          const rival = getTeamById(opponent.opponentId);
          return (
            <Card key={opponent.opponentId}>
              <CardContent className="space-y-3">
                <p className="text-sm font-semibold text-foreground">vs {rival?.name ?? "Rival"}</p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: teamA.shortName, side: opponent.teamA },
                    { label: teamB.shortName, side: opponent.teamB },
                  ].map(({ label, side }) => (
                    <div key={label} className="rounded-lg bg-muted/40 p-2.5">
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="mt-1 text-muted-foreground">
                        {formatDateShort(side.date)} · {side.venue === "local" ? "Local" : "Visitante"}
                      </p>
                      <p className="mt-1">
                        Resultado:{" "}
                        <span className="font-medium text-foreground">
                          {RESULT_LETTER_LABEL[side.result]} ({side.goalsFor}-{side.goalsAgainst})
                        </span>
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Córners {side.corners} · Remates {side.shots} · TA {side.shotsOnTarget} · Pos. {side.possession}%
                      </p>
                    </div>
                  ))}
                </div>

                <p className={cn("text-xs leading-relaxed", "text-muted-foreground")}>{opponent.conclusion}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
