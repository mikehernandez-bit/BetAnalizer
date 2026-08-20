import { CircleDot } from "lucide-react";
import { TennisWorkspace } from "@/components/tennis/tennis-workspace";
import { normalizeTennisDayFilter } from "@/lib/tennis-event-groups";

export const metadata = {
  title: "Tenis — BetAnalyzer",
  description: "Análisis de mercados de tenis a partir de los últimos 20 partidos de cada jugador.",
};

export const dynamic = "force-dynamic";

export default async function TennisPage({ searchParams }: { searchParams: Promise<{ day?: string | string[] }> }) {
  const query = await searchParams;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-bright">
          <CircleDot className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Analizador de tenis</h2>
          <p className="text-sm text-muted-foreground">
            Compara 20 partidos oficiales por jugador y evalúa ganador, sets, juegos, totales y hándicaps.
          </p>
        </div>
      </div>
      <TennisWorkspace initialDay={normalizeTennisDayFilter(query.day)} />
    </div>
  );
}

