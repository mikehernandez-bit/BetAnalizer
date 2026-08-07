import { ClipboardList, CheckCircle2, XCircle, Clock, Percent, Target } from "lucide-react";
import { savedAnalyses } from "@/data/analyses";
import { StatCard } from "@/components/shared/stat-card";
import { HistoryExplorer } from "@/components/history/history-explorer";

function mostAnalyzedMarket(): string {
  const counts = new Map<string, number>();
  savedAnalyses.forEach((a) => counts.set(a.recommendedMarket, (counts.get(a.recommendedMarket) ?? 0) + 1));
  let best = "—";
  let max = 0;
  counts.forEach((count, market) => {
    if (count > max) {
      max = count;
      best = market;
    }
  });
  return best;
}

export default function HistorialPage() {
  const total = savedAnalyses.length;
  const won = savedAnalyses.filter((a) => a.status === "ganada").length;
  const lost = savedAnalyses.filter((a) => a.status === "perdida").length;
  const pending = savedAnalyses.filter((a) => a.status === "pendiente").length;
  const avgConfidence = total > 0 ? Math.round(savedAnalyses.reduce((s, a) => s + a.confidence, 0) / total) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={ClipboardList} label="Total análisis" value={String(total)} />
        <StatCard icon={CheckCircle2} label="Aciertos" value={String(won)} accent="green" />
        <StatCard icon={XCircle} label="Fallos" value={String(lost)} accent="red" />
        <StatCard icon={Clock} label="Pendientes" value={String(pending)} accent="blue" />
        <StatCard icon={Percent} label="Confianza promedio" value={`${avgConfidence}%`} accent="yellow" />
        <StatCard icon={Target} label="Mercado más analizado" value={mostAnalyzedMarket()} />
      </div>

      <p className="text-xs text-muted-foreground">
        Estos datos son simulados en esta primera versión y se utilizan únicamente con fines demostrativos.
      </p>

      <HistoryExplorer items={savedAnalyses} />
    </div>
  );
}
