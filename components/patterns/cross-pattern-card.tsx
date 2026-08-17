import { ArrowRight, AlertTriangle } from "lucide-react";
import { CrossPattern } from "@/types";
import { getTeamById } from "@/data/teams";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CROSS_PATTERN_STRENGTH_COLOR, CROSS_PATTERN_STRENGTH_LABEL } from "@/lib/labels";
import { MARKET_CATEGORY_LABELS } from "@/data/markets";
import { cn } from "@/lib/utils";
import { DownloadCardButton } from "@/components/shared/download-card-button";

export function CrossPatternCard({ pattern }: { pattern: CrossPattern }) {
  const teamA = getTeamById(pattern.teamAId);
  const teamB = getTeamById(pattern.teamBId);
  const isContradiction = pattern.strength === "contradictorio";
  const combinedHits = pattern.teamAStat.hits + pattern.teamBStat.hits;
  const combinedTotal = pattern.teamAStat.total + pattern.teamBStat.total;

  return (
    <Card className={cn("card-download-target overflow-hidden", isContradiction && "border-brand-red/25")}>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center gap-1 rounded-md border border-brand-green/30 bg-brand-green/10 px-2 py-0.5 text-[11px] font-bold text-brand-green-bright shadow-sm">
              <span>⚔️</span>
              <span>{teamA?.shortName ?? "Local"} vs {teamB?.shortName ?? "Visitante"}</span>
            </div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              {MARKET_CATEGORY_LABELS[pattern.category] ?? pattern.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn("gap-1 text-[10px]", CROSS_PATTERN_STRENGTH_COLOR[pattern.strength])}>
              {isContradiction && <AlertTriangle className="size-3" />}
              {CROSS_PATTERN_STRENGTH_LABEL[pattern.strength]}
            </Badge>
            <DownloadCardButton filename={`cruce_${pattern.id}`} />
          </div>
        </div>

        <p className="text-sm font-semibold text-foreground">{pattern.marketLabel}</p>

        <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3">
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-xs font-medium text-muted-foreground">{teamA?.shortName}</p>
            <p className="mt-1 text-2xl font-black tabular-nums text-brand-green-bright">
              {pattern.teamAStat.hits}
              <span className="px-1 text-sm font-semibold text-muted-foreground">de</span>
              {pattern.teamAStat.total}
            </p>
            <p className="text-xs font-semibold tabular-nums text-foreground">{pattern.teamAStat.percentage}%</p>
            <p className="text-[10px] text-muted-foreground">{pattern.teamAStat.description}</p>
          </div>
          <ArrowRight className={cn("size-4 shrink-0", isContradiction ? "text-brand-red" : "text-brand-green")} />
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-xs font-medium text-muted-foreground">{teamB?.shortName}</p>
            <p className="mt-1 text-2xl font-black tabular-nums text-brand-green-bright">
              {pattern.teamBStat.hits}
              <span className="px-1 text-sm font-semibold text-muted-foreground">de</span>
              {pattern.teamBStat.total}
            </p>
            <p className="text-xs font-semibold tabular-nums text-foreground">{pattern.teamBStat.percentage}%</p>
            <p className="text-[10px] text-muted-foreground">{pattern.teamBStat.description}</p>
          </div>
        </div>

        <p className={cn("text-xs leading-relaxed", isContradiction ? "text-brand-red" : "text-muted-foreground")}>
          {pattern.conclusion}
        </p>

        {pattern.risks.length > 0 && (
          <ul className="space-y-1 text-[11px] text-muted-foreground">
            {pattern.risks.map((risk, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-brand-yellow">•</span> {risk}
              </li>
            ))}
          </ul>
        )}

        <div className="pt-1">
          <span className="text-xs text-muted-foreground">
            Coincidencia total <span className="font-semibold text-foreground">{combinedHits} de {combinedTotal}</span> · <span className="font-semibold text-foreground">{pattern.combinedConfidence}%</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
