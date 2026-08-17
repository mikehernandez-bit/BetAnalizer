"use client";

import * as React from "react";
import { MarketEvaluation } from "@/types";
import { MARKET_CATEGORY_LABELS } from "@/data/markets";
import {
  CONFIDENCE_RANGE_OPTIONS,
  filterMarketsByCategory,
  filterMarketsByConfidenceRange,
  MarketSortKey,
  sortMarkets,
} from "@/utils/filters";
import { MarketCard } from "@/components/markets/market-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

const CATEGORIES = ["all", "goles", "corners", "tarjetas", "resultado", "ambos_marcan", "primera_parte", "segunda_parte", "equipo_local", "equipo_visitante"];

const SORT_OPTIONS: { key: MarketSortKey; label: string }[] = [
  { key: "confidence", label: "Mayor confianza" },
  { key: "risk", label: "Menor riesgo" },
  { key: "odds", label: "Mejor cuota" },
  { key: "value", label: "Mayor valor" },
];

export function MarketsBrowser({ markets, initialCategory, matchLabel }: { markets: MarketEvaluation[]; initialCategory?: string; matchLabel?: string }) {
  const [category, setCategory] = React.useState(initialCategory ?? "all");
  const [sortKey, setSortKey] = React.useState<MarketSortKey>("confidence");
  const [rangeId, setRangeId] = React.useState("all");

  const selectedRange = React.useMemo(
    () => CONFIDENCE_RANGE_OPTIONS.find((range) => range.id === rangeId) ?? CONFIDENCE_RANGE_OPTIONS[0],
    [rangeId]
  );

  const filtered = React.useMemo(() => {
    const categorized = filterMarketsByCategory(markets, category);
    return sortMarkets(filterMarketsByConfidenceRange(categorized, selectedRange.min, selectedRange.max), sortKey);
  }, [markets, category, selectedRange, sortKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              className={cn("text-xs", category === cat && "bg-brand-green font-semibold text-brand-dark hover:bg-brand-green/90")}
              onClick={() => setCategory(cat)}
            >
              {cat === "all" ? "Todos los mercados" : MARKET_CATEGORY_LABELS[cat] ?? cat}
            </Button>
          ))}
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Select value={rangeId} onValueChange={setRangeId}>
            <SelectTrigger className="w-full text-xs sm:w-[170px]"><SelectValue placeholder="Rango de confianza" /></SelectTrigger>
            <SelectContent>
              {CONFIDENCE_RANGE_OPTIONS.map((range) => <SelectItem key={range.id} value={range.id} className="text-xs">{range.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortKey} onValueChange={(value) => setSortKey(value as MarketSortKey)}>
            <SelectTrigger className="w-full text-xs sm:w-[160px]"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => <SelectItem key={option.key} value={option.key} className="text-xs">{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Target} title="No hay mercados que cumplan estos filtros" description="Prueba con otra categoría, bajá el % mínimo de acierto, o cambiá el orden." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((evaluation) => <MarketCard key={evaluation.id} evaluation={evaluation} matchLabel={matchLabel} />)}
        </div>
      )}
    </div>
  );
}
