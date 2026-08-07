"use client";

import * as React from "react";
import { MarketEvaluation } from "@/types";
import { MARKET_CATEGORY_LABELS } from "@/data/markets";
import { filterMarketsByCategory, MarketSortKey, sortMarkets } from "@/utils/filters";
import { MarketCard } from "@/components/markets/market-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";

const CATEGORIES = ["all", "goles", "corners", "tiros_arco", "remates", "resultado", "ambos_marcan", "primera_parte"];

const SORT_OPTIONS: { key: MarketSortKey; label: string }[] = [
  { key: "confidence", label: "Mayor confianza" },
  { key: "risk", label: "Menor riesgo" },
  { key: "odds", label: "Mejor cuota" },
  { key: "value", label: "Mayor valor" },
];

export function MarketsBrowser({ markets, initialCategory }: { markets: MarketEvaluation[]; initialCategory?: string }) {
  const [category, setCategory] = React.useState(initialCategory ?? "all");
  const [sortKey, setSortKey] = React.useState<MarketSortKey>("confidence");

  const filtered = React.useMemo(() => sortMarkets(filterMarketsByCategory(markets, category), sortKey), [markets, category, sortKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? "secondary" : "outline"}
              onClick={() => setCategory(cat)}
              className={cn(category === cat && "border-brand-green/30 text-brand-green-bright")}
            >
              {cat === "all" ? "Todos" : MARKET_CATEGORY_LABELS[cat]}
            </Button>
          ))}
        </div>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as MarketSortKey)}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Target} title="No hay mercados en esta categoría" description="Prueba con otra categoría o cambia el orden." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((evaluation) => (
            <MarketCard key={evaluation.id} evaluation={evaluation} />
          ))}
        </div>
      )}
    </div>
  );
}
