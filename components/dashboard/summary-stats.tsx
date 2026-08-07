"use client";

import { CalendarCheck, ClipboardList, Sparkles, Target, TrendingUp, Bookmark } from "lucide-react";
import { DashboardSummary } from "@/types";
import { StatCard } from "@/components/shared/stat-card";
import { useFavorites } from "@/hooks/use-favorites";

export function SummaryStats({ summary }: { summary: DashboardSummary }) {
  const { byType } = useFavorites();
  const savedMarkets = byType("market").length;

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard icon={CalendarCheck} label="Partidos hoy" value={String(summary.matchesToday)} accent="blue" />
      <StatCard icon={ClipboardList} label="Análisis realizados" value={String(summary.analysesDone)} accent="neutral" />
      <StatCard icon={Sparkles} label="Patrones fuertes" value={String(summary.strongPatterns)} accent="yellow" />
      <StatCard icon={Target} label="Valor estadístico" value={String(summary.valueBets)} accent="green" />
      <StatCard
        icon={TrendingUp}
        label="Acierto histórico"
        value={`${summary.historicalAccuracy}%`}
        hint="Dato histórico simulado"
        accent="green"
      />
      <StatCard icon={Bookmark} label="Mercados guardados" value={String(savedMarkets)} accent="neutral" />
    </section>
  );
}
