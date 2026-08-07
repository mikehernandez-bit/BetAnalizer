import { ChartContainer } from "@/components/shared/chart-container";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarComparisonChart } from "@/components/charts/bar-comparison-chart";
import {
  getConfidenceTrendChart,
  getMarketDistributionChart,
  getPatternsByCategoryChart,
  getWeeklyPerformanceChart,
} from "@/services/dashboard-service";

export function DashboardCharts() {
  const weeklyPerformance = getWeeklyPerformanceChart();
  const marketDistribution = getMarketDistributionChart();
  const patternsByCategory = getPatternsByCategoryChart();
  const confidenceTrend = getConfidenceTrendChart();

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartContainer title="Rendimiento de recomendaciones por semana" description="% de análisis acertados sobre los decididos">
        <TrendLineChart data={weeklyPerformance} primaryName="Acierto" color="#22C55E" />
      </ChartContainer>
      <ChartContainer title="Distribución de mercados analizados" description="Categorías más frecuentes en tu historial">
        <DonutChart data={marketDistribution} />
      </ChartContainer>
      <ChartContainer title="Patrones por categoría" description="Detectados en los partidos destacados de hoy">
        <BarComparisonChart data={patternsByCategory} xKey="category" seriesA={{ key: "count", name: "Patrones", color: "#3B82F6" }} horizontal />
      </ChartContainer>
      <ChartContainer title="Historial de confianza promedio" description="Confianza promedio de tus análisis por semana">
        <TrendLineChart data={confidenceTrend} primaryName="Confianza" color="#F59E0B" />
      </ChartContainer>
    </section>
  );
}
