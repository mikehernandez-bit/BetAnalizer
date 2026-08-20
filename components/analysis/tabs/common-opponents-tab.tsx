import { CommonOpponentsAnalysis, Team } from "@/types";
import { getTeamById } from "@/data/teams";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateShort } from "@/utils/formatters";
import { RESULT_LETTER_LABEL } from "@/lib/labels";
import { formatOpponentName } from "@/utils/matchups";
import { Users2, TrendingUp, Layers, Gauge, Shield, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const RELEVANCE_LABEL = { alta: "Alta", media: "Media", baja: "Baja" };

export function CommonOpponentsTab({ data, teamA, teamB }: { data: CommonOpponentsAnalysis; teamA: Team; teamB: Team }) {
  if (data.opponents.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title="Sin rivales en común"
        description="No se encontraron rivales compartidos en las muestras oficiales analizadas de ambos equipos."
      />
    );
  }

  const better = data.summary.betterTeamId ? getTeamById(data.summary.betterTeamId) : null;

  return (
    <div className="space-y-6">
      <div className="adaptive-stat-grid grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={TrendingUp} label="Mejor rendimiento" value={better?.shortName ?? "Parejo"} accent="green" />
        <StatCard icon={Gauge} label="Diferencia promedio" value={data.summary.avgDifference.toFixed(1)} />
        <StatCard icon={Layers} label="Rivales en común" value={String(data.summary.matchesCount)} />
        <StatCard icon={Users2} label="Relevancia" value={RELEVANCE_LABEL[data.summary.relevance]} accent="yellow" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.opponents.map((opponent) => {
          const rivalName = opponent.opponentName || formatOpponentName(opponent.opponentId);
          return (
            <Card key={opponent.opponentId} className="overflow-hidden border-border/80 shadow-sm">
              <CardContent className="space-y-4 p-4">
                {/* Cabecera del Rival Compartido */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md bg-brand-blue/10 text-brand-blue">
                      <Shield className="size-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rival Compartido</span>
                      <h4 className="text-base font-bold text-foreground leading-tight">{rivalName}</h4>
                    </div>
                  </div>
                  {opponent.difference.goals !== 0 ? (
                    <Badge variant="outline" className="text-xs font-medium">
                      Dif. Goles: {opponent.difference.goals > 0 ? `+${opponent.difference.goals}` : opponent.difference.goals}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs font-medium">
                      Dif. Goles: 0
                    </Badge>
                  )}
                </div>

                {/* Comparación Directa de Ambos Equipos */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { team: teamA, side: opponent.teamA },
                    { team: teamB, side: opponent.teamB },
                  ].map(({ team, side }) => {
                    const isWin = side.result === "W";
                    const isDraw = side.result === "D";
                    return (
                      <div
                        key={team.id}
                        className={cn(
                          "rounded-lg border p-3 text-xs space-y-2",
                          isWin
                            ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                            : isDraw
                            ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20"
                            : "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20"
                        )}
                      >
                        {/* Cabecera del equipo */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-foreground">{team.shortName}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {side.venue === "local" ? "Local" : "Visitante"}
                          </Badge>
                        </div>

                        {/* Fecha */}
                        <div className="text-[11px] text-muted-foreground">
                          {formatDateShort(side.date)}
                        </div>

                        {/* Marcador Principal */}
                        <div className="flex items-center justify-between rounded bg-background/60 px-2 py-1.5 border border-border/50">
                          <span className="font-medium text-foreground">
                            {RESULT_LETTER_LABEL[side.result]}
                          </span>
                          <span className="font-bold text-base tabular-nums text-foreground">
                            {side.goalsFor} - {side.goalsAgainst}
                          </span>
                        </div>

                        {/* Desglose de 1T y 2T si está disponible */}
                        {(side.goalsForFirstHalf !== undefined || side.goalsForSecondHalf !== undefined) && (
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                            <span>1er Tiempo: <strong>{side.goalsForFirstHalf ?? 0}-{side.goalsAgainstFirstHalf ?? 0}</strong></span>
                            <span>2do Tiempo: <strong>{side.goalsForSecondHalf ?? 0}-{side.goalsAgainstSecondHalf ?? 0}</strong></span>
                          </div>
                        )}

                        {/* Métricas: Córners y Tarjetas */}
                        <div className="border-t border-border/50 pt-2 space-y-1 text-[11px] text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Flag className="size-3 text-brand-blue" /> Córners:
                            </span>
                            <span className="font-medium text-foreground tabular-nums">
                              {side.corners ?? "-"} a favor {side.cornersAgainst !== undefined ? `(${side.cornersAgainst} riv)` : ""}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <span className="inline-block size-2.5 rounded-[2px] bg-amber-400" /> T. Amarillas:
                            </span>
                            <span className="font-medium text-foreground tabular-nums">
                              {side.yellowCards ?? "-"} {side.yellowCardsAgainst !== undefined ? `(${side.yellowCardsAgainst} riv)` : ""}
                              {side.redCards ? ` · 🟥 ${side.redCards}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Conclusión */}
                <div className="rounded-md bg-muted/60 p-2.5 text-xs text-muted-foreground leading-relaxed border border-border/40">
                  <span className="font-semibold text-foreground">Análisis: </span>
                  {opponent.conclusion}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
