import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ComparisonStatCardProps {
  label: string;
  valueA: number;
  valueB: number;
  teamAName: string;
  teamBName: string;
  suffix?: string;
  higherIsBetter?: boolean;
  decimals?: number;
}

export function ComparisonStatCard({
  label,
  valueA,
  valueB,
  teamAName,
  teamBName,
  suffix = "",
  higherIsBetter = true,
  decimals = 1,
}: ComparisonStatCardProps) {
  const max = Math.max(valueA, valueB, 0.01);
  const pctA = Math.max(4, (valueA / max) * 100);
  const pctB = Math.max(4, (valueB / max) * 100);
  const diff = Math.round((valueA - valueB) * 10) / 10;
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;

  return (
    <Card>
      <CardContent className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="text-right">
            <span className={cn("text-lg font-bold tabular-nums", aWins && "text-brand-green-bright")}>
              {valueA.toFixed(decimals)}
              {suffix}
            </span>
          </div>
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">vs</span>
          <div className="text-left">
            <span className={cn("text-lg font-bold tabular-nums", bWins && "text-brand-green-bright")}>
              {valueB.toFixed(decimals)}
              {suffix}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="ml-auto h-1.5 w-1/2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full ml-auto", aWins ? "bg-brand-green" : "bg-border")}
              style={{ width: `${pctA}%` }}
            />
          </div>
          <div className="h-1.5 w-1/2 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", bWins ? "bg-brand-green" : "bg-border")} style={{ width: `${pctB}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="truncate">{teamAName}</span>
          <span className={cn("font-medium", diff === 0 ? "text-muted-foreground" : diff > 0 ? "text-brand-green" : "text-brand-red")}>
            {diff > 0 ? "+" : ""}
            {diff.toFixed(decimals)} dif.
          </span>
          <span className="truncate text-right">{teamBName}</span>
        </div>
      </CardContent>
    </Card>
  );
}
