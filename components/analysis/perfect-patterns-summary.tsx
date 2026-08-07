import { AlertTriangle, BadgeCheck, Link2, ShieldCheck } from "lucide-react";
import { AnalysisResult, Pattern, Team } from "@/types";

const RELIABLE_SAMPLE_SIZE = 10;

interface PerfectPatternsSummaryProps {
  analysis: AnalysisResult;
  home: Team;
  away: Team;
}

function IndividualPatternList({ patterns }: { patterns: Pattern[] }) {
  if (patterns.length === 0) {
    return <p className="text-sm text-muted-foreground">Ningún patrón individual alcanzó el 100%.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {patterns.map((pattern) => (
        <div key={pattern.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <p className="text-sm leading-5 text-foreground">{pattern.title}</p>
          <span className="shrink-0 text-sm font-bold text-brand-green-bright">
            {pattern.hits}/{pattern.total}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PerfectPatternsSummary({ analysis, home, away }: PerfectPatternsSummaryProps) {
  const perfectCrosses = analysis.crossPatterns.filter(
    (pattern) => pattern.teamAStat.percentage === 100 && pattern.teamBStat.percentage === 100
  );
  const perfectHome = analysis.homePatterns.filter((pattern) => pattern.percentage === 100);
  const perfectAway = analysis.awayPatterns.filter((pattern) => pattern.percentage === 100);
  const totalPerfect = perfectCrosses.length + perfectHome.length + perfectAway.length;

  const sampleSizes = [
    ...perfectHome.map((p) => p.total),
    ...perfectAway.map((p) => p.total),
    ...perfectCrosses.flatMap((p) => [p.teamAStat.total, p.teamBStat.total]),
  ];
  const smallestSample = sampleSizes.length > 0 ? Math.min(...sampleSizes) : 0;
  const isVolatile = smallestSample > 0 && smallestSample < RELIABLE_SAMPLE_SIZE;

  return (
    <section className="overflow-hidden rounded-lg border border-brand-green/30 bg-brand-green/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-green/20 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/15 text-brand-green-bright">
            <BadgeCheck className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">Patrones cumplidos al 100%</h2>
            <p className="text-xs text-muted-foreground">Primero se muestran las señales sin fallos en la muestra disponible.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand-green-bright">{totalPerfect}</p>
          <p className="text-[11px] text-muted-foreground">patrones perfectos</p>
        </div>
      </div>

      {isVolatile && totalPerfect > 0 && (
        <div className="flex items-start gap-2 border-b border-brand-yellow/20 bg-brand-yellow/5 px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-brand-yellow" />
          <span>
            Algunas de estas cifras vienen de muestras menores a {RELIABLE_SAMPLE_SIZE} partidos: un solo resultado real
            puede cambiarlas por completo. Un 100% con pocos partidos no es una garantía.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <div className="p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Link2 className="size-4 text-brand-green-bright" /> Cruces de ambos equipos
          </h3>
          {perfectCrosses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ningún cruce alcanzó el 100%.</p>
          ) : (
            <div className="divide-y divide-border">
              {perfectCrosses.map((pattern) => (
                <div key={pattern.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{pattern.marketLabel}</p>
                    <span className="shrink-0 text-sm font-bold text-brand-green-bright">
                      {pattern.teamAStat.hits + pattern.teamBStat.hits}/{pattern.teamAStat.total + pattern.teamBStat.total}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {home.shortName} {pattern.teamAStat.hits}/{pattern.teamAStat.total} · {away.shortName}{" "}
                    {pattern.teamBStat.hits}/{pattern.teamBStat.total}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4 text-brand-blue" /> Equipo 1 · {home.shortName}
          </h3>
          <IndividualPatternList patterns={perfectHome} />
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4 text-brand-blue" /> Equipo 2 · {away.shortName}
          </h3>
          <IndividualPatternList patterns={perfectAway} />
        </div>
      </div>
    </section>
  );
}
