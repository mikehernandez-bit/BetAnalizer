import { AnalysisResult } from "@/types";
import { getTeamById } from "@/data/teams";
import { Card, CardContent } from "@/components/ui/card";
import { RiskCard } from "@/components/markets/risk-card";
import { DATA_QUALITY_LABEL } from "@/lib/labels";
import { AlertTriangle, Database, ShieldAlert } from "lucide-react";

export function RisksTab({ analysis }: { analysis: AnalysisResult }) {
  const home = getTeamById(analysis.match.homeTeamId);
  const away = getTeamById(analysis.match.awayTeamId);
  const matchLabel = `${home?.shortName ?? "Local"} vs ${away?.shortName ?? "Visitante"}`;
  const contradictoryPatterns = analysis.crossPatterns.filter((p) => p.strength === "contradictorio");

  return (
    <div className="space-y-6">
      <Card className="border-brand-yellow/25 bg-brand-yellow/5">
        <CardContent className="flex gap-3">
          <Database className="mt-0.5 size-5 shrink-0 text-brand-yellow" />
          <div>
            <p className="text-sm font-semibold text-foreground">{DATA_QUALITY_LABEL[analysis.dataQuality]}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Este análisis se construyó con {analysis.matchesAnalyzed} partidos por equipo. Una muestra más amplia
              incrementa la fiabilidad estadística de las estimaciones.
            </p>
          </div>
        </CardContent>
      </Card>

      {contradictoryPatterns.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-brand-red">
            <AlertTriangle className="size-4" /> Contradicciones detectadas
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {contradictoryPatterns.map((p) => (
              <Card key={p.id} className="border-brand-red/25 bg-brand-red/5">
                <CardContent className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{p.marketLabel}</p>
                  <p className="mt-1">{p.conclusion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ShieldAlert className="size-4 text-brand-red" /> Mercados con mayor riesgo
        </h3>
        {analysis.avoid.length === 0 ? (
          <p className="text-sm text-muted-foreground">No se identificaron mercados de alto riesgo en esta muestra.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {analysis.avoid.map((evaluation) => (
              <RiskCard key={evaluation.id} evaluation={evaluation} matchLabel={matchLabel} />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        BetAnalyzer ofrece análisis estadísticos con fines informativos. Las tendencias históricas no garantizan
        resultados futuros. Apuesta de forma responsable.
      </p>
    </div>
  );
}
