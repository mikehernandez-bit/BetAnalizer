import { FileBarChart } from "lucide-react";
import { matches } from "@/data/matches";
import { AnalyzedMatchesExplorer } from "@/components/analysis/analyzed-matches-explorer";

export default function AnalysesPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green-bright">
          <FileBarChart className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Encuentros analizados</h2>
          <p className="text-sm text-muted-foreground">Selecciona un partido para revisar todos sus datos y patrones.</p>
        </div>
      </div>

      <AnalyzedMatchesExplorer matches={matches} />
    </div>
  );
}
