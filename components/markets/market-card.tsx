import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { MarketEvaluation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { ValueIndicator } from "@/components/shared/value-indicator";
import { RISK_LEVEL_COLOR, RISK_LEVEL_LABEL, DATA_QUALITY_LABEL } from "@/lib/labels";
import { formatOdds } from "@/utils/formatters";
import { cn } from "@/lib/utils";

const RECOMMENDATION_META = {
  recomendado: { label: "Recomendado", icon: CheckCircle2, className: "text-brand-green-bright" },
  evitar: { label: "Evitar", icon: XCircle, className: "text-brand-red" },
  sin_datos_suficientes: { label: "Datos insuficientes", icon: HelpCircle, className: "text-muted-foreground" },
} as const;

export function MarketCard({ evaluation }: { evaluation: MarketEvaluation }) {
  const rec = RECOMMENDATION_META[evaluation.recommendation];
  const RecIcon = rec.icon;

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{evaluation.market.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{evaluation.market.description}</p>
          </div>
          <span className={cn("flex shrink-0 items-center gap-1 text-xs font-medium", rec.className)}>
            <RecIcon className="size-3.5" /> {rec.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-xs sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Confianza</p>
            <p className="text-sm font-bold text-foreground">{evaluation.confidence}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cuota</p>
            <p className="text-sm font-bold text-foreground">{evaluation.odds ? formatOdds(evaluation.odds.decimalOdds) : "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Prob. implícita</p>
            <p className="text-sm font-bold text-foreground">{evaluation.odds?.impliedProbability.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Estim. BetAnalyzer</p>
            <p className="text-sm font-bold text-brand-green-bright">{evaluation.statisticalEstimate}%</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ConfidenceBadge level={evaluation.confidenceLevel} size="sm" />
          <Badge variant="outline" className={cn("text-[10px]", RISK_LEVEL_COLOR[evaluation.riskLevel])}>
            {RISK_LEVEL_LABEL[evaluation.riskLevel]}
          </Badge>
          {evaluation.valueLevel && <ValueIndicator level={evaluation.valueLevel} diff={evaluation.valueDifference} />}
        </div>

        {evaluation.positivePatterns.length > 0 && (
          <ul className="space-y-1 text-[11px] text-muted-foreground">
            {evaluation.positivePatterns.slice(0, 2).map((p, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-brand-green">✓</span> {p}
              </li>
            ))}
          </ul>
        )}
        {evaluation.contradictions.length > 0 && (
          <ul className="space-y-1 text-[11px] text-brand-red">
            {evaluation.contradictions.map((c, i) => (
              <li key={i} className="flex gap-1.5">
                <span>⚠</span> {c}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
          <span>{DATA_QUALITY_LABEL[evaluation.dataQuality]}</span>
          <span>{evaluation.sampleSize} partidos</span>
        </div>
      </CardContent>
    </Card>
  );
}
