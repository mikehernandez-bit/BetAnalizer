"use client";

import * as React from "react";
import { MarketCategory, Pattern, StatKey, Team, TeamForm } from "@/types";
import { MARKET_CATEGORY_LABELS } from "@/data/markets";
import { TeamHistoryTable } from "@/components/analysis/team-history-table";
import { TeamStatSummary } from "@/components/analysis/team-stat-summary";
import { PatternCard } from "@/components/patterns/pattern-card";
import { ChartContainer } from "@/components/shared/chart-container";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/utils/formatters";
import { BarChart3 } from "lucide-react";

type FilterKey = "all" | "local" | "visitante" | "ganados" | "empatados" | "perdidos" | "misma_competicion";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "local", label: "Local" },
  { key: "visitante", label: "Visitante" },
  { key: "ganados", label: "Ganados" },
  { key: "empatados", label: "Empatados" },
  { key: "perdidos", label: "Perdidos" },
  { key: "misma_competicion", label: "Misma competición" },
];

const PATTERN_CATEGORY_ORDER: MarketCategory[] = ["corners", "goles", "ambos_marcan", "tiros_arco", "remates", "resultado"];

interface TeamTabProps {
  team: Team;
  form: TeamForm;
  patterns: Pattern[];
  side: "home" | "away";
  matchCompetitionId: string;
}

export function TeamTab({ team, form, patterns, side, matchCompetitionId }: TeamTabProps) {
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const teamRoleLabel = side === "home" ? "Equipo 1" : "Equipo 2";

  const filtered = React.useMemo(() => {
    return form.matches.filter((r) => {
      if (filter === "local") return r.venue === "local";
      if (filter === "visitante") return r.venue === "visitante";
      if (filter === "ganados") return r.result === "W";
      if (filter === "empatados") return r.result === "D";
      if (filter === "perdidos") return r.result === "L";
      if (filter === "misma_competicion") return r.competitionId === matchCompetitionId;
      return true;
    });
  }, [form.matches, filter, matchCompetitionId]);

  const summaryKeys: { key: StatKey; label: string }[] =
    side === "home"
      ? [
          { key: "goalsFor", label: "Goles a favor" },
          { key: "cornersFor", label: "Córners a favor" },
          { key: "shotsFor", label: "Remates" },
          { key: "shotsOnTargetFor", label: "Tiros al arco" },
        ]
      : [
          { key: "goalsAgainst", label: "Goles recibidos" },
          { key: "cornersAgainst", label: "Córners concedidos" },
          { key: "shotsAgainst", label: "Remates permitidos" },
          { key: "shotsOnTargetAgainst", label: "Tiros al arco permitidos" },
        ];

  const chronological = [...form.matches].reverse();
  const chartData = (key: StatKey) => chronological.map((r) => ({ label: formatDateShort(r.date), value: r[key] }));
  const patternsByCategory = React.useMemo(
    () =>
      PATTERN_CATEGORY_ORDER.map((category) => ({
        category,
        patterns: patterns.filter((pattern) => pattern.category === category),
      })).filter((group) => group.patterns.length > 0),
    [patterns]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "secondary" : "outline"}
            onClick={() => setFilter(f.key)}
            className={cn(filter === f.key && "border-brand-green/30 text-brand-green-bright")}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BarChart3} title="Sin partidos para este filtro" description="Prueba con otro criterio de filtrado." />
      ) : (
        <TeamHistoryTable records={filtered} />
      )}

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">Resumen estadístico</p>
        <TeamStatSummary stats={form.stats} keys={summaryKeys} />
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">
          Patrones individuales — {teamRoleLabel}: {team.name} · {patterns.length} detectados
        </p>
        {patterns.length === 0 ? (
          <EmptyState title="Sin patrones suficientes" description="La muestra actual no permite detectar patrones sólidos." />
        ) : (
          <div className="space-y-5">
            {patternsByCategory.map((group) => (
              <section key={group.category} className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {MARKET_CATEGORY_LABELS[group.category] ?? group.category} · {group.patterns.length}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.patterns.map((pattern) => (
                    <PatternCard key={pattern.id} pattern={pattern} records={form.matches} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartContainer title="Evolución de goles" height={220}>
          <TrendLineChart data={chartData(side === "home" ? "goalsFor" : "goalsAgainst")} color="#22C55E" />
        </ChartContainer>
        <ChartContainer title="Evolución de córners" height={220}>
          <TrendLineChart data={chartData(side === "home" ? "cornersFor" : "cornersAgainst")} color="#3B82F6" />
        </ChartContainer>
        <ChartContainer title="Evolución de remates" height={220}>
          <TrendLineChart data={chartData(side === "home" ? "shotsFor" : "shotsAgainst")} color="#F59E0B" />
        </ChartContainer>
        <ChartContainer title="Evolución de tiros al arco" height={220}>
          <TrendLineChart data={chartData(side === "home" ? "shotsOnTargetFor" : "shotsOnTargetAgainst")} color="#A855F7" />
        </ChartContainer>
      </div>
    </div>
  );
}
