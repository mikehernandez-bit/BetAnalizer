import { AnalysisResult } from "@/types";
import { getTeamById } from "@/data/teams";
import { ComparisonStatCard } from "@/components/shared/comparison-stat-card";
import { ChartContainer } from "@/components/shared/chart-container";
import { RadarComparisonChart } from "@/components/charts/radar-comparison-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { PATTERN_TEMPLATES } from "@/utils/statistics";

function templatePct(records: AnalysisResult["homeForm"]["matches"], templateId: string): number {
  const tpl = PATTERN_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl || records.length === 0) return 0;
  return Math.round((records.filter(tpl.predicate).length / records.length) * 100);
}

export function ResumenTab({ analysis }: { analysis: AnalysisResult }) {
  const home = getTeamById(analysis.match.homeTeamId);
  const away = getTeamById(analysis.match.awayTeamId);
  if (!home || !away) return null;

  const hs = analysis.homeForm.stats;
  const as = analysis.awayForm.stats;

  const cleanSheetHome = templatePct(analysis.homeForm.matches, "clean_sheet");
  const cleanSheetAway = templatePct(analysis.awayForm.matches, "clean_sheet");
  const bttsHome = templatePct(analysis.homeForm.matches, "btts");
  const bttsAway = templatePct(analysis.awayForm.matches, "btts");
  const over25Home = templatePct(analysis.homeForm.matches, "match_over25");
  const over25Away = templatePct(analysis.awayForm.matches, "match_over25");

  const radarData = [
    { metric: "Ataque", teamA: analysis.radar.home.attack, teamB: analysis.radar.away.attack },
    { metric: "Defensa", teamA: analysis.radar.home.defense, teamB: analysis.radar.away.defense },
    { metric: "Goles", teamA: analysis.radar.home.goals, teamB: analysis.radar.away.goals },
    { metric: "Córners", teamA: analysis.radar.home.corners, teamB: analysis.radar.away.corners },
    { metric: "Remates", teamA: analysis.radar.home.shots, teamB: analysis.radar.away.shots },
    { metric: "Tiros al arco", teamA: analysis.radar.home.shotsOnTarget, teamB: analysis.radar.away.shotsOnTarget },
    { metric: "Forma", teamA: analysis.radar.home.form, teamB: analysis.radar.away.form },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ComparisonStatCard label="Goles por partido" valueA={hs.goalsFor.average} valueB={as.goalsFor.average} teamAName={home.shortName} teamBName={away.shortName} />
        <ComparisonStatCard label="Goles recibidos" valueA={hs.goalsAgainst.average} valueB={as.goalsAgainst.average} teamAName={home.shortName} teamBName={away.shortName} higherIsBetter={false} />
        <ComparisonStatCard label="Córners a favor" valueA={hs.cornersFor.average} valueB={as.cornersFor.average} teamAName={home.shortName} teamBName={away.shortName} />
        <ComparisonStatCard label="Córners en contra" valueA={hs.cornersAgainst.average} valueB={as.cornersAgainst.average} teamAName={home.shortName} teamBName={away.shortName} higherIsBetter={false} />
        <ComparisonStatCard label="Remates" valueA={hs.shotsFor.average} valueB={as.shotsFor.average} teamAName={home.shortName} teamBName={away.shortName} />
        <ComparisonStatCard label="Remates recibidos" valueA={hs.shotsAgainst.average} valueB={as.shotsAgainst.average} teamAName={home.shortName} teamBName={away.shortName} higherIsBetter={false} />
        <ComparisonStatCard label="Tiros al arco" valueA={hs.shotsOnTargetFor.average} valueB={as.shotsOnTargetFor.average} teamAName={home.shortName} teamBName={away.shortName} />
        <ComparisonStatCard label="Tiros al arco permitidos" valueA={hs.shotsOnTargetAgainst.average} valueB={as.shotsOnTargetAgainst.average} teamAName={home.shortName} teamBName={away.shortName} higherIsBetter={false} />
        <ComparisonStatCard label="Posesión" valueA={hs.possession.average} valueB={as.possession.average} teamAName={home.shortName} teamBName={away.shortName} suffix="%" decimals={0} />
        <ComparisonStatCard label="Partidos sin recibir goles" valueA={cleanSheetHome} valueB={cleanSheetAway} teamAName={home.shortName} teamBName={away.shortName} suffix="%" decimals={0} />
        <ComparisonStatCard label="Ambos equipos marcan" valueA={bttsHome} valueB={bttsAway} teamAName={home.shortName} teamBName={away.shortName} suffix="%" decimals={0} />
        <ComparisonStatCard label="Más de 2.5 goles" valueA={over25Home} valueB={over25Away} teamAName={home.shortName} teamBName={away.shortName} suffix="%" decimals={0} />
      </div>

      <ChartContainer title="Comparativa radar" description="Perfil estadístico normalizado de ambos equipos" height={340}>
        <RadarComparisonChart data={radarData} teamAName={home.shortName} teamBName={away.shortName} />
      </ChartContainer>

      <Card className="border-brand-green/20 bg-brand-green/5">
        <CardContent className="flex gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-brand-green" />
          <div>
            <p className="text-sm font-semibold text-foreground">Lectura rápida del partido</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{analysis.quickRead}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
