"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ClipboardX } from "lucide-react";
import { SavedAnalysis } from "@/types";
import { getTeamById } from "@/data/teams";
import { useFilters } from "@/hooks/use-filters";
import { filterSavedAnalyses } from "@/utils/filters";
import { FilterBar } from "@/components/shared/filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateShort, formatOdds } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<SavedAnalysis["status"], string> = {
  ganada: "border-brand-green/25 bg-brand-green/10 text-brand-green-bright",
  perdida: "border-brand-red/25 bg-brand-red/10 text-brand-red",
  pendiente: "border-brand-blue/25 bg-brand-blue/10 text-brand-blue",
  anulada: "border-border bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<SavedAnalysis["status"], string> = {
  ganada: "Ganada",
  perdida: "Perdida",
  pendiente: "Pendiente",
  anulada: "Anulada",
};

export function HistoryExplorer({ items }: { items: SavedAnalysis[] }) {
  const { filters, setFilter, activeCount } = useFilters({ status: "all" as SavedAnalysis["status"] | "all", search: "" });
  const resolveTeamName = React.useCallback((id: string) => getTeamById(id)?.name ?? "", []);
  const filtered = React.useMemo(
    () => filterSavedAnalyses(items, { status: filters.status === "all" ? undefined : filters.status, search: filters.search }, resolveTeamName),
    [items, filters, resolveTeamName]
  );

  return (
    <div className="space-y-4">
      <FilterBar activeCount={activeCount}>
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={filters.search} onChange={(e) => setFilter("search", e.target.value)} placeholder="Buscar partido o mercado…" className="pl-8" />
        </div>
        <div className="w-full sm:w-44">
          <Select value={filters.status} onValueChange={(v) => setFilter("status", v as SavedAnalysis["status"] | "all")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardX} title="Sin resultados" description="Ajusta los filtros para ver más análisis." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Partido</TableHead>
                <TableHead>Recomendación</TableHead>
                <TableHead>Confianza</TableHead>
                <TableHead>Cuota</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const home = getTeamById(item.homeTeamId);
                const away = getTeamById(item.awayTeamId);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(item.date)}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {home?.shortName} vs {away?.shortName}
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-muted-foreground">{item.recommendedMarket}</TableCell>
                    <TableCell className="tabular-nums">{item.confidence}%</TableCell>
                    <TableCell className="tabular-nums">{formatOdds(item.odds)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLE[item.status])}>
                        {STATUS_LABEL[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-xs text-muted-foreground">{item.result ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/analisis/${item.analysisId}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
