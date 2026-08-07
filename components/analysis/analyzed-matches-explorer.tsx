"use client";

import * as React from "react";
import { Search, CalendarX, X } from "lucide-react";
import { Match } from "@/types";
import { getTeamById } from "@/data/teams";
import { getImportedPackage } from "@/data/imported-data";
import { useFilters } from "@/hooks/use-filters";
import { filterMatches } from "@/utils/filters";
import { groupMatchesByRelativeDate } from "@/utils/match-grouping";
import { getTodayIso } from "@/services/match-service";
import { AnalyzedMatchCard } from "@/components/analysis/analyzed-match-card";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortMode = "grouped" | "matchDateDesc" | "registeredAtDesc";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "grouped", label: "Próximos primero" },
  { value: "matchDateDesc", label: "Fecha de partido: más nuevo primero" },
  { value: "registeredAtDesc", label: "Fecha de registro: más nuevo primero" },
];

/** researchedAt del paquete importado (fecha en que se cargó ese partido al sistema). */
function registeredAtOf(match: Match): string {
  return getImportedPackage(match.id)?.researchedAt ?? "";
}

function isPastMatch(match: Match, todayIso: string): boolean {
  return match.date < todayIso;
}

interface AnalyzedMatchesExplorerProps {
  matches: Match[];
}

export function AnalyzedMatchesExplorer({ matches }: AnalyzedMatchesExplorerProps) {
  const { filters, setFilter, activeCount } = useFilters({ search: "", dateIso: "", sortBy: "grouped" as SortMode });

  const resolveTeamName = React.useCallback((id: string) => getTeamById(id)?.name ?? "", []);
  const hasSearchFilters = Boolean(filters.search || filters.dateIso);

  // Ayer y los partidos anteriores no aportan a la vista de "qué analizar" —
  // solo se muestran si el usuario los busca explícitamente (por equipo o
  // por una fecha puntual). En el resto de las vistas, quedan afuera.
  const basePool = React.useMemo(() => {
    if (hasSearchFilters) return matches;
    const todayIso = getTodayIso();
    return matches.filter((m) => !isPastMatch(m, todayIso));
  }, [matches, hasSearchFilters]);

  const filtered = React.useMemo(() => filterMatches(basePool, filters, resolveTeamName), [basePool, filters, resolveTeamName]);

  const todayIso = getTodayIso();
  const groups = React.useMemo(() => groupMatchesByRelativeDate(filtered, todayIso), [filtered, todayIso]);

  const flatSorted = React.useMemo(() => {
    if (filters.sortBy === "registeredAtDesc") {
      return [...filtered].sort((a, b) => registeredAtOf(b).localeCompare(registeredAtOf(a)));
    }
    if (filters.sortBy === "matchDateDesc") {
      return [...filtered].sort((a, b) => (a.date + a.time > b.date + b.time ? -1 : 1));
    }
    // "grouped" con búsqueda activa: se muestra plano, orden cronológico ascendente.
    return [...filtered].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
  }, [filtered, filters.sortBy]);

  const showGrouped = !hasSearchFilters && filters.sortBy === "grouped";

  return (
    <div className="space-y-6">
      <FilterBar activeCount={activeCount}>
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Buscar equipo…"
            className="pl-8"
          />
        </div>
        <div className="flex w-full items-center gap-1.5 sm:w-52">
          <Input
            type="date"
            value={filters.dateIso}
            onChange={(e) => setFilter("dateIso", e.target.value)}
            aria-label="Buscar por fecha"
            className="w-full"
          />
          {filters.dateIso && (
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setFilter("dateIso", "")} aria-label="Quitar filtro de fecha">
              <X className="size-3.5" />
            </Button>
          )}
        </div>
        <div className="w-full sm:w-64">
          <Select value={filters.sortBy} onValueChange={(v) => setFilter("sortBy", v as SortMode)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No hay partidos con estos filtros"
          description="Ayer y los partidos anteriores no se muestran por defecto — buscá por equipo o por fecha si buscás uno de ellos."
        />
      ) : showGrouped ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key} className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {group.label}
                <span className="text-xs font-normal text-muted-foreground">· {group.matches.length}</span>
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.matches.map((match) => (
                  <AnalyzedMatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {flatSorted.map((match) => (
            <AnalyzedMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
