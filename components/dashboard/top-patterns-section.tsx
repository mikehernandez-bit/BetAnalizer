import { HighlightMarket } from "@/services/dashboard-service";
import { HighlightPatternCard } from "@/components/dashboard/highlight-pattern-card";
import { SectionHeader } from "@/components/shared/section-header";

export function TopPatternsSection({ highlights }: { highlights: HighlightMarket[] }) {
  if (highlights.length === 0) return null;
  return (
    <section className="space-y-4">
      <SectionHeader title="Patrones destacados" description="Coincidencias estadísticas con mayor respaldo hoy" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {highlights.map((h) => (
          <HighlightPatternCard key={h.matchId} highlight={h} />
        ))}
      </div>
    </section>
  );
}
