import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { SummaryStats } from "@/components/dashboard/summary-stats";
import { FeaturedMatchesSection } from "@/components/dashboard/featured-matches-section";
import { TopPatternsSection } from "@/components/dashboard/top-patterns-section";
import { RecentAnalysesTable } from "@/components/dashboard/recent-analyses-table";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { getFeaturedMatches } from "@/services/match-service";
import { getDashboardSummary, getTopHighlightMarkets } from "@/services/dashboard-service";
import { getRecentSavedAnalyses } from "@/data/analyses";

export default function Home() {
  const featuredMatches = getFeaturedMatches(6);
  const summary = getDashboardSummary();
  const highlights = getTopHighlightMarkets(4);
  const recentAnalyses = getRecentSavedAnalyses(6);

  return (
    <div className="space-y-10">
      <DashboardHero />
      <SummaryStats summary={summary} />
      <FeaturedMatchesSection matches={featuredMatches} />
      <TopPatternsSection highlights={highlights} />
      <RecentAnalysesTable items={recentAnalyses} />
      <DashboardCharts />
    </div>
  );
}
