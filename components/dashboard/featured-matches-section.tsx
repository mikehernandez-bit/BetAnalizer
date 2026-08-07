import { Match } from "@/types";
import { MatchCard } from "@/components/matches/match-card";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarX } from "lucide-react";

export function FeaturedMatchesSection({ matches }: { matches: Match[] }) {
  return (
    <section className="space-y-4">
      <SectionHeader title="Encuentros cargados" description="Próximos partidos con historial y patrones disponibles" href="/analisis" />
      {matches.length === 0 ? (
        <EmptyState icon={CalendarX} title="No hay partidos próximos" description="Vuelve a intentarlo más tarde o ajusta los filtros de competición." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}
