import { notFound } from "next/navigation";
import { LayoutGrid, Shield, Swords, Users2, Shuffle, Gauge, Target, Star, ShieldAlert } from "lucide-react";
import { resolveAnalysisById } from "@/services/analysis-service";
import { getTeamById } from "@/data/teams";
import { AnalysisHeader } from "@/components/analysis/analysis-header";
import { MatchResultPrediction } from "@/components/analysis/match-result-prediction";
import { AnalysisTabs, AnalysisTabDef } from "@/components/analysis/analysis-tabs";
import { PerfectPatternsSummary } from "@/components/analysis/perfect-patterns-summary";
import { ResumenTab } from "@/components/analysis/tabs/resumen-tab";
import { TeamTab } from "@/components/analysis/tabs/team-tab";
import { H2HTab } from "@/components/analysis/tabs/h2h-tab";
import { CommonOpponentsTab } from "@/components/analysis/tabs/common-opponents-tab";
import { CrossPatternsTab } from "@/components/analysis/tabs/cross-patterns-tab";
import { RangesTab } from "@/components/analysis/tabs/ranges-tab";
import { MarketsTab } from "@/components/analysis/tabs/markets-tab";
import { BestBetTab } from "@/components/analysis/tabs/best-bet-tab";
import { RisksTab } from "@/components/analysis/tabs/risks-tab";

import { BackToAnalysesButton } from "@/components/analysis/back-to-analyses-button";

export default async function AnalysisDetailPage(props: PageProps<"/analisis/[id]">) {
  const { id } = await props.params;
  const analysis = resolveAnalysisById(id);
  if (!analysis) notFound();

  const home = getTeamById(analysis.match.homeTeamId);
  const away = getTeamById(analysis.match.awayTeamId);
  if (!home || !away) notFound();

  const matchLabel = `${home.shortName} vs ${away.shortName}`;
  const iconCls = "size-3.5";
  const tabs: AnalysisTabDef[] = [
    { value: "resumen", label: "Resumen", icon: <LayoutGrid className={iconCls} />, content: <ResumenTab analysis={analysis} /> },
    {
      value: "local",
      label: `Local (${home.shortName})`,
      icon: <Shield className={iconCls} />,
      content: <TeamTab team={home} form={analysis.homeForm} patterns={analysis.homePatterns} side="home" matchCompetitionId={analysis.match.competitionId} />,
    },
    {
      value: "visitante",
      label: `Visitante (${away.shortName})`,
      icon: <Shield className={iconCls} />,
      content: <TeamTab team={away} form={analysis.awayForm} patterns={analysis.awayPatterns} side="away" matchCompetitionId={analysis.match.competitionId} />,
    },
    { value: "h2h", label: "Enfrentamientos directos", icon: <Swords className={iconCls} />, content: <H2HTab headToHead={analysis.headToHead} teamA={home} teamB={away} /> },
    { value: "comunes", label: "Rivales en común", icon: <Users2 className={iconCls} />, content: <CommonOpponentsTab data={analysis.commonOpponents} teamA={home} teamB={away} /> },
    { value: "cruzados", label: "Patrones cruzados", icon: <Shuffle className={iconCls} />, content: <CrossPatternsTab patterns={analysis.crossPatterns} /> },
    { value: "rangos", label: "Rangos", icon: <Gauge className={iconCls} />, content: <RangesTab analysis={analysis} home={home} away={away} /> },
    { value: "mercados", label: "Mercados", icon: <Target className={iconCls} />, content: <MarketsTab markets={analysis.markets} matchLabel={matchLabel} /> },
    { value: "mejor-bet", label: "Mejor Bet", icon: <Star className={iconCls} />, content: <BestBetTab analysis={analysis} /> },
    { value: "riesgos", label: "Riesgos", icon: <ShieldAlert className={iconCls} />, content: <RisksTab analysis={analysis} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <BackToAnalysesButton />
      </div>
      <AnalysisHeader analysis={analysis} />
      <MatchResultPrediction markets={analysis.markets} home={home} away={away} />
      <PerfectPatternsSummary analysis={analysis} home={home} away={away} />
      <AnalysisTabs tabs={tabs} defaultValue="resumen" />
    </div>
  );
}
