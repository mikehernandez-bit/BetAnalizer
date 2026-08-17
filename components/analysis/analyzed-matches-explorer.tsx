"use client";

import * as React from "react";
import { Search, CalendarX, X } from "lucide-react";
import { Match } from "@/types";
import { getTeamById } from "@/data/teams";
import { getCompetitionById } from "@/data/competitions";
import { getImportedPackage } from "@/data/imported-data";
import { isMatchExpired } from "@/data/matches";
import { useFilters } from "@/hooks/use-filters";
import { filterMatches } from "@/utils/filters";
import { groupMatchesByRelativeDate } from "@/utils/match-grouping";
import { getTodayIso } from "@/services/match-service";
import { AnalyzedMatchCard } from "@/components/analysis/analyzed-match-card";
import { FilterBar } from "@/components/shared/filter-bar";
import { CompetitionSelector } from "@/components/shared/competition-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "betanalyzer_selected_competition";

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
  if (match.date < todayIso) return true;
  return isMatchExpired(match);
}

function getStoredCompetition(matches: Match[]): string {
  if (typeof window === "undefined") return "all";
  try {
    const params = new URLSearchParams(window.location.search);
    const urlComp = params.get("comp");
    if (urlComp && urlComp !== "all" && matches.some((m) => m.competitionId === urlComp)) {
      return urlComp;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored !== "all" && matches.some((m) => m.competitionId === stored)) {
      return stored;
    }
  } catch {
    // Ignorar errores de acceso a window/localStorage
  }
  return "all";
}

interface AnalyzedMatchesExplorerProps {
  matches: Match[];
}

export function AnalyzedMatchesExplorer({ matches }: AnalyzedMatchesExplorerProps) {
  const initialComp = React.useMemo(() => getStoredCompetition(matches), [matches]);

  const { filters, setFilter, activeCount } = useFilters({
    search: "",
    dateIso: "",
    competitionId: initialComp,
    sortBy: "grouped" as SortMode,
  });

  const resolveTeamName = React.useCallback((id: string) => getTeamById(id)?.name ?? "", []);

  // Pool de partidos vigentes/activos (excluye automáticamente los expirados/pasados)
  const activePool = React.useMemo(() => {
    const todayIso = getTodayIso();
    return matches.filter((m) => !isPastMatch(m, todayIso));
  }, [matches]);

  // Las competiciones mostradas se derivan ÚNICAMENTE del pool de partidos vigentes/en juego
  const availableCompetitions = React.useMemo(() => {
    const compMap = new Map<string, { id: string; name: string; shortName: string; count: number }>();
    activePool.forEach((m) => {
      const comp = getCompetitionById(m.competitionId);
      const shortName = comp?.shortName ?? m.competitionId;
      const name = comp?.name ?? m.competitionId;
      const existing = compMap.get(m.competitionId);
      if (existing) {
        existing.count += 1;
      } else {
        compMap.set(m.competitionId, { id: m.competitionId, name, shortName, count: 1 });
      }
    });
    return Array.from(compMap.values()).sort((a, b) => b.count - a.count);
  }, [activePool]);

  // Sincronización post-renderizado para seguridad en SSR
  React.useEffect(() => {
    const stored = getStoredCompetition(matches);
    if (stored !== filters.competitionId) {
      setFilter("competitionId", stored);
    }
  }, [matches]);

  const handleCompetitionChange = React.useCallback(
    (newCompetitionId: string) => {
      setFilter("competitionId", newCompetitionId);
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, newCompetitionId);
          const url = new URL(window.location.href);
          if (newCompetitionId && newCompetitionId !== "all") {
            url.searchParams.set("comp", newCompetitionId);
          } else {
            url.searchParams.delete("comp");
          }
          window.history.replaceState(null, "", url.toString());
        }
      } catch {
        // Ignorar errores de escritura en localStorage
      }
    },
    [setFilter]
  );

  // Si el usuario busca explícitamente por texto o fecha puntual se incluyen pasados; de lo contrario se usan partidos vigentes
  const basePool = React.useMemo(() => {
    if (filters.search || filters.dateIso) return matches;
    return activePool;
  }, [matches, activePool, filters.search, filters.dateIso]);

  const hasSearchFilters = Boolean(filters.search || filters.dateIso || (filters.competitionId && filters.competitionId !== "all"));

  const filtered = React.useMemo(() => {
    let result = filterMatches(basePool, filters, resolveTeamName);
    if (filters.competitionId && filters.competitionId !== "all") {
      result = result.filter((m) => m.competitionId === filters.competitionId);
    }
    return result;
  }, [basePool, filters, resolveTeamName]);

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
    <div className="space-y-4">
      {availableCompetitions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/20 p-2 text-xs">
          <span className="mr-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Competiciones activas:</span>
          <Button
            type="button"
            variant={filters.competitionId === "all" ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-7 text-xs font-semibold transition-all",
              filters.competitionId === "all" && "bg-brand-green text-brand-dark font-bold hover:bg-brand-green/90"
            )}
            onClick={() => handleCompetitionChange("all")}
          >
            Todas ({activePool.length})
          </Button>
          {availableCompetitions.map((comp) => (
            <Button
              key={comp.id}
              type="button"
              variant={filters.competitionId === comp.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-xs transition-all",
                filters.competitionId === comp.id
                  ? "bg-brand-green text-brand-dark font-bold hover:bg-brand-green/90"
                  : "hover:border-brand-green/30"
              )}
              onClick={() => handleCompetitionChange(comp.id)}
            >
              {comp.shortName} ({comp.count})
            </Button>
          ))}
        </div>
      )}

      <FilterBar activeCount={activeCount}>
        <div className="relative w-full sm:w-52">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Buscar equipo…"
            className="pl-8"
          />
        </div>
        <div className="w-full sm:w-44">
          <CompetitionSelector
            value={filters.competitionId}
            onChange={(v) => handleCompetitionChange(v)}
            options={availableCompetitions}
            includeAllOption
          />
        </div>
        <div className="flex w-full items-center gap-1.5 sm:w-44">
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
        <div className="w-full sm:w-56">
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
