import { ShieldAlert } from "lucide-react";
import { MarketEvaluation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatOdds } from "@/utils/formatters";
import { DownloadCardButton } from "@/components/shared/download-card-button";

function buildReasons(evaluation: MarketEvaluation): string[] {
  const reasons: string[] = [];
  if (evaluation.confidence < 60) reasons.push(`Confianza estadística baja (${evaluation.confidence}%).`);
  if (evaluation.sampleSize < 6) reasons.push("La muestra de partidos analizados es insuficiente.");
  if (evaluation.contradictions.length > 0) reasons.push(...evaluation.contradictions);
  if (evaluation.valueLevel === "sin_valor") reasons.push("La cuota no ofrece valor frente a la estimación estadística.");
  if (reasons.length === 0) reasons.push("Depende en exceso de un único dato para sostener la recomendación.");
  return reasons.slice(0, 3);
}

export function RiskCard({ evaluation, matchLabel }: { evaluation: MarketEvaluation; matchLabel?: string }) {
  return (
    <Card className="card-download-target border-brand-red/25 bg-brand-red/5">
      <CardContent className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brand-red" />
            <div className="space-y-1">
              {matchLabel && (
                <div className="inline-flex items-center gap-1 rounded-md border border-brand-red/30 bg-brand-red/10 px-2 py-0.5 text-[11px] font-bold text-brand-red shadow-sm">
                  <span>⚔️</span>
                  <span>{matchLabel}</span>
                </div>
              )}
              <p className="text-sm font-semibold text-foreground">{evaluation.market.name}</p>
              <p className="text-xs text-muted-foreground">
                Confianza {evaluation.confidence}% · Cuota {evaluation.odds ? formatOdds(evaluation.odds.decimalOdds) : "—"}
              </p>
            </div>
          </div>
          <DownloadCardButton filename={`riesgo_${evaluation.market.id}`} />
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {buildReasons(evaluation).map((reason, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-brand-red">•</span> {reason}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
