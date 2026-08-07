import { Gauge } from "lucide-react";
import { AnalysisResult, Team } from "@/types";
import { computeExtremeTeamPatterns, computeExtremeCrossPatterns } from "@/utils/statistics";
import { PatternCard } from "@/components/patterns/pattern-card";
import { CrossPatternCard } from "@/components/patterns/cross-pattern-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";

interface RangesTabProps {
  analysis: AnalysisResult;
  home: Team;
  away: Team;
}

export function RangesTab({ analysis, home, away }: RangesTabProps) {
  const homeExtremes = computeExtremeTeamPatterns(home.id, analysis.homeForm.matches);
  const awayExtremes = computeExtremeTeamPatterns(away.id, analysis.awayForm.matches);
  const crossExtremes = computeExtremeCrossPatterns(home.id, analysis.homeForm.matches, away.id, analysis.awayForm.matches);

  const isEmpty = homeExtremes.length === 0 && awayExtremes.length === 0 && crossExtremes.length === 0;

  return (
    <div className="space-y-6">
      <Card className="border-brand-green/20 bg-brand-green/5">
        <CardContent className="flex gap-3">
          <Gauge className="mt-0.5 size-5 shrink-0 text-brand-green" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">¿Qué es esto?</p>
            <p className="mt-1 leading-relaxed">
              No son umbrales fijos como en &ldquo;Patrones&rdquo;: para cada estadística se busca el <strong>máximo y el
              mínimo que realmente ocurrió</strong> en la muestra reciente de cada equipo. &ldquo;Techo&rdquo; significa que
              ese partido nunca tuvo más que el valor indicado; &ldquo;piso&rdquo;, que nunca tuvo menos. Al salir
              directamente del dato real, siempre muestran 100% de cumplimiento — la fuerza (débil/moderado/fuerte/muy
              fuerte) ya está ajustada según cuántos partidos hay detrás, para no sobrevender un extremo visto en solo 4 o 5
              encuentros.
            </p>
          </div>
        </CardContent>
      </Card>

      {isEmpty ? (
        <EmptyState
          icon={Gauge}
          title="Sin rangos suficientes"
          description="Se necesitan al menos 4 partidos por equipo para calcular techos y pisos reales."
        />
      ) : (
        <>
          {crossExtremes.length > 0 && (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Rangos combinados — {home.shortName} + {away.shortName}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {crossExtremes.map((pattern) => (
                  <CrossPatternCard key={pattern.id} pattern={pattern} />
                ))}
              </div>
            </section>
          )}

          {homeExtremes.length > 0 && (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Rangos de {home.name}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {homeExtremes.map((pattern) => (
                  <PatternCard key={pattern.id} pattern={pattern} records={analysis.homeForm.matches} />
                ))}
              </div>
            </section>
          )}

          {awayExtremes.length > 0 && (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Rangos de {away.name}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {awayExtremes.map((pattern) => (
                  <PatternCard key={pattern.id} pattern={pattern} records={analysis.awayForm.matches} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
