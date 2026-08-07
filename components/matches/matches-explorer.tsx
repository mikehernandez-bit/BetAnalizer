"use client";

import * as React from "react";
import { Search, CalendarX } from "lucide-react";
import { Match } from "@/types";
import { getTeamById } from "@/data/teams";
import { useFilters } from "@/hooks/use-filters";
import { filterMatches } from "@/utils/filters";
import { MatchTable } from "@/components/matches/match-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { CompetitionSelector } from "@/components/shared/competition-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MATCH_STATUS_LABEL } from "@/lib/labels";

interface MatchesExplorerProps {
  matches: Match[];
  initialSearch?: string;
}

export function MatchesExplorer({ matches, initialSearch = "" }: MatchesExplorerProps) {
  const { filters, setFilter, activeCount } = useFilters({
    competitionId: "all",
    status: "all" as Match["status"] | "all",
    search: initialSearch,
  });

  const resolveTeamName = React.useCallback((id: string) => getTeamById(id)?.name ?? "", []);
  const filtered = React.useMemo(() => filterMatches(matches, filters, resolveTeamName), [matches, filters, resolveTeamName]);

  return (
    <div className="space-y-4">
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
        <div className="w-full sm:w-44">
          <CompetitionSelector value={filters.competitionId} onChange={(v) => setFilter("competitionId", v)} includeAllOption />
        </div>
        <div className="w-full sm:w-40">
          <Select value={filters.status} onValueChange={(v) => setFilter("status", v as Match["status"] | "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(MATCH_STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarX} title="No hay partidos con estos filtros" description="Ajusta los filtros o vuelve a intentarlo más tarde." />
      ) : (
        <MatchTable matches={filtered} />
      )}
    </div>
  );
}
