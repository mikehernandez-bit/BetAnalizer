import { StatDistribution, StatKey } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { TREND_LABEL } from "@/lib/labels";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const TREND_ICON = { ascendente: TrendingUp, descendente: TrendingDown, estable: Minus };
const TREND_COLOR = { ascendente: "text-brand-green", descendente: "text-brand-red", estable: "text-muted-foreground" };

interface TeamStatSummaryProps {
  stats: Record<StatKey, StatDistribution>;
  keys: { key: StatKey; label: string }[];
}

export function TeamStatSummary({ stats, keys }: TeamStatSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {keys.map(({ key, label }) => {
        const stat = stats[key];
        const TrendIcon = TREND_ICON[stat.trend];
        return (
          <Card key={key}>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <span className={cn("flex items-center gap-1 text-[11px]", TREND_COLOR[stat.trend])} title={TREND_LABEL[stat.trend]}>
                  <TrendIcon className="size-3" />
                </span>
              </div>
              <p className="text-xl font-bold tabular-nums text-foreground">{stat.average}</p>
              <div className="grid grid-cols-3 gap-1 text-center text-[10px] text-muted-foreground">
                <span>
                  Med. <span className="block font-medium text-foreground">{stat.median}</span>
                </span>
                <span>
                  Máx. <span className="block font-medium text-foreground">{stat.max}</span>
                </span>
                <span>
                  Mín. <span className="block font-medium text-foreground">{stat.min}</span>
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Desv. reciente: {stat.stdDev}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
