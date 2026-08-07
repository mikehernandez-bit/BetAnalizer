import Link from "next/link";
import { Layers } from "lucide-react";
import { HighlightMarket } from "@/services/dashboard-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RISK_LEVEL_COLOR, RISK_LEVEL_LABEL } from "@/lib/labels";
import { formatOdds, pluralize } from "@/utils/formatters";
import { cn } from "@/lib/utils";

export function HighlightPatternCard({ highlight }: { highlight: HighlightMarket }) {
  const { evaluation } = highlight;
  return (
    <Link href={`/analisis/${highlight.analysisId}`}>
      <Card className="h-full transition-colors hover:border-brand-green/30">
        <CardContent className="space-y-3">
          <p className="truncate text-xs font-medium text-muted-foreground">{highlight.matchLabel}</p>
          <p className="text-sm font-semibold text-foreground">{evaluation.market.name}</p>

          <div className="flex items-center gap-3">
            <Progress value={evaluation.confidence} className="h-2 flex-1" />
            <span className="text-sm font-bold tabular-nums text-brand-green-bright">{evaluation.confidence}%</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px]", RISK_LEVEL_COLOR[evaluation.riskLevel])}>
              {RISK_LEVEL_LABEL[evaluation.riskLevel]}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              Cuota {evaluation.odds ? formatOdds(evaluation.odds.decimalOdds) : "—"}
            </Badge>
            <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
              <Layers className="size-3" /> {highlight.matchingPatterns} {pluralize(highlight.matchingPatterns, "coincidencia", "coincidencias")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
