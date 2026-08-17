"use client";

import * as React from "react";
import { TeamMatchRecord } from "@/types";
import { computeFiveParameters, FiveParametersResult } from "@/utils/market-predicates";
import { cn } from "@/lib/utils";

interface MarketFiveParametersTableProps {
  marketId: string;
  homeRecords: TeamMatchRecord[];
  awayRecords: TeamMatchRecord[];
  homeTeamName?: string;
  awayTeamName?: string;
  className?: string;
  compact?: boolean;
}

function PctBadge({ pct, hits, total, compact = false }: { pct: number; hits?: number; total?: number; compact?: boolean }) {
  const isHigh = pct >= 75;
  const isMid = pct >= 50 && pct < 75;

  return (
    <div className={cn("flex items-baseline font-mono", compact ? "gap-1" : "gap-1.5")}>
      <span
        className={cn(
          compact ? "text-[13px] font-black tracking-tight" : "text-base font-black tracking-tight",
          isHigh && "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]",
          isMid && "text-cyan-400",
          !isHigh && !isMid && "text-amber-400"
        )}
      >
        {pct}%
      </span>
      {hits !== undefined && total !== undefined && (
        <span className={cn("font-medium text-slate-400", compact ? "text-[10px]" : "text-[11px]")}>
          ({hits}/{total})
        </span>
      )}
    </div>
  );
}

export function MarketFiveParametersTable({
  marketId,
  homeRecords,
  awayRecords,
  homeTeamName = "Local",
  awayTeamName = "Visitante",
  className,
  compact = false,
}: MarketFiveParametersTableProps) {
  const params: FiveParametersResult = React.useMemo(() => {
    return computeFiveParameters(marketId, homeRecords, awayRecords, homeTeamName, awayTeamName);
  }, [marketId, homeRecords, awayRecords, homeTeamName, awayTeamName]);

  return (
    <div className={cn("border border-slate-800 bg-slate-950/80 text-xs shadow-inner", compact ? "space-y-1 rounded-md p-1.5" : "space-y-2 rounded-xl p-3", className)}>
      <div className={cn("flex items-center justify-between border-b border-slate-800/80", compact ? "mb-0 pb-0.5" : "mb-1 pb-1.5")}>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          📐 Desglose de 5 Parámetros del Mercado
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Ponderación Muestra</span>
      </div>

      <div className={cn("market-parameter-grid grid grid-cols-1 sm:grid-cols-2", compact ? "gap-1" : "gap-2")}>
        {/* Parámetro 1: Local en Casa */}
        <div className={cn("flex items-center justify-between bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors", compact ? "rounded-sm p-1" : "rounded-lg p-2")}>
          <span className={cn("truncate text-slate-300 font-medium", compact && "text-[10px]")}>{params.param1HomeVenue.label}</span>
          <PctBadge
            pct={params.param1HomeVenue.pct}
            hits={params.param1HomeVenue.hits}
            total={params.param1HomeVenue.total}
            compact={compact}
          />
        </div>

        {/* Parámetro 2: Visitante Fuera */}
        <div className={cn("flex items-center justify-between bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors", compact ? "rounded-sm p-1" : "rounded-lg p-2")}>
          <span className={cn("truncate text-slate-300 font-medium", compact && "text-[10px]")}>{params.param2AwayVenue.label}</span>
          <PctBadge
            pct={params.param2AwayVenue.pct}
            hits={params.param2AwayVenue.hits}
            total={params.param2AwayVenue.total}
            compact={compact}
          />
        </div>

        {/* Parámetro 3: Local Total */}
        <div className={cn("flex items-center justify-between bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors", compact ? "rounded-sm p-1" : "rounded-lg p-2")}>
          <span className={cn("truncate text-slate-300 font-medium", compact && "text-[10px]")}>{params.param3HomeTotal.label}</span>
          <PctBadge
            pct={params.param3HomeTotal.pct}
            hits={params.param3HomeTotal.hits}
            total={params.param3HomeTotal.total}
            compact={compact}
          />
        </div>

        {/* Parámetro 4: Visitante Total */}
        <div className={cn("flex items-center justify-between bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors", compact ? "rounded-sm p-1" : "rounded-lg p-2")}>
          <span className={cn("truncate text-slate-300 font-medium", compact && "text-[10px]")}>{params.param4AwayTotal.label}</span>
          <PctBadge
            pct={params.param4AwayTotal.pct}
            hits={params.param4AwayTotal.hits}
            total={params.param4AwayTotal.total}
            compact={compact}
          />
        </div>

        {/* Parámetro 5: H2H Directo / Rivales Comunes */}
        <div className={cn("flex min-w-0 flex-wrap items-center justify-between bg-emerald-950/20 border border-emerald-500/20", compact ? "gap-1 rounded-sm p-1" : "gap-2 rounded-lg p-2")}>
        <span className={cn("truncate font-semibold text-emerald-300", compact && "text-[10px]")}>{params.param5H2HOrCommon.label}</span>
        {params.param5H2HOrCommon.hasData && params.param5H2HOrCommon.pct !== undefined ? (
          <PctBadge
            pct={params.param5H2HOrCommon.pct}
            hits={params.param5H2HOrCommon.hits}
            total={params.param5H2HOrCommon.total}
            compact={compact}
          />
        ) : (
          <span className={cn("text-slate-400 italic", compact ? "text-[10px]" : "text-[11px]")}>{params.param5H2HOrCommon.text}</span>
        )}
        </div>
      </div>
    </div>
  );
}
