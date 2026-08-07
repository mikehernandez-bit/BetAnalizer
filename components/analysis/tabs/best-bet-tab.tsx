import { AnalysisResult } from "@/types";
import { getTeamById } from "@/data/teams";
import { BestBetCard } from "@/components/markets/best-bet-card";
import { MarketCard } from "@/components/markets/market-card";
import { RiskCard } from "@/components/markets/risk-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ShieldAlert, ShieldOff } from "lucide-react";

export function BestBetTab({ analysis }: { analysis: AnalysisResult }) {
  const home = getTeamById(analysis.match.homeTeamId);
  const away = getTeamById(analysis.match.awayTeamId);
  const matchLabel = `${home?.shortName ?? "Local"} vs ${away?.shortName ?? "Visitante"}`;

  return (
    <div className="space-y-8">
      <section>
        {analysis.bestBet ? (
          <BestBetCard recommendation={analysis.bestBet} matchLabel={matchLabel} analysisId={analysis.id} />
        ) : (
          <EmptyState
            icon={ShieldOff}
            title="No existe una apuesta suficientemente respaldada por los datos disponibles"
            description="Ningún mercado alcanzó el umbral mínimo de confianza (60%) con la muestra analizada. Revisa la pestaña de Mercados para ver el detalle completo."
          />
        )}
      </section>

      {analysis.alternatives.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Apuestas alternativas</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {analysis.alternatives.map((rec) => (
              <MarketCard key={rec.id} evaluation={rec.marketEvaluation} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-brand-red">
          <ShieldAlert className="size-4" /> Apuestas a evitar
        </h3>
        {analysis.avoid.length === 0 ? (
          <p className="text-sm text-muted-foreground">No se identificaron mercados particularmente riesgosos en esta muestra.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {analysis.avoid.map((evaluation) => (
              <RiskCard key={evaluation.id} evaluation={evaluation} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
