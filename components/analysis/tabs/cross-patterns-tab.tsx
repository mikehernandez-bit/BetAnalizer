import { CrossPattern } from "@/types";
import { CrossPatternCard } from "@/components/patterns/cross-pattern-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Shuffle } from "lucide-react";

export function CrossPatternsTab({ patterns }: { patterns: CrossPattern[] }) {
  if (patterns.length === 0) {
    return <EmptyState icon={Shuffle} title="Sin coincidencias detectadas" description="No se encontraron patrones cruzados relevantes con la muestra actual." />;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Patrones cruzados · {patterns.length} detectados</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {patterns.map((pattern) => (
          <CrossPatternCard key={pattern.id} pattern={pattern} />
        ))}
      </div>
    </div>
  );
}
